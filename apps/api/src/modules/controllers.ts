import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApplicationsService } from "./applications.service";
import { CurrentUser, Principal, Public, Roles, SessionGuard } from "./auth";
import { AuthService } from "./auth.service";
import {
  ApplicationDto,
  PageDto,
  PostingDto,
  PostingQueryDto,
  PreferencesDto,
  ProfileDto,
  RoleDto,
  PasswordResetDto,
  PasswordResetRequestDto,
  SignInDto,
  SkillsDto,
  TransitionDto,
} from "./dto";
import { IdentityService } from "./identity.service";
import { PostingsService } from "./postings.service";
import { ProfilesService } from "./profiles.service";
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post("sign-in") @Public() async signIn(
    @Body() body: SignInDto,
    @Req() req?: { ip?: string },
  ) {
    return this.authService.signIn(body, req);
  }
  @Post("sign-out") @UseGuards(SessionGuard) async signOut(
    @CurrentUser() p: Principal,
  ) {
    return this.authService.signOut(p);
  }
  @Post("password-reset-requests") @Public() async requestPasswordReset(
    @Body() body: PasswordResetRequestDto,
    @Req() req?: { ip?: string },
  ) {
    return this.authService.requestPasswordReset(body, req);
  }
  @Post("password-resets") @Public() async resetPassword(
    @Body() body: PasswordResetDto,
  ) {
    return this.authService.resetPassword(body);
  }
}
@Controller()
export class CoreController {
  constructor(
    private readonly identityService: IdentityService,
    private readonly profilesService: ProfilesService,
    private readonly postingsService: PostingsService,
    private readonly applicationsService: ApplicationsService,
  ) {}
  @Get("health") @Public() healthcheck() {
    return this.identityService.healthcheck();
  }
  @Get("me") me(@CurrentUser() p: Principal) {
    return this.identityService.me(p);
  }
  @Put("me/active-role") async setRole(
    @CurrentUser() p: Principal,
    @Body() body: RoleDto,
  ) {
    return this.identityService.setRole(p, body);
  }
  @Get("students/me") @Roles("STUDENT") async profile(
    @CurrentUser() p: Principal,
  ) {
    return this.profilesService.profile(p);
  }
  @Patch("students/me") @Roles("STUDENT") async updateProfile(
    @CurrentUser() p: Principal,
    @Body() body: ProfileDto,
  ) {
    return this.profilesService.updateProfile(p, body);
  }
  @Get("students/me/skills") @Roles("STUDENT") async getSkills(
    @CurrentUser() p: Principal,
  ) {
    return this.profilesService.getSkills(p);
  }
  @Put("students/me/skills") @Roles("STUDENT") async setSkills(
    @CurrentUser() p: Principal,
    @Body() body: SkillsDto,
  ) {
    return this.profilesService.setSkills(p, body);
  }
  @Get("students/me/preferences") @Roles("STUDENT") async getPreferences(
    @CurrentUser() p: Principal,
  ) {
    return this.profilesService.getPreferences(p);
  }
  @Put("students/me/preferences") @Roles("STUDENT") async setPreferences(
    @CurrentUser() p: Principal,
    @Body() body: PreferencesDto,
  ) {
    return this.profilesService.setPreferences(p, body);
  }
  @Get("postings") async postingsList(
    @CurrentUser() p: Principal,
    @Query() query: PostingQueryDto = new PostingQueryDto(),
  ) {
    return this.postingsService.postingsList(p, query);
  }
  @Get("companies") async listCompanies() {
    return this.postingsService.listCompanies();
  }
  @Get("companies/:id") async company(@Param("id") id: string) {
    return this.postingsService.company(id);
  }
  @Get("postings/:id") async getPosting(
    @CurrentUser() p: Principal,
    @Param("id") id: string,
  ) {
    return this.postingsService.getPosting(p, id);
  }
  @Post("postings") @Roles("COMPANY_STAFF", "ADMIN") async createPosting(
    @CurrentUser() p: Principal,
    @Body() body: PostingDto,
  ) {
    return this.postingsService.createPosting(p, body);
  }
  @Put("postings/:id/saved") @Roles("STUDENT") async savePosting(
    @CurrentUser() p: Principal,
    @Param("id") id: string,
  ) {
    return this.postingsService.savePosting(p, id);
  }
  @Post("applications") @Roles("STUDENT") async apply(
    @CurrentUser() p: Principal,
    @Body() b: ApplicationDto,
  ) {
    return this.applicationsService.apply(p, b);
  }
  @Get("applications") async applications(
    @CurrentUser() p: Principal,
    @Query() page: PageDto,
  ) {
    return this.applicationsService.applications(p, page);
  }
  @Get("applications/:id") async application(
    @CurrentUser() p: Principal,
    @Param("id") id: string,
  ) {
    return this.applicationsService.application(p, id);
  }
  @Post("applications/:id/status")
  @Roles("COMPANY_STAFF", "ADMIN")
  async accept(
    @CurrentUser() p: Principal,
    @Param("id") id: string,
    @Body() b: TransitionDto,
  ) {
    return this.applicationsService.accept(p, id, b);
  }
  @Post("applications/:id/withdraw") @Roles("STUDENT") withdraw(
    @CurrentUser() p: Principal,
    @Param("id") id: string,
  ) {
    return this.applicationsService.withdraw(p, id);
  }
}
