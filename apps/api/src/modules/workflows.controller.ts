import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { CurrentUser, Principal, Roles } from "./auth";
import { LifecycleDto, PageDto, ScopeDto, TaskDto, TaskStatusDto } from "./dto";
import { WorkflowsService } from "./workflows.service";
@Controller()
export class WorkflowsController {
  constructor(private readonly service: WorkflowsService) {}
  @Post("postings/:id/publish") @Roles("COMPANY_STAFF", "ADMIN") publish(
    @CurrentUser() p: Principal,
    @Param("id") id: string,
  ) {
    return this.service.publish(p, id);
  }
  @Post("postings/:id/lifecycle")
  @Roles("COMPANY_STAFF", "ADMIN")
  postingLifecycle(
    @CurrentUser() p: Principal,
    @Param("id") id: string,
    @Body() b: LifecycleDto,
  ) {
    return this.service.postingLifecycle(p, id, b);
  }
  @Delete("postings/:id/saved") @Roles("STUDENT") unsave(
    @CurrentUser() p: Principal,
    @Param("id") id: string,
  ) {
    return this.service.unsave(p, id);
  }
  @Get("placements") placements(
    @CurrentUser() p: Principal,
    @Query() page: PageDto,
  ) {
    return this.service.placements(p, page);
  }
  @Get("placements/:id") placement(
    @CurrentUser() p: Principal,
    @Param("id") id: string,
  ) {
    return this.service.placement(p, id);
  }
  @Post("placements/:id/lifecycle")
  @Roles("SUPERVISOR", "ADMIN")
  placementLifecycle(
    @CurrentUser() p: Principal,
    @Param("id") id: string,
    @Body() b: LifecycleDto,
  ) {
    return this.service.placementLifecycle(p, id, b);
  }
  @Get("placements/:id/tasks") tasks(
    @CurrentUser() p: Principal,
    @Param("id") id: string,
    @Query() page: PageDto,
  ) {
    return this.service.tasks(p, id, page);
  }
  @Post("placements/:id/tasks") @Roles("SUPERVISOR", "ADMIN") createTask(
    @CurrentUser() p: Principal,
    @Param("id") id: string,
    @Body() b: TaskDto,
  ) {
    return this.service.createTask(p, id, b);
  }
  @Patch("placements/:id/tasks/:taskId/status") @Roles("STUDENT") taskStatus(
    @CurrentUser() p: Principal,
    @Param("id") id: string,
    @Param("taskId") taskId: string,
    @Body() b: TaskStatusDto,
  ) {
    return this.service.taskStatus(p, id, taskId, b.status);
  }
  @Get("notifications") notifications(
    @CurrentUser() p: Principal,
    @Query() page: PageDto,
  ) {
    return this.service.notifications(p, page);
  }
  @Post("notifications/:id/read") markRead(
    @CurrentUser() p: Principal,
    @Param("id") id: string,
  ) {
    return this.service.markRead(p, id);
  }
  @Post("notifications/mark-read") markAllRead(@CurrentUser() p: Principal) {
    return this.service.markRead(p);
  }
  @Get("monitoring") @Roles("ADMIN") monitoring(@Query() scope: ScopeDto) {
    return this.service.monitoring(scope);
  }
  @Get("companies/mine") @Roles("COMPANY_STAFF", "ADMIN") companies(
    @CurrentUser() p: Principal,
  ) {
    return this.service.companies(p);
  }
}
