// `npm run core:lock` — run by the kit hosts only, after core files are
// final. Writes core.lock.json: a sha256 of every core file and of the
// shipped prompt templates. `npm run check` compares against it.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { coreFiles, TEMPLATE_FILES } from "./core-files";

const root = path.resolve(import.meta.dirname, "..");
const sha = (rel: string) => createHash("sha256").update(readFileSync(path.join(root, rel))).digest("hex");

const files: Record<string, string> = {};
for (const rel of coreFiles(root)) files[rel] = sha(rel);

const templates: Record<string, string> = {};
for (const rel of TEMPLATE_FILES) if (existsSync(path.join(root, rel))) templates[rel] = sha(rel);

const out = path.join(root, "core.lock.json");
writeFileSync(out, JSON.stringify({ files, templates }, null, 2) + "\n");
console.log(`Wrote ${out} (${Object.keys(files).length} core files, ${Object.keys(templates).length} templates).`);
