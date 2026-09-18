const fs = require("fs"),
  ts = require("../apps/api/node_modules/typescript");
let errors = [];
for (const name of fs
  .readdirSync("apps/api/src/modules")
  .filter((n) => n.endsWith("controller.ts") || n === "controllers.ts")) {
  const sf = ts.createSourceFile(
    name,
    fs.readFileSync("apps/api/src/modules/" + name, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  function visit(node) {
    if (
      ts.isParameter(node) &&
      (ts.getDecorators(node) || []).some(
        (d) => d.expression.expression?.getText(sf) === "Body",
      ) &&
      !/Dto$/.test(node.type?.getText(sf) ?? "")
    )
      errors.push(`${name}: Body must use a validated DTO`);
    ts.forEachChild(node, visit);
  }
  visit(sf);
  if (/InjectRepository/.test(sf.text))
    errors.push(`${name}: controllers must delegate persistence to services`);
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Controller validation and persistence boundaries pass.");
