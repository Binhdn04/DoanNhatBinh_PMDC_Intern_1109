import { ConfigModule } from "@nestjs/config";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { entities } from "./entities";
import { InitialSchema1770000000000 } from "./migrations/1770000000000-initial-schema";
import { CanonicalWorkflows1770000001000 } from "./migrations/1770000001000-canonical-workflows";
import { WorkflowHardening1770000002000 } from "./migrations/1770000002000-workflow-hardening";
import { PrepareCanonicalCutover1770000002500 } from "./migrations/1770000002500-prepare-canonical-cutover";
import { CompleteCanonicalSchema1770000003000 } from "./migrations/1770000003000-complete-canonical-schema";
import { Integrity1770000004000 } from "./migrations/1770000004000-integrity";
ConfigModule.forRoot();
export default new DataSource({
  type: "postgres",
  url:
    process.env.DATABASE_URL ??
    "postgresql://internhub:internhub@localhost:5432/internhub",
  entities,
  migrations: [
    InitialSchema1770000000000,
    CanonicalWorkflows1770000001000,
    WorkflowHardening1770000002000,
    PrepareCanonicalCutover1770000002500,
    CompleteCanonicalSchema1770000003000,
    Integrity1770000004000,
  ],
  synchronize: false,
});
