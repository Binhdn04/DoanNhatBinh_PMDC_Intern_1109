const fs = require("fs"),
  ts = require("../apps/api/node_modules/typescript");
const spec = fs.readFileSync("docs/api/openapi.yaml", "utf8");
const documented = new Set();
let path;
for (const line of spec.split("\n")) {
  const route = line.match(/^  (\/.*):$/);
  if (route) path = route[1];
  const method = line.match(/^    (get|post|put|patch|delete):$/);
  if (method && path)
    documented.add(method[1] + " " + path.replace(/\{[^}]+\}/g, "{}"));
}
const implemented = new Set();
for (const file of [
  "controllers.ts",
  "advanced.controller.ts",
  "workflows.controller.ts",
]) {
  const sf = ts.createSourceFile(
    file,
    fs.readFileSync("apps/api/src/modules/" + file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  for (const cls of sf.statements.filter(ts.isClassDeclaration)) {
    const decorator = (ts.getDecorators(cls) || []).find(
      (d) => d.expression.expression?.getText(sf) === "Controller",
    );
    const prefix = decorator?.expression.arguments[0]?.text ?? "";
    for (const method of cls.members.filter(ts.isMethodDeclaration))
      for (const d of ts.getDecorators(method) || []) {
        const name = d.expression.expression?.getText(sf);
        if (["Get", "Post", "Put", "Patch", "Delete"].includes(name))
          implemented.add(
            name.toLowerCase() +
              " /" +
              [prefix, d.expression.arguments[0]?.text]
                .filter(Boolean)
                .join("/")
                .replace(/:[A-Za-z]+/g, "{}"),
          );
      }
  }
}
const missing = [...implemented].filter((x) => !documented.has(x)),
  extra = [...documented].filter((x) => !implemented.has(x));
if (missing.length || extra.length) {
  console.error({ missing, extra });
  process.exit(1);
}
console.log(`Contract paths match ${implemented.size} implemented operations.`);
