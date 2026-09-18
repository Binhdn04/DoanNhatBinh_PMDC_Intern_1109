import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { Principal } from "./auth";
import { AiDto } from "./dto";
/** No jobs are accepted or exposed until a fenced, retryable worker is shipped. */
@Injectable()
export class AiService {
  async createAiJob(_principal: Principal, _body: AiDto): Promise<never> {
    throw new ServiceUnavailableException(
      "Optional AI is disabled until a worker is deployed",
    );
  }
  async getAiJob(_principal: Principal, _id: string): Promise<never> {
    throw new ServiceUnavailableException(
      "Optional AI is disabled until a worker is deployed",
    );
  }
}
