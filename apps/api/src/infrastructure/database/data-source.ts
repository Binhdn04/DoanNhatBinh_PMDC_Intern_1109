import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { entities } from './entities';
import { InitialSchema1770000000000 } from './migrations/1770000000000-initial-schema';
import { CanonicalWorkflows1770000001000 } from './migrations/1770000001000-canonical-workflows';
export default new DataSource({ type: 'postgres', url: process.env.DATABASE_URL ?? 'postgresql://internhub:internhub@localhost:5432/internhub', entities, migrations: [InitialSchema1770000000000, CanonicalWorkflows1770000001000], synchronize: false });
