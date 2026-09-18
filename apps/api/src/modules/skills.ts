import { BadRequestException } from "@nestjs/common";
import { EntityManager } from "typeorm";
import { Skill } from "../infrastructure/database/entities";
import { normalizeCanonicalSkill } from "../infrastructure/database/canonical-backfill";
export async function resolveSkill(
  x: { id?: string; name?: string },
  m: EntityManager,
) {
  if (x.id) {
    const e = await m.getRepository(Skill).findOneBy({ id: x.id });
    if (e) return e;
    throw new BadRequestException("Unknown skill");
  }
  const normalizedName = normalizeCanonicalSkill(x.name);
  if (!normalizedName) throw new BadRequestException("Invalid skill");
  const r = m.getRepository(Skill);
  await r
    .createQueryBuilder()
    .insert()
    .values({
      name: x.name!.normalize("NFKC").trim().replace(/\s+/gu, " "),
      normalizedName,
    })
    .orIgnore()
    .execute();
  return r.findOneByOrFail({ normalizedName });
}
