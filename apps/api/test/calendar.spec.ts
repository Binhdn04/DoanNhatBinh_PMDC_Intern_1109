import { reportingPeriods } from '../src/modules/calendar';

describe('reportingPeriods', () => {
  it('materializes every Monday-Sunday week overlapping a partial placement', () => {
    const periods = reportingPeriods('2026-09-16', '2026-09-22', 'Asia/Ho_Chi_Minh');
    expect(periods.map(x => [x.weekStart, x.weekEnd])).toEqual([['2026-09-14', '2026-09-20'], ['2026-09-21', '2026-09-27']]);
    expect(periods[0].dueAt.toISOString()).toBe('2026-09-20T17:00:00.000Z');
  });
});
