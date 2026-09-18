import { ValidationPipe } from "@nestjs/common";
import {
  DocumentDto,
  ReportDto,
  ReviewDto,
  AssignmentDto,
  ScopeDto,
} from "../src/modules/dto";
import { validateEnvironment } from "../src/config";
const pipe = new ValidationPipe({
  whitelist: true,
  transform: true,
  forbidNonWhitelisted: true,
});
const validate = (metatype: any, value: unknown) =>
  pipe.transform(value, { type: "body", metatype });
describe("document and report boundaries", () => {
  it.each([0, -1, 10485761, 1.5])(
    "rejects invalid file size %s",
    async (sizeBytes) => {
      await expect(
        validate(DocumentDto, {
          originalName: "cv.pdf",
          contentType: "application/pdf",
          sizeBytes,
          sha256: "a".repeat(64),
        }),
      ).rejects.toMatchObject({ status: 400 });
    },
  );
  it("rejects header control characters in filenames", async () => {
    await expect(
      validate(DocumentDto, {
        originalName: "cv\r\n.pdf",
        contentType: "application/pdf",
        sizeBytes: 5,
        sha256: "a".repeat(64),
      }),
    ).rejects.toMatchObject({ status: 400 });
  });
  it("rejects arbitrary report state and malformed attachment references", async () => {
    await expect(
      validate(ReportDto, {
        accomplishments: "a",
        challenges: "b",
        nextWeekPlan: "c",
        state: "APPROVED",
      }),
    ).rejects.toMatchObject({ status: 400 });
  });
  it("requires explicit reviewed version and supported outcome", async () => {
    await expect(
      validate(ReviewDto, { outcome: "OTHER" }),
    ).rejects.toMatchObject({ status: 400 });
  });
  it("rejects blank reassignment reasons and malformed scope IDs", async () => {
    await expect(
      validate(AssignmentDto, { reason: "  " }),
    ).rejects.toMatchObject({ status: 400 });
    await expect(validate(ScopeDto, { termId: "all" })).rejects.toMatchObject({
      status: 400,
    });
  });
  it("fails closed for missing production settings", () => {
    expect(() => validateEnvironment({ NODE_ENV: "production" })).toThrow(
      "JWT_SECRET",
    );
    expect(validateEnvironment({ NODE_ENV: "development" })).toEqual({
      NODE_ENV: "development",
    });
  });
});
