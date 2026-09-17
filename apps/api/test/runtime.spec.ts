import { ValidationPipe } from '@nestjs/common';

describe('runtime seams', () => {
  afterEach(() => jest.resetModules());

  it('bootstraps Nest with the public API configuration', async () => {
    const app = { setGlobalPrefix: jest.fn(), enableCors: jest.fn(), useGlobalPipes: jest.fn(), useGlobalFilters: jest.fn(), listen: jest.fn().mockResolvedValue(undefined) };
    jest.doMock('@nestjs/core', () => ({ NestFactory: { create: jest.fn().mockResolvedValue(app) } }));
    const { bootstrap } = await import('../src/main');
    await bootstrap();
    expect(app.setGlobalPrefix).toHaveBeenCalledWith('api/v1');
    expect(app.enableCors).toHaveBeenCalled();
    expect(app.useGlobalPipes.mock.calls[0][0]).toBeInstanceOf(ValidationPipe);
    expect(app.useGlobalFilters).toHaveBeenCalledTimes(1);
    expect(app.listen).toHaveBeenCalledWith(3000);
  });

  it('seeds absent records and always closes the data source', async () => {
    const repositories = new Map<unknown, any>();
    const repository = () => ({ findOneBy: jest.fn().mockResolvedValue(null), save: jest.fn(async value => ({ id: value.email ?? value.name ?? value.code ?? value.userId, ...value })), upsert: jest.fn().mockResolvedValue(undefined) });
    jest.doMock('bcrypt', () => ({ hash: jest.fn().mockResolvedValue('hash') }));
    jest.doMock('../src/infrastructure/database/data-source', () => ({ __esModule: true, default: { initialize: jest.fn(), destroy: jest.fn(), getRepository: jest.fn((entity: unknown) => { if (!repositories.has(entity)) repositories.set(entity, repository()); return repositories.get(entity); }) } }));
    const source = (await import('../src/infrastructure/database/data-source')).default as any;
    const { seed } = await import('../src/infrastructure/database/seed');
    await seed();
    expect(source.initialize).toHaveBeenCalledTimes(1);
    expect(source.getRepository).toHaveBeenCalled();
    expect(source.destroy).toHaveBeenCalledTimes(1);
    expect([...repositories.values()].some((item: any) => item.upsert.mock.calls.length)).toBe(true);
  });
});
