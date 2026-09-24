describe("data source configuration", () => {
  it("uses PostgreSQL with the complete entity and migration registry", async () => {
    jest.resetModules();
    const actual = jest.requireActual("typeorm");
    const DataSource = jest.fn().mockImplementation(function (
      this: any,
      options: any,
    ) {
      this.options = options;
    });
    jest.doMock("typeorm", () => ({ ...actual, DataSource }));
    const source = (await import("../src/infrastructure/database/data-source"))
      .default as any;
    expect(DataSource).toHaveBeenCalledTimes(1);
    expect(source.options).toMatchObject({
      type: "postgres",
      synchronize: false,
    });
    expect(source.options.entities.length).toBeGreaterThan(10);
    expect(source.options.migrations).toHaveLength(8);
    expect(source.options.url).toContain("postgresql://");
  });
});
