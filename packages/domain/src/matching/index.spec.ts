import { calculateMatchScore, normalizeSkill } from './index';
describe('skill-v1 match score', () => {
  const skills = [{ id: 'java', name: 'Java', importance: 'REQUIRED' as const }, { id: 'sql', name: 'SQL', importance: 'OPTIONAL' as const }];
  it('normalizes Unicode whitespace and case', () => expect(normalizeSkill('  JAVA\u00a0Script ')).toBe('java script'));
  it('uses required weight two and rounds halves upward', () => expect(calculateMatchScore(['java'], skills)).toMatchObject({ score: 67, matchedSkills: ['Java'], missingSkills: ['SQL'] }));
  it('returns the explicit no-posting-skills outcome', () => expect(calculateMatchScore(['java'], [])).toMatchObject({ score: 0, reason: 'NO_POSTING_SKILLS' }));
});
