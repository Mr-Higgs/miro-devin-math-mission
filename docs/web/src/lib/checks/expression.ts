// A tiny, safe calculator for the "check" the AI attaches to each practice
// question. It only understands numbers, named digits (h, t, o, ...),
// + - * / ( ), comparisons (== != < > <= >=) and && ||. It never runs code.

type Token = { kind: "num"; value: number } | { kind: "name"; value: string } | { kind: "op"; value: string };

const OPS = ["==", "!=", "<=", ">=", "&&", "||", "+", "-", "*", "/", "(", ")", "<", ">"];

function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (/\s/.test(c)) { i++; continue; }
    const num = /^\d+(\.\d+)?/.exec(text.slice(i));
    if (num) { tokens.push({ kind: "num", value: Number(num[0]) }); i += num[0].length; continue; }
    const name = /^[a-z_]\w*/i.exec(text.slice(i));
    if (name) { tokens.push({ kind: "name", value: name[0] }); i += name[0].length; continue; }
    const op = OPS.find((o) => text.startsWith(o, i));
    if (op) { tokens.push({ kind: "op", value: op }); i += op.length; continue; }
    throw new Error(`Can't read "${text.slice(i, i + 10)}" in "${text}"`);
  }
  return tokens;
}

/** Evaluates an expression. Comparisons give 1 (true) or 0 (false). */
export function evaluate(text: string, vars: Record<string, number> = {}): number {
  const tokens = tokenize(text);
  let pos = 0;
  const peek = () => tokens[pos];
  const isOp = (...ops: string[]) => {
    const t = peek();
    return t?.kind === "op" && ops.includes(t.value);
  };
  const next = () => tokens[pos++];

  const or = (): number => {
    let v = and();
    while (isOp("||")) { next(); const r = and(); v = v || r ? 1 : 0; }
    return v;
  };
  const and = (): number => {
    let v = compare();
    while (isOp("&&")) { next(); const r = compare(); v = v && r ? 1 : 0; }
    return v;
  };
  const compare = (): number => {
    const v = sum();
    if (isOp("==", "!=", "<", ">", "<=", ">=")) {
      const op = next().value;
      const r = sum();
      const result = { "==": v === r, "!=": v !== r, "<": v < r, ">": v > r, "<=": v <= r, ">=": v >= r }[op];
      return result ? 1 : 0;
    }
    return v;
  };
  const sum = (): number => {
    let v = product();
    while (isOp("+", "-")) { const op = next().value; const r = product(); v = op === "+" ? v + r : v - r; }
    return v;
  };
  const product = (): number => {
    let v = unary();
    while (isOp("*", "/")) {
      const op = next().value;
      const r = unary();
      if (op === "/" && r === 0) throw new Error("Division by zero");
      v = op === "*" ? v * r : v / r;
    }
    return v;
  };
  const unary = (): number => {
    if (isOp("-")) { next(); return -unary(); }
    return atom();
  };
  const atom = (): number => {
    const t = next();
    if (!t) throw new Error(`"${text}" ends too early`);
    if (t.kind === "num") return t.value;
    if (t.kind === "name") {
      if (!(t.value in vars)) throw new Error(`Unknown name "${t.value}" in "${text}"`);
      return vars[t.value];
    }
    if (t.value === "(") {
      const v = or();
      if (!isOp(")")) throw new Error(`Missing ")" in "${text}"`);
      next();
      return v;
    }
    throw new Error(`Unexpected "${t.value}" in "${text}"`);
  };

  const result = or();
  if (pos !== tokens.length) throw new Error(`Couldn't read all of "${text}"`);
  return result;
}

/** The plain numbers written in an expression (not variable names). */
export function numbersIn(text: string): number[] {
  return tokenize(text).flatMap((t) => (t.kind === "num" ? [t.value] : []));
}
