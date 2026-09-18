import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  StreamableFile,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import type { Request, Response } from "express";
import { createHash, randomUUID } from "node:crypto";
import { Transform } from "node:stream";
import { DataSource, In, Repository } from "typeorm";
import {
  Application,
  ApplicationDocument,
  Document,
  Placement,
  Posting,
  ReportDraftDocument,
  ReportVersion,
  ReportVersionDocument,
  StudentDocument,
  WeeklyReport,
} from "../infrastructure/database/entities";
import { AccessService } from "./access.service";
import { Principal } from "./auth";
import { DocumentDto } from "./dto";
import { PrivateStorageService } from "./private-storage.service";
const MAX_FILE = 10 * 1024 * 1024;
const trim = (value?: string) => value?.trim() || undefined;
const size = (n?: string) => Math.min(100, Math.max(1, Number(n ?? 20) || 20));
function signatureMatches(bytes: Buffer, type: string) {
  if (type === "application/pdf")
    return bytes.subarray(0, 5).toString() === "%PDF-";
  if (type === "image/jpeg")
    return bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
  if (type === "image/png")
    return bytes
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  return (
    type.includes("wordprocessingml") &&
    bytes.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]))
  );
}
function countBy(rows: any[], field: string) {
  return rows.reduce(
    (out, row) => ({ ...out, [row[field]]: (out[row[field]] ?? 0) + 1 }),
    {} as Record<string, number>,
  );
}
@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Application)
    private applications: Repository<Application>,
    @InjectRepository(ApplicationDocument)
    private applicationDocs: Repository<ApplicationDocument>,
    @InjectRepository(Posting) private postings: Repository<Posting>,
    @InjectRepository(Placement) private placements: Repository<Placement>,
    @InjectRepository(Document) private documents: Repository<Document>,
    @InjectRepository(StudentDocument)
    private studentDocuments: Repository<StudentDocument>,
    @InjectRepository(WeeklyReport) private reports: Repository<WeeklyReport>,
    @InjectRepository(ReportVersion)
    private versions: Repository<ReportVersion>,
    @InjectRepository(ReportDraftDocument)
    private draftDocs: Repository<ReportDraftDocument>,
    @InjectRepository(ReportVersionDocument)
    private versionDocs: Repository<ReportVersionDocument>,
    private storage: PrivateStorageService,
    private jwt: JwtService,
    private dataSource: DataSource,
    private access: AccessService,
  ) {}

  async listDocuments(p: Principal) {
    const links = await this.studentDocuments.findBy({ studentId: p.id });
    return {
      items: (
        await this.documents.findBy({ id: In(links.map((x) => x.documentId)) })
      )
        .filter((x) => x.state !== "DELETED")
        .map((x) => this.documentDto(x)),
    };
  }
  async beginDocument(p: Principal, body: DocumentDto) {
    if (
      !trim(body.originalName) ||
      ![
        "application/pdf",
        "image/jpeg",
        "image/png",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ].includes(body.contentType) ||
      !Number.isInteger(body.sizeBytes) ||
      body.sizeBytes < 1 ||
      body.sizeBytes > MAX_FILE ||
      !/^[a-f0-9]{64}$/i.test(body.sha256 ?? "")
    )
      throw new BadRequestException("Invalid document metadata");
    const doc = await this.dataSource.transaction(async (manager) => {
      const doc = await manager.getRepository(Document).save({
        ownerUserId: p.id,
        objectKey: `documents/${p.id}/${randomUUID()}`,
        originalName: body.originalName.trim(),
        contentType: body.contentType,
        sizeBytes: String(body.sizeBytes),
        sha256: body.sha256.toLowerCase(),
        state: "PENDING",
      });
      await manager.getRepository(StudentDocument).save({
        studentId: p.id,
        documentId: doc.id,
        kind: body.kind ?? "OTHER",
      });
      return doc;
    });
    const token = await this.jwt.signAsync(
      {
        sid: p.sid,
        documentId: doc.id,
        method: "PUT",
        size: body.sizeBytes,
        sha256: doc.sha256,
        contentType: doc.contentType,
      },
      {
        secret:
          process.env.UPLOAD_TOKEN_SECRET ??
          process.env.JWT_SECRET ??
          "development-transfer-secret",
        expiresIn: "5m",
      },
    );
    return {
      document: this.documentDto(doc),
      uploadUrl: `/api/v1/documents/${doc.id}/content?transferToken=${token}`,
      expiresAt: new Date(Date.now() + 300000),
    };
  }

  async uploadDocument(p: Principal, id: string, token: string, req: Request) {
    return this.dataSource.transaction(async (manager) => {
      const doc = await manager
        .getRepository(Document)
        .createQueryBuilder("d")
        .setLock("pessimistic_write")
        .where("d.id=:id AND d.owner_user_id=:owner", { id, owner: p.id })
        .getOne();
      if (!doc || doc.state !== "PENDING")
        throw new ConflictException("Document is not uploadable");
      const claim = await this.transferClaim(token, p, id, "PUT");
      if (
        claim.size !== Number(doc.sizeBytes) ||
        claim.sha256 !== doc.sha256 ||
        claim.contentType !== doc.contentType
      )
        throw new ForbiddenException("Transfer token does not match document");
      const verifier = new UploadVerifier(
        Number(doc.sizeBytes),
        doc.sha256,
        doc.contentType,
      );
      const abort = () =>
        verifier.destroy(new BadRequestException("Upload interrupted"));
      req.once("aborted", abort);
      req.once("error", abort);
      req.pipe(verifier);
      await this.storage.putStream(
        doc.objectKey,
        verifier,
        Number(doc.sizeBytes),
        doc.contentType,
      );
      verifier.assertValid();
    });
  }

  async completeDocument(p: Principal, id: string) {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Document);
      const doc = await repo
        .createQueryBuilder("d")
        .setLock("pessimistic_write")
        .where("d.id = :id AND d.owner_user_id = :owner", { id, owner: p.id })
        .getOne();
      if (!doc) throw new NotFoundException();
      if (doc.state === "AVAILABLE") return this.documentDto(doc);
      if (doc.state !== "PENDING")
        throw new ConflictException("Document rejected");
      try {
        const actual = await this.storage.verify(doc.objectKey);
        if (
          actual.size !== Number(doc.sizeBytes) ||
          actual.sha256 !== doc.sha256 ||
          !signatureMatches(actual.signature, doc.contentType)
        )
          throw new Error("invalid object");
        doc.state = "AVAILABLE";
      } catch {
        doc.state = "REJECTED";
      }
      return this.documentDto(await repo.save(doc));
    });
  }

  async deleteDocument(p: Principal, id: string) {
    const key = await this.dataSource.transaction(async (manager) => {
      const doc = await manager
        .getRepository(Document)
        .createQueryBuilder("d")
        .setLock("pessimistic_write")
        .where("d.id = :id AND d.owner_user_id = :owner", { id, owner: p.id })
        .getOne();
      if (!doc) throw new NotFoundException();
      const retained = [
        await manager.getRepository(ReportDraftDocument).countBy({ documentId: id }),
        await manager
          .getRepository(ReportVersionDocument)
          .countBy({ documentId: id }),
        await manager.getRepository(ApplicationDocument).countBy({ documentId: id }),
        await manager.getRepository(Application).countBy({ cvDocumentId: id }),
      ];
      if (retained.some(Boolean))
        throw new ConflictException("Document is retained");
      doc.state = "DELETED";
      await manager.save(doc);
      return doc.objectKey;
    });
    await this.storage.remove(key).catch(() => undefined);
  }
  async downloadUrl(p: Principal, id: string) {
    await this.documentAccess(p, id);
    const token = await this.jwt.signAsync(
      { sid: p.sid, documentId: id, method: "GET" },
      {
        secret:
          process.env.UPLOAD_TOKEN_SECRET ??
          process.env.JWT_SECRET ??
          "development-transfer-secret",
        expiresIn: "5m",
      },
    );
    return {
      url: `/api/v1/documents/${id}/content?transferToken=${token}`,
      expiresAt: new Date(Date.now() + 300000),
    };
  }
  async downloadDocument(
    p: Principal,
    id: string,
    token: string,
    res: Response,
  ) {
    const doc = await this.documentAccess(p, id);
    await this.transferClaim(token, p, id, "GET");
    res.set({
      "Content-Type": doc.contentType,
      "Content-Disposition": `attachment; filename="${doc.originalName.replace(/[\\\"]/g, "_")}"`,
      "Cache-Control": "private, no-store",
    });
    return new StreamableFile(await this.storage.get(doc.objectKey));
  }
  private async placementAccess(p: Principal, id: string) {
    return this.access.placement(p, id);
  }
  private async companyAccess(p: Principal, companyId?: string) {
    if (!companyId) throw new ForbiddenException();
    return this.access.company(p, companyId);
  }
  private async documentAccess(p: Principal, id: string): Promise<Document> {
    const doc = await this.documents.findOneBy({ id, state: "AVAILABLE" });
    if (!doc) throw new NotFoundException();
    if (doc.ownerUserId === p.id) return doc;
    const applications = await this.dataSource.query(
      `SELECT DISTINCT a.id FROM applications a WHERE a.student_id=$2 AND (a.cv_document_id=$1 OR EXISTS(SELECT 1 FROM application_documents d WHERE d.application_id=a.id AND d.document_id=$1))`,
      [id, doc.ownerUserId],
    );
    for (const application of applications) {
      try {
        await this.access.application(p, application.id);
        return doc;
      } catch (error) {
        if (!(
          error instanceof ForbiddenException ||
          error instanceof NotFoundException
        ))
          throw error;
      }
    }
    const placements = await this.dataSource.query(
      `SELECT DISTINCT r.placement_id AS id FROM report_version_documents d JOIN report_versions v ON v.id=d.report_version_id JOIN weekly_reports r ON r.id=v.report_id JOIN placements p ON p.id=r.placement_id WHERE d.document_id=$1 AND p.student_id=$2`,
      [id, doc.ownerUserId],
    );
    for (const placement of placements) {
      try {
        await this.access.placement(p, placement.id);
        return doc;
      } catch (error) {
        if (!(
          error instanceof ForbiddenException ||
          error instanceof NotFoundException
        ))
          throw error;
      }
    }
    if (applications.length || placements.length)
      throw new ForbiddenException();
    throw new NotFoundException();
  }
  private async transferClaim(
    token: string,
    p: Principal,
    id: string,
    method: "PUT" | "GET",
  ) {
    try {
      const claim: any = await this.jwt.verifyAsync(token, {
        secret:
          process.env.UPLOAD_TOKEN_SECRET ??
          process.env.JWT_SECRET ??
          "development-transfer-secret",
      });
      if (
        !claim.exp ||
        claim.exp * 1000 <= Date.now() ||
        claim.sid !== p.sid ||
        claim.documentId !== id ||
        claim.method !== method
      )
        throw new Error("mismatch");
      return claim;
    } catch {
      throw new ForbiddenException("Invalid or expired transfer token");
    }
  }
  private documentDto(doc: Document) {
    const { objectKey: _key, ownerUserId: _owner, ...safe } = doc;
    return safe;
  }
}
class UploadVerifier extends Transform {
  private readonly hash = createHash("sha256");
  private readonly head: Buffer[] = [];
  private headSize = 0;
  private total = 0;
  constructor(
    private readonly expectedSize: number,
    private readonly expectedHash: string,
    private readonly contentType: string,
  ) {
    super();
  }
  _transform(
    chunk: Buffer,
    _encoding: BufferEncoding,
    callback: (error?: Error | null, data?: Buffer) => void,
  ) {
    const bytes = Buffer.from(chunk);
    this.total += bytes.length;
    if (this.total > MAX_FILE || this.total > this.expectedSize)
      return callback(new BadRequestException("File too large"));
    this.hash.update(bytes);
    if (this.headSize < 8) {
      const part = bytes.subarray(0, 8 - this.headSize);
      this.head.push(part);
      this.headSize += part.length;
    }
    callback(null, bytes);
  }
  assertValid() {
    if (
      this.total !== this.expectedSize ||
      this.hash.digest("hex") !== this.expectedHash ||
      !signatureMatches(Buffer.concat(this.head), this.contentType)
    )
      throw new BadRequestException("Bytes do not match declared document");
  }
}
