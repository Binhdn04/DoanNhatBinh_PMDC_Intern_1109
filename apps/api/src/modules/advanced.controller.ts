import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { AiService } from "./ai.service";
import { AssessmentsService } from "./assessments.service";
import { CurrentUser, Principal, Roles } from "./auth";
import { DocumentsService } from "./documents.service";
import {
  AiDto,
  AssessmentDto,
  AssignmentDto,
  DocumentDto,
  ReportDto,
  ReviewDto,
  SupervisorQueryDto,
} from "./dto";
import { ReportsService } from "./reports.service";
import { SupervisorsService } from "./supervisors.service";
import { AdminService } from "./admin.service";
import {
  AdminAccountDto,
  AdminMembershipsDto,
  AdminRolesDto,
  AdminUserQueryDto,
} from "./dto";
@Controller()
export class AdvancedController {
  constructor(
    private readonly supervisorsService: SupervisorsService,
    private readonly documentsService: DocumentsService,
    private readonly reportsService: ReportsService,
    private readonly assessmentsService: AssessmentsService,
    private readonly aiService: AiService,
    private readonly adminService: AdminService,
  ) {}
  @Get("admin/users") @Roles("ADMIN") async adminUsers(
    @Query() query: AdminUserQueryDto,
  ) {
    return this.adminService.list(query);
  }
  @Get("admin/users/:userId") @Roles("ADMIN") async adminUser(
    @Param("userId") id: string,
  ) {
    return this.adminService.get(id);
  }
  @Patch("admin/users/:userId/account") @Roles("ADMIN") async updateAccount(
    @CurrentUser() p: Principal,
    @Param("userId") id: string,
    @Body() body: AdminAccountDto,
  ) {
    return this.adminService.updateAccount(p, id, body);
  }
  @Put("admin/users/:userId/roles") @Roles("ADMIN") async updateRoles(
    @CurrentUser() p: Principal,
    @Param("userId") id: string,
    @Body() body: AdminRolesDto,
  ) {
    return this.adminService.updateRoles(p, id, body);
  }
  @Put("admin/users/:userId/company-memberships")
  @Roles("ADMIN")
  async updateMemberships(
    @CurrentUser() p: Principal,
    @Param("userId") id: string,
    @Body() body: AdminMembershipsDto,
  ) {
    return this.adminService.updateMemberships(p, id, body);
  }
  @Get("supervisors") @Roles("COMPANY_STAFF", "ADMIN") async supervisors(
    @CurrentUser() p: Principal,
    @Query() query: SupervisorQueryDto,
  ) {
    return this.supervisorsService.supervisors(p, query);
  }
  @Get("placements/:placementId/supervisor-assignments")
  @Roles("ADMIN")
  async assignmentHistory(@Param("placementId") id: string) {
    return this.supervisorsService.assignmentHistory(id);
  }
  @Put("placements/:placementId/supervisor-assignments")
  @Roles("ADMIN")
  async changeAssignment(
    @CurrentUser() p: Principal,
    @Param("placementId") id: string,
    @Body() body: AssignmentDto,
  ) {
    return this.supervisorsService.changeAssignment(p, id, body);
  }
  @Get("documents") @Roles("STUDENT") async listDocuments(
    @CurrentUser() p: Principal,
  ) {
    return this.documentsService.listDocuments(p);
  }
  @Post("documents") @Roles("STUDENT") async beginDocument(
    @CurrentUser() p: Principal,
    @Body() body: DocumentDto,
  ) {
    return this.documentsService.beginDocument(p, body);
  }
  @Put("documents/:documentId/content")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles("STUDENT")
  async uploadDocument(
    @CurrentUser() p: Principal,
    @Param("documentId") id: string,
    @Query("transferToken") token: string,
    @Req() req: Request,
  ) {
    return this.documentsService.uploadDocument(p, id, token, req);
  }
  @Post("documents/:documentId/complete")
  @Roles("STUDENT")
  async completeDocument(
    @CurrentUser() p: Principal,
    @Param("documentId") id: string,
  ) {
    return this.documentsService.completeDocument(p, id);
  }
  @Delete("documents/:documentId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles("STUDENT")
  async deleteDocument(
    @CurrentUser() p: Principal,
    @Param("documentId") id: string,
  ) {
    return this.documentsService.deleteDocument(p, id);
  }
  @Get("documents/:documentId/download-url") async downloadUrl(
    @CurrentUser() p: Principal,
    @Param("documentId") id: string,
  ) {
    return this.documentsService.downloadUrl(p, id);
  }
  @Get("documents/:documentId/content") async downloadDocument(
    @CurrentUser() p: Principal,
    @Param("documentId") id: string,
    @Query("transferToken") token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.documentsService.downloadDocument(p, id, token, res);
  }
  @Get("placements/:placementId/reporting-periods") async listPeriods(
    @CurrentUser() p: Principal,
    @Param("placementId") id: string,
  ) {
    return this.reportsService.listPeriods(p, id);
  }
  @Get("placements/:placementId/reports") async listReports(
    @CurrentUser() p: Principal,
    @Param("placementId") placementId: string,
  ) {
    return this.reportsService.listReports(p, placementId);
  }
  @Post("placements/:placementId/reports") @Roles("STUDENT") async createDraft(
    @CurrentUser() p: Principal,
    @Param("placementId") placementId: string,
    @Body() body: ReportDto,
  ) {
    return this.reportsService.createDraft(p, placementId, body);
  }
  @Get("reports/:reportId") async getReport(
    @CurrentUser() p: Principal,
    @Param("reportId") id: string,
  ) {
    return this.reportsService.getReport(p, id);
  }
  @Patch("reports/:reportId") @Roles("STUDENT") async patchReport(
    @CurrentUser() p: Principal,
    @Param("reportId") id: string,
    @Body() body: ReportDto,
  ) {
    return this.reportsService.patchReport(p, id, body);
  }
  @Post("reports/:reportId/submit") @Roles("STUDENT") async submitReport(
    @CurrentUser() p: Principal,
    @Param("reportId") id: string,
  ) {
    return this.reportsService.submitReport(p, id);
  }
  @Post("reports/:reportId/reviews")
  @Roles("SUPERVISOR", "ADMIN")
  async reviewReport(
    @CurrentUser() p: Principal,
    @Param("reportId") id: string,
    @Body() body: ReviewDto,
  ) {
    return this.reportsService.reviewReport(p, id, body);
  }
  @Get("placements/:placementId/self-assessment") async getSelf(
    @CurrentUser() p: Principal,
    @Param("placementId") id: string,
  ) {
    return this.assessmentsService.getSelf(p, id);
  }
  @Put("placements/:placementId/self-assessment")
  @Roles("STUDENT")
  async putSelf(
    @CurrentUser() p: Principal,
    @Param("placementId") id: string,
    @Body() body: AssessmentDto,
  ) {
    return this.assessmentsService.putSelf(p, id, body);
  }
  @Get("placements/:placementId/performance-evaluation")
  @Roles("STUDENT", "SUPERVISOR", "ADMIN")
  async getEvaluation(
    @CurrentUser() p: Principal,
    @Param("placementId") id: string,
  ) {
    return this.assessmentsService.getEvaluation(p, id);
  }
  @Put("placements/:placementId/performance-evaluation")
  @Roles("SUPERVISOR", "ADMIN")
  async putEvaluation(
    @CurrentUser() p: Principal,
    @Param("placementId") id: string,
    @Body() body: AssessmentDto,
  ) {
    return this.assessmentsService.putEvaluation(p, id, body);
  }
  @Post("ai-jobs") async createAiJob(
    @CurrentUser() p: Principal,
    @Body() body: AiDto,
  ): Promise<never> {
    return this.aiService.createAiJob(p, body);
  }
  @Get("ai-jobs/:aiJobId") async getAiJob(
    @CurrentUser() p: Principal,
    @Param("aiJobId") id: string,
  ) {
    return this.aiService.getAiJob(p, id);
  }
}
