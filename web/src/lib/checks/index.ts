// Math checks for generated practice questions (decision 010; backend doc
// §3.1, entity 12 "Validation rules"). Every practice question must pass
// before it's shown; a failure means "ask the AI again", and after a few
// tries the question is flagged for the adult. The benchmark uses the same
// checks, so what's tested is exactly what the app will enforce.
import { evaluate, numbersIn } from "./expression";

export type QuestionFormat = "multiple_choice" | "multiple_select" | "fill_in" | "open_response";

/** The missed question from the original test. */
export interface SourceQuestion {
  question_text: string;
  format: QuestionFormat;
  choices: Record<string, string> | null;
  correct_answer: string;
  question_type?: string | null;
  picture_description?: string | null;
  picture_spec?: unknown;
  requires_work?: boolean | null;
}

/** How the app can confirm the answer itself (written by the AI, checked here). */
export type AnswerCheck =
  | { kind: "arithmetic"; expression: string }
  | { kind: "clues"; variables: string[]; constraints: string[]; number: string }
  | { kind: "none"; reason: string };

/** A practice question as returned by the generation prompt. */
export interface GeneratedQuestion {
  question_text: string;
  choices: Record<string, string> | null;
  picture_spec: unknown;
  correct_answer: string;
  steps_to_solve: string;
  hint: string;
  check: AnswerCheck;
}

export interface CheckReport {
  passed: boolean;
  /** True when at least one math check confirmed the answer. */
  mathChecked: boolean;
  problems: string[];
  verified: string[];
}

// ---------------------------------------------------------------------------
// Reading answers and numbers
// ---------------------------------------------------------------------------

/** Numbers as written in a question: "1,000" -> 1000, "$825" -> 825. */
export function numbersInText(text: string): number[] {
  return (text.match(/\d{1,3}(?:,\d{3})+|\d+/g) ?? []).map((n) => Number(n.replace(/,/g, "")));
}

/** "B", "B (80)", "C, E", "C and E" -> the choice letters that exist. */
export function correctLetters(answer: string, choices: Record<string, string> | null): string[] {
  if (!choices) return [];
  const head = answer.split("(")[0];
  return [...new Set(head.match(/\b[A-Z]\b/g) ?? [])].filter((l) => l in choices);
}

/** The answer as text: the chosen choice(s) for multiple choice, else the answer itself. */
function answerTexts(q: { format: QuestionFormat; choices: Record<string, string> | null; correct_answer: string }) {
  if (q.format === "multiple_choice" || q.format === "multiple_select") {
    return correctLetters(q.correct_answer, q.choices).map((l) => q.choices![l]);
  }
  return [q.correct_answer];
}

const PLACE: Record<string, number> = { hundred: 100, hundreds: 100, ten: 10, tens: 10, one: 1, ones: 1 };

/** "50" -> 50, "5 tens" -> 50, "400 or 4 hundreds" -> 400, "$300" -> 300, "32 units" -> 32. */
export function valueOf(text: string): number | null {
  const m = /^\s*\$?(\d[\d,]*(?:\.\d+)?)\s*(hundreds?|tens?|ones?)?\b/i.exec(text);
  if (m) return Number(m[1].replace(/,/g, "")) * (m[2] ? PLACE[m[2].toLowerCase()] : 1);
  const n = numbersInText(text);
  return n.length ? n[0] : null;
}

const yesNo = (text: string) => /^\s*(yes|no)\b/i.exec(text)?.[1].toLowerCase() as "yes" | "no" | undefined;

/** Does "a - b" need regrouping (borrowing) in any place? */
function needsRegrouping(a: number, b: number): boolean {
  let x = a, y = b;
  while (y > 0) {
    if (x % 10 < y % 10) return true;
    x = Math.floor(x / 10);
    y = Math.floor(y / 10);
  }
  return false;
}

// Capital letters with a line of symmetry, as taught in early grades
// (vertical: A H I M O T U V W X Y; horizontal: B C D E H I K O X).
const SYMMETRIC_LETTERS = new Set("AHIMOTUVWXYBCDEK".split(""));

const SHAPE_SIDES: Record<string, number> = { triangle: 3, square: 4, rectangle: 4, quadrilateral: 4, pentagon: 5, hexagon: 6, octagon: 8 };

// ---------------------------------------------------------------------------
// The checks
// ---------------------------------------------------------------------------

export function checkGenerated(original: SourceQuestion, generated: GeneratedQuestion): CheckReport {
  const problems: string[] = [];
  const verified: string[] = [];
  let mathChecked = false;
  const g = generated;
  const format = original.format;

  // 1. Everything is there.
  for (const field of ["question_text", "correct_answer", "steps_to_solve", "hint"] as const) {
    if (typeof g[field] !== "string" || !g[field].trim()) problems.push(`Missing ${field}`);
  }
  if (problems.length) return { passed: false, mathChecked, problems, verified };

  // 2. Same format and choices.
  const isChoice = format === "multiple_choice" || format === "multiple_select";
  let letters: string[] = [];
  if (isChoice) {
    const keys = g.choices ? Object.keys(g.choices) : [];
    const originalKeys = original.choices ? Object.keys(original.choices) : [];
    if (!keys.length) problems.push("Choices are missing");
    if (originalKeys.length && keys.length !== originalKeys.length) {
      problems.push(`Has ${keys.length} choices; the original has ${originalKeys.length}`);
    }
    const texts = Object.values(g.choices ?? {}).map((t) => t.trim().toLowerCase());
    if (new Set(texts).size !== texts.length) problems.push("Two choices are the same");
    letters = correctLetters(g.correct_answer, g.choices);
    if (format === "multiple_choice" && letters.length !== 1) problems.push("Multiple choice must have exactly one right letter");
    if (format === "multiple_select") {
      const originalCount = correctLetters(original.correct_answer, original.choices).length;
      if (letters.length !== originalCount) problems.push(`Has ${letters.length} right choices; the original has ${originalCount}`);
    }
  } else if (g.choices && Object.keys(g.choices).length) {
    problems.push("Has choices, but the original doesn't");
  }

  // 3. The answer is different from the original's (yes/no follows the new diagram).
  const newTexts = answerTexts({ format, choices: g.choices, correct_answer: g.correct_answer });
  const oldTexts = answerTexts(original);
  const isYesNo = newTexts.some((t) => yesNo(t)) || oldTexts.some((t) => yesNo(t));
  if (!isYesNo && newTexts.length && oldTexts.length) {
    const norm = (ts: string[]) => ts.map((t) => String(valueOf(t) ?? t.trim().toLowerCase())).sort().join("|");
    if (norm(newTexts) === norm(oldTexts)) problems.push("The answer is the same as the original's");
    else verified.push("Answer differs from the original");
  }

  // 4. Same size of numbers, and the same need for regrouping.
  const oldNums = numbersInText(original.question_text);
  const newNums = numbersInText(g.question_text);
  if (oldNums.length && newNums.length) {
    if (oldNums.length !== newNums.length) {
      problems.push(`Has ${newNums.length} numbers in the question; the original has ${oldNums.length}`);
    } else {
      const sizes = (ns: number[]) => ns.map((n) => String(n).length).join(",");
      if (sizes(oldNums) !== sizes(newNums)) problems.push("Numbers aren't the same size as the original's");
      else verified.push("Numbers are the same size");
    }
  }
  const sub = /(\d[\d,]*)\s*-\s*(\d[\d,]*)/;
  const oldSub = sub.exec(original.question_text);
  const newSub = sub.exec(g.question_text);
  if (oldSub && newSub) {
    const [a, b, c, d] = [oldSub[1], oldSub[2], newSub[1], newSub[2]].map((n) => Number(n.replace(/,/g, "")));
    if (needsRegrouping(a, b) !== needsRegrouping(c, d)) problems.push("Regrouping doesn't match the original (same skill rule)");
    else verified.push(`Regrouping matches the original (${needsRegrouping(a, b) ? "needed" : "not needed"})`);
  }

  // The value the answer must equal, for the math checks below.
  const target = newTexts.length === 1 ? valueOf(newTexts[0]) : null;
  const otherChoiceHas = (value: number) =>
    isChoice && Object.entries(g.choices ?? {}).some(([k, t]) => !letters.includes(k) && valueOf(t) === value);

  const confirm = (label: string, value: number) => {
    if (isChoice && format === "multiple_select") {
      // Every right choice must equal the value; no wrong choice may.
      const wrongRight = letters.filter((l) => valueOf(g.choices![l]) !== value);
      if (wrongRight.length) problems.push(`${label}: choice ${wrongRight.join(", ")} isn't ${value}`);
      else if (otherChoiceHas(value)) problems.push(`${label}: a choice marked wrong also equals ${value}`);
      else { mathChecked = true; verified.push(`${label}: right choices equal ${value}`); }
      return;
    }
    if (target === null) { problems.push(`${label}: couldn't read a number in the answer`); return; }
    if (Math.abs(target - value) > 1e-9) { problems.push(`${label}: works out to ${value}, but the answer says ${target}`); return; }
    if (otherChoiceHas(value)) { problems.push(`${label}: another choice also equals ${value}`); return; }
    mathChecked = true;
    verified.push(`${label}: answer ${value} confirmed`);
  };

  // Numbers the check may use: ones in the question or its diagram, plus 1, 2, 10, 100, 1000 and side counts.
  // Single digits of those numbers count too (the 3 in 337).
  const shown = [...newNums, ...numbersInText(JSON.stringify(g.picture_spec ?? ""))];
  const allowed = new Set<number>([1, 2, 10, 100, 1000, ...shown, ...shown.flatMap((n) => [...String(n)].map(Number))]);
  for (const [shape, sides] of Object.entries(SHAPE_SIDES)) if (new RegExp(shape, "i").test(g.question_text)) allowed.add(sides);
  const unknownNumbers = (exprs: string[]) => [...new Set(exprs.flatMap(numbersIn))].filter((n) => !allowed.has(n));

  // 5. The AI's own check, worked out here.
  try {
    const check = g.check;
    if (check?.kind === "arithmetic" && typeof check.expression === "string") {
      const stray = unknownNumbers([check.expression]);
      if (stray.length) problems.push(`Check uses ${stray.join(", ")}, which aren't in the question`);
      else confirm(`Check ${check.expression}`, evaluate(check.expression));
    } else if (check?.kind === "clues" && Array.isArray(check.variables) && Array.isArray(check.constraints)) {
      const stray = unknownNumbers(check.constraints);
      if (stray.length) problems.push(`Clues use ${stray.join(", ")}, which aren't in the question`);
      if (check.variables.length < 1 || check.variables.length > 4) throw new Error("Clues need 1 to 4 digits");
      const solutions: number[] = [];
      const assign = (i: number, vars: Record<string, number>) => {
        if (i === check.variables.length) {
          if (check.constraints.every((c) => evaluate(c, vars))) solutions.push(evaluate(check.number, vars));
          return;
        }
        for (let d = i === 0 ? 1 : 0; d <= 9; d++) assign(i + 1, { ...vars, [check.variables[i]]: d });
      };
      assign(0, {});
      if (solutions.length !== 1) problems.push(`Clues have ${solutions.length} answers; they must have exactly 1`);
      else if (!stray.length) confirm("Clues", solutions[0]);
    } else if (check?.kind === "none") {
      verified.push(`No math check: ${check.reason || "no reason given"}`);
    } else {
      problems.push("The check is missing or not in a known form");
    }
  } catch (e) {
    problems.push(`Check couldn't be worked out: ${e instanceof Error ? e.message : e}`);
  }

  // 6. Independent checks from the question itself (don't rely on the AI's check).
  const spec = (g.picture_spec ?? {}) as Record<string, unknown>;
  const digitIn = /value of the (\d) in the number (\d+)/i.exec(g.question_text);
  if (digitIn) {
    const [digit, number] = [digitIn[1], digitIn[2]];
    const at = [...number].map((d, i) => (d === digit ? i : -1)).filter((i) => i >= 0);
    if (at.length !== 1) problems.push(`The ${digit} appears ${at.length} times in ${number}; it must appear once`);
    else confirm(`Value of the ${digit} in ${number}`, Number(digit) * 10 ** (number.length - 1 - at[0]));
  }
  const chart = spec.place_value_chart as Record<string, number> | undefined;
  const chartDigit = /value of the (\d)\b/i.exec(g.question_text);
  if (chart && chartDigit && !digitIn) {
    const places = Object.entries({ hundreds: 100, tens: 10, ones: 1 }).filter(([p]) => chart[p] === Number(chartDigit[1]));
    if (places.length !== 1) problems.push(`The ${chartDigit[1]} must appear exactly once in the chart`);
    else confirm(`Chart: value of the ${chartDigit[1]}`, Number(chartDigit[1]) * places[0][1]);
  }
  const underlined = spec.underlined as { number?: number; place?: string } | undefined;
  if (underlined?.number !== undefined && underlined.place && PLACE[underlined.place]) {
    const digits = String(underlined.number);
    const index = digits.length - 1 - Math.log10(PLACE[underlined.place]);
    if (index < 0) problems.push("The underlined place isn't in the number");
    else confirm(`Underlined ${underlined.place} digit of ${digits}`, Number(digits[index]) * PLACE[underlined.place]);
  }
  if (typeof spec.letters === "string") {
    const answer = yesNo(g.correct_answer);
    const letters = spec.letters.toUpperCase().replace(/[^A-Z]/g, "");
    const allSymmetric = [...letters].every((l) => SYMMETRIC_LETTERS.has(l));
    if (!answer) problems.push("A letters question needs a Yes or No answer");
    else if ((answer === "yes") !== allSymmetric) problems.push(`Letters ${letters}: answer should be ${allSymmetric ? "Yes" : "No"}`);
    else { mathChecked = true; verified.push(`Letters ${letters}: ${answer} confirmed`); }
  }

  return { passed: problems.length === 0, mathChecked, problems, verified };
}
