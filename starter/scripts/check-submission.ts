// `npm run check` — the buildathon submission checklist. Prints pass/fail per
// item and exits 1 on any failure. `--quick` skips lint/build.
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const quick = process.argv.includes("--quick");

type Result = { name: string; ok: boolean | "warn"; note?: string };
const results: Result[] = [];
const check = (name: string, ok: boolean, note?: string) => results.push({ name, ok, note });
const warn = (name: string, ok: boolean, note?: string) => results.push({ name, ok: ok ? true : "warn", note });

const file = (rel: string) => path.join(root, rel);
const read = (rel: string) => (existsSync(file(rel)) ? readFileSync(file(rel), "utf8") : "");

// 1. mission.config.ts customized
const config = read("mission.config.ts");
check('mission.config: appName customized', /appName:\s*"([^"]+)"/.exec(config)?.[1] !== "Learning Mission" && /appName:\s*"[^"]+"/.test(config), 'appName should no longer be "Learning Mission"');
check('mission.config: learner.name customized', /name:\s*"([^"]+)"/.exec(config)?.[1] !== "Alex", 'learner.name should no longer be "Alex"');
check('mission.config: topic customized', /topic:\s*"([^"]+)"/.exec(config)?.[1] !== "3rd-grade math", 'topic should no longer be "3rd-grade math"');

// 2. The five-step route structure is intact
for (const rel of [
  "src/app/onboard/page.tsx",
  "src/app/sessions/new/page.tsx",
  "src/app/sessions/[id]/questions/page.tsx",
  "src/app/sessions/[id]/practice/page.tsx",
  "src/app/sessions/[id]/print/sheet/page.tsx",
  "src/app/sessions/[id]/work/page.tsx",
  "src/app/sessions/[id]/review/page.tsx",
]) {
  check(`route exists: ${rel.replace("src/app/", "")}`, existsSync(file(rel)));
}

// 3. Store / AI / subject contracts
const store = read("src/lib/store/index.ts");
for (const fn of ["getSession", "createSession", "updateSession", "listSessions", "getProfile", "saveProfile"]) {
  check(`store exports ${fn}`, new RegExp(`export\\s+(async\\s+)?function\\s+${fn}|export\\s+const\\s+${fn}`).test(store));
}
check("AiProvider interface", /export\s+interface\s+AiProvider/.test(read("src/lib/ai/types.ts")));
check("Subject interface", /export\s+interface\s+Subject/.test(read("src/subjects/types.ts")));

// 4. Fixtures parse (mock mode depends on them)
for (const name of ["extraction", "generation", "grading"]) {
  try {
    JSON.parse(read(`fixtures/${name}.json`));
    check(`fixtures/${name}.json parses`, true);
  } catch {
    check(`fixtures/${name}.json parses`, false, "invalid JSON");
  }
}

// 5. README customized
check(
  "README.md customized",
  existsSync(file("README.md")) && !read("README.md").startsWith('# starter — "Learning Mission"'),
  "rewrite the starter README for your app",
);

// 6. Demo video present (warning only)
warn(
  "demo video present (submission/demo.webm or .mp4)",
  existsSync(file("submission/demo.webm")) || existsSync(file("submission/demo.mp4")),
  "record with: npm run demo:record",
);

// 7. lint + build
if (!quick) {
  for (const cmd of ["lint", "build"] as const) {
    const r = spawnSync("npm", ["run", cmd, "--silent"], { cwd: root, stdio: "pipe" });
    check(`npm run ${cmd}`, r.status === 0, r.status !== 0 ? String(r.stderr || r.stdout).slice(-300) : undefined);
  }
}

// Report
let failed = 0;
for (const r of results) {
  const mark = r.ok === true ? "PASS" : r.ok === "warn" ? "WARN" : "FAIL";
  if (r.ok === false) failed++;
  console.log(`${mark}  ${r.name}${r.note ? ` — ${r.note}` : ""}`);
}
console.log(failed ? `\n${failed} check(s) failed.` : "\nAll required checks passed.");
process.exit(failed ? 1 : 0);
