const ts = require("../apps/api/node_modules/typescript"),
  fs = require("fs"),
  path = require("path");
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(f);
    else if (/\.tsx?$/.test(f)) files.push(path.resolve(f));
  }
}
walk("apps/api/src");
walk("apps/web/src");
for (const file of files.filter(
  (f) =>
    f.endsWith(".service.ts") ||
    f.endsWith("controllers.ts") ||
    f.endsWith("advanced.controller.ts"),
)) {
  let text = fs.readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const candidates = sf.statements.filter(
    (n) => ts.isFunctionDeclaration(n) || ts.isVariableStatement(n),
  );
  let used = sf.statements
      .filter(ts.isClassDeclaration)
      .map((n) => n.getText(sf))
      .join("\n"),
    chosen = new Set();
  let changed = true;
  while (changed) {
    changed = false;
    for (const n of candidates) {
      const name = ts.isFunctionDeclaration(n)
        ? n.name?.text
        : n.declarationList.declarations[0].name.getText(sf);
      if (
        name &&
        new RegExp("\\b" + name + "\\b").test(used) &&
        !chosen.has(n)
      ) {
        chosen.add(n);
        used += "\n" + n.getText(sf);
        changed = true;
      }
    }
  }
  for (const n of candidates
    .filter((n) => !chosen.has(n))
    .sort((a, b) => b.pos - a.pos))
    text = text.slice(0, n.pos) + text.slice(n.end);
  fs.writeFileSync(file, text);
}
const host = {
  getScriptFileNames: () => files,
  getScriptVersion: () => "0",
  getScriptSnapshot: (f) =>
    fs.existsSync(f)
      ? ts.ScriptSnapshot.fromString(fs.readFileSync(f, "utf8"))
      : undefined,
  getCurrentDirectory: () => process.cwd(),
  getCompilationSettings: () => ({
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  }),
  getDefaultLibFileName: (o) => ts.getDefaultLibFilePath(o),
  fileExists: fs.existsSync,
  readFile: (f) => (fs.existsSync(f) ? fs.readFileSync(f, "utf8") : undefined),
  readDirectory: ts.sys.readDirectory,
};
const service = ts.createLanguageService(host);
for (const file of files) {
  for (const change of service.organizeImports(
    { type: "file", fileName: file },
    {},
    {},
  )) {
    let text = fs.readFileSync(change.fileName, "utf8");
    for (const c of change.textChanges.sort(
      (a, b) => b.span.start - a.span.start,
    ))
      text =
        text.slice(0, c.span.start) +
        c.newText +
        text.slice(c.span.start + c.span.length);
    fs.writeFileSync(change.fileName, text);
  }
}
