import { Injectable } from "@nestjs/common";

@Injectable()
export class SchedulerHealthService {
  private lastSuccess?: Date;
  private lastError?: Date;
  success() {
    this.lastSuccess = new Date();
  }
  failure() {
    this.lastError = new Date();
  }
  snapshot() {
    const ageMs = this.lastSuccess
      ? Date.now() - this.lastSuccess.getTime()
      : undefined;
    return {
      fresh: ageMs !== undefined && ageMs <= 5 * 60_000,
      lastSuccess: this.lastSuccess,
      lastError: this.lastError,
      ageMs,
    };
  }
}
