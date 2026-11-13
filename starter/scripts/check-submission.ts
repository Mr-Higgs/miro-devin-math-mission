// `npm run check` — the buildathon submission checklist. Prints pass/fail per
// item and exits 1 on any failure. `--quick` skips lint/build.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { checkMaterial, checkPractice, checkEvaluation, gradeByApp } from "../src/lib/checks";
import { coreFiles, TEMPLATE_FILES } from "./core-files";
import { mission } from "../mission.config";

const root = path.resolve(import.meta.dirname, "..");
const quick = process.argv.includes("--quick");

type Result = { name: string; ok: boolean | "warn"; note?: string };
const results: Result[] = [];
const check = (name: string, ok: boolean, note?: string) => results.push({ name, ok, note });
const warn = (name: string, ok: boolean, note?: string) => results.push({ name, ok: ok ? true : "warn", note });

const file = (rel: string) => path.join(root, rel);
const read = (rel: string) => (existsSync(file(rel)) ? readFileSync(file(rel), "utf8") : "");
const sha = (rel: string) => createHash("sha256").update(readFileSync(file(rel))).digest("hex");

// 1. mission.config.ts customized
check("mission.config: appName customized", mission.appName !== "Learning Mission", 'appName should no longer be "Learning Mission"');
check("mission.config: learner.name customized", mission.learner.name !== "Alex", 'learner.name should no longer be "Alex"');
check("mission.config: topic customized", mission.topic !== "place value", 'topic should no longer be "place value"');

// 2. The route files for the 4 screens exist, and the data-step hooks are present
for (const rel of [
  "src/app/onboard/page.tsx",
  "src/app/sessions/new/page.tsx",
  "src/app/sessions/[id]/material/page.tsx",
  "src/app/sessions/[id]/practice/page.tsx",
  "src/app/sessions/[id]/results/page.tsx",
]) {
  check(`route exists: ${rel.replace("src/app/", "")}`, existsSync(file(rel)));
}
const appSource = (function collect(dir: string): string {
  const abs = file(dir);
  if (!existsSync(abs)) return "";
  let out = "";
  for (const entry of readdirSync(abs, { withFileTypes: true })) {
    const p = path.join(abs, entry.name);
    if (entry.isDirectory()) out += collect(path.join(dir, entry.name));
    else if (entry.isFile()) out += readFileSync(p, "utf8");
  }
  return out;
})("src/app");
for (const step of ["save-profile", "use-sample", "start-practice", "submit-answers", "results-summary"]) {
  check(`data-step "${step}" hook present`, appSource.includes(`data-step="${step}"`), "a flow button lost its data-step hook");
}

// 3. Core unchanged: every core file matches core.lock.json
const lock = (() => {
  try {
    return JSON.parse(read("core.lock.json")) as { files: Record<string, string>; templates: Record<string, string> };
  } catch {
    return null;
  }
})();
if (!lock) {
  check("core unchanged", false, "core.lock.json is missing — ask a helper");
} else {
  const expected = lock.files ?? {};
  const actual = coreFiles(root);
  const problems: string[] = [];
  for (const rel of actual) {
    if (!(rel in expected)) problems.push(`${rel} (added file)`);
    else if (sha(rel) !== expected[rel]) problems.push(rel);
  }
  for (const rel of Object.keys(expected)) {
    if (!existsSync(file(rel))) problems.push(`${rel} (missing)`);
  }
  check(
    "core unchanged",
    problems.length === 0,
    problems.length
      ? `${problems.join(", ")} — restore from the template: \`git checkout <file>\` or ask a helper`
      : undefined,
  );
}

// 4. Fixtures parse and pass the app's own validators against the current config
try {
  const material = JSON.parse(read("fixtures/read-material.json"));
  const materialCheck = checkMaterial(material);
  check("fixtures/read-material.json passes checks", materialCheck.ok, materialCheck.problems.join("; "));

  const keyIdeaIds = (materialCheck.value?.key_ideas ?? []).map((_, i) => `k${i + 1}`);
  const practice = JSON.parse(read("fixtures/generate-practice.json"));
  const practiceCheck = checkPractice(practice, {
    count: mission.practice.count,
    questionTypes: mission.practice.questionTypes,
    keyIdeaIds,
  });
  const practiceProblems = [
    ...practiceCheck.problems,
    ...practiceCheck.questions.flatMap((q, i) => q.problems.map((p) => `question ${i + 1}: ${p}`)),
  ];
  check("fixtures/generate-practice.json passes checks", practiceProblems.length === 0, practiceProblems.join("; "));

  // The items the AI would be asked to mark: types the app can't grade itself.
  const drafts = practiceCheck.questions.map((q) => q.draft).filter((d): d is NonNullable<typeof d> => !!d);
  const aiIds = drafts
    .map((d, i) => ({ d, id: `q${i + 1}` }))
    .filter(({ d }) => d.type !== "flashcard" && gradeByApp(d, d.answer) === null)
    .map(({ id }) => id);
  const evaluation = JSON.parse(read("fixtures/evaluate-answers.json")) as {
    items: { result: string; feedback: string }[];
    summary: string;
    next_steps: string[];
  };
  const mapped = {
    items: aiIds.map((id, i) => ({ question_id: id, ...(evaluation.items?.[i % (evaluation.items.length || 1)] ?? {}) })),
    summary: evaluation.summary,
    next_steps: evaluation.next_steps,
  };
  const evalCheck = checkEvaluation(mapped, aiIds);
  check("fixtures/evaluate-answers.json passes checks", evalCheck.ok && !!evaluation.items?.length, evalCheck.problems.join("; "));
} catch (e) {
  check("fixtures parse", false, e instanceof Error ? e.message : String(e));
}

// 5. At least one prompt file personalized
const templates = lock?.templates ?? {};
const promptChanged = TEMPLATE_FILES.some((rel) => existsSync(file(rel)) && templates[rel] !== sha(rel));
check(
  "prompts personalized",
  promptChanged,
  `edit ${TEMPLATE_FILES.join(" or ")} so the AI sounds like your team`,
);

// 6. README customized
check(
  "README.md customized",
  existsSync(file("README.md")) && !read("README.md").startsWith('# starter — "Learning Mission"'),
  "rewrite the starter README for your app",
);

// 7. No keys committed
{
  const ls = spawnSync("git", ["ls-files"], { cwd: root, encoding: "utf8" });
  if (ls.status !== 0) {
    warn("no keys committed", true, "not a git repo — skipped");
  } else {
    const tracked = ls.stdout.split("\n").filter(Boolean);
    const envFiles = tracked.filter((f) => /(^|\/)\.env/.test(f) && !f.endsWith(".env.example"));
    const keyHits: string[] = [];
    for (const rel of tracked) {
      const abs = file(rel);
      try {
        const text = readFileSync(abs, "utf8");
        if (/(?<![A-Za-z0-9_-])(AIza[0-9A-Za-z_-]{20,}|sk-ant-[0-9A-Za-z_-]{10,}|sk-(?=[0-9A-Za-z_-]*[0-9])[0-9A-Za-z_-]{20,})/.test(text)) keyHits.push(rel);
      } catch {
        // binary or unreadable — skip
      }
    }
    const problems = [...envFiles.map((f) => `${f} (tracked env file)`), ...keyHits.map((f) => `${f} (looks like a key)`)];
    check("no keys committed", problems.length === 0, problems.join(", ") || undefined);
  }
}

// 8. Demo video present (warning only)
warn(
  "demo video present (submission/demo.webm or .mp4)",
  existsSync(file("submission/demo.webm")) || existsSync(file("submission/demo.mp4")),
  "record with: npm run demo:record",
);

// 9. lint + build
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
  console.log(`${mark}  ${r.name}${r.note && r.ok !== true ? ` — ${r.note}` : ""}`);
}
console.log(failed ? `\n${failed} check(s) failed.` : "\nAll required checks passed.");
process.exit(failed ? 1 : 0);
