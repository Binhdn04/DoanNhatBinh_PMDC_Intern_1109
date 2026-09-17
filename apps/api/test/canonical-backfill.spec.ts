import { canonicalRoles, mapLegacySkills, normalizeCanonicalSkill } from '../src/infrastructure/database/canonical-backfill';

describe('canonical legacy mapper', () => {
  it('normalizes roles and discards unsupported values', () => {
    expect(canonicalRoles('student, ADMIN, bad, student')).toEqual(['STUDENT', 'ADMIN']);
  });
  it('normalizes and deduplicates valid skill input', () => {
    const result = mapLegacySkills([{ name: ' Java  Script ', proficiency: 'advanced' }, { name: 'java script' }, { name: '' }], 'student');
    expect(result.accepted).toEqual([{ name: 'Java Script', normalizedName: 'java script', proficiency: 'ADVANCED', importance: undefined }]);
    expect(result.rejected.map(x => x.reason)).toEqual(['DUPLICATE_NORMALIZED_SKILL', 'INVALID_SKILL_NAME']);
    expect(normalizeCanonicalSkill('  Café\tScript ')).toBe('café script');
  });
  it('quarantines malformed legacy skill containers', () => {
    expect(mapLegacySkills({ name: 'SQL' }, 'posting').rejected[0].reason).toBe('NOT_AN_ARRAY');
  });
});
