// Draws a question's picture from data (decision 010: "diagrams are generated
// as data and drawn by the app, so their answers can be checked"). The forms
// match the list in docs/web/src/prompts/generation.ts. Everything is drawn in the
// current text color, so it's the theme ink on screen and black on paper.
// Anything not recognized is shown as a short description for the adult.
import type { ReactNode } from "react";

type Spec = Record<string, unknown> | null | undefined;

const n = (v: unknown, fallback = 0) => (typeof v === "number" && Number.isFinite(v) ? v : Number(v) || fallback);
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function Picture({ spec }: { spec: Spec }) {
  if (!spec || typeof spec !== "object") return null;
  const [kind, value] = Object.entries(spec)[0] ?? [];
  const v = (value ?? {}) as Record<string, unknown>;

  switch (kind) {
    case "place_value_chart":
      return <PlaceValueChart hundreds={v.hundreds} tens={v.tens} ones={v.ones} />;
    case "underlined":
      return <Underlined number={String(v.number ?? "")} place={String(v.place ?? "")} />;
    case "rectangle":
      return <Polygon sides={[n(v.length), n(v.width), n(v.length), n(v.width)]} units={String(v.units ?? "")} rectangle />;
    case "polygon":
      return <Polygon sides={Array.isArray(v.sides) ? v.sides.map((s) => n(s)) : []} units={String(v.units ?? "")} />;
    case "letters":
      return <Letters text={String(value ?? "")} />;
    case "blocks":
      return <Blocks hundreds={n(v.hundreds)} tens={n(v.tens)} ones={n(v.ones)} />;
    case "bundles":
      return <Bundles count={n(v.count)} each={n(v.each, 100)} />;
    case "symmetry":
      return <Symmetry shape={String(v.shape ?? "")} line={String(v.line ?? "")} />;
    default:
      return <Described text={kind === "other" ? String(value ?? "") : JSON.stringify(spec)} />;
  }
}

function Frame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <figure className="inline-block" aria-label={label}>
      {children}
    </figure>
  );
}

function Described({ text }: { text: string }) {
  return (
    <p className="max-w-xs rounded border border-dashed border-current p-2 text-xs italic opacity-80">
      Picture to draw: {text}
    </p>
  );
}

function PlaceValueChart({ hundreds, tens, ones }: { hundreds: unknown; tens: unknown; ones: unknown }) {
  const cells = [["Hundreds", hundreds], ["Tens", tens], ["Ones", ones]] as const;
  return (
    <Frame label="Place-value chart">
      <table className="border-collapse text-center text-sm">
        <thead>
          <tr>
            {cells.map(([h]) => (
              <th key={h} className="border border-current px-4 py-1 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {cells.map(([h, d]) => (
              <td key={h} className="border border-current px-4 py-2 text-lg">{String(d ?? "")}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </Frame>
  );
}

function Underlined({ number, place }: { number: string; place: string }) {
  const offset = { ones: 0, one: 0, tens: 1, ten: 1, hundreds: 2, hundred: 2, thousands: 3 }[place.toLowerCase()] ?? -1;
  const index = number.length - 1 - offset;
  return (
    <Frame label={`The number ${number} with the ${place} digit underlined`}>
      <span className="font-mono text-2xl tracking-widest">
        {[...number].map((d, i) => (
          <span key={i} className={i === index ? "underline decoration-2 underline-offset-4" : undefined}>{d}</span>
        ))}
      </span>
    </Frame>
  );
}

/** A rectangle, or a regular-looking polygon, with each side's length written beside it. */
function Polygon({ sides, units, rectangle = false }: { sides: number[]; units: string; rectangle?: boolean }) {
  if (sides.length < 3) return <Described text="a shape (side lengths missing)" />;
  const unit = units && units !== "units" ? ` ${units}` : "";
  let points: [number, number][];
  if (rectangle) {
    const [l, w] = sides;
    const scale = 120 / Math.max(l, w, 1);
    const pw = clamp(l * scale, 40, 160), ph = clamp(w * scale, 30, 120);
    points = [[40, 30], [40 + pw, 30], [40 + pw, 30 + ph], [40, 30 + ph]];
  } else {
    const r = 60, cx = 100, cy = 90;
    points = sides.map((_, i) => {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / sides.length;
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    });
  }
  const xs = points.map((p) => p[0]), ys = points.map((p) => p[1]);
  const width = Math.max(...xs) + 50, height = Math.max(...ys) + 30;
  const cx = xs.reduce((a, b) => a + b, 0) / xs.length, cy = ys.reduce((a, b) => a + b, 0) / ys.length;
  return (
    <Frame label={`A shape with sides ${sides.join(", ")}${unit}`}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <polygon points={points.map((p) => p.join(",")).join(" ")} fill="none" stroke="currentColor" strokeWidth={2} />
        {points.map((p, i) => {
          const q = points[(i + 1) % points.length];
          const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
          const dx = mx - cx, dy = my - cy, len = Math.hypot(dx, dy) || 1;
          return (
            <text key={i} x={mx + (dx / len) * 16} y={my + (dy / len) * 16} textAnchor="middle" dominantBaseline="middle" fontSize={12} fill="currentColor">
              {sides[i]}{unit}
            </text>
          );
        })}
      </svg>
    </Frame>
  );
}

function Letters({ text }: { text: string }) {
  return (
    <Frame label={`The letters ${text}`}>
      <span className="font-sans text-4xl font-bold tracking-[0.4em]">{text.toUpperCase()}</span>
    </Frame>
  );
}

/** Base-ten blocks: hundred flats, ten rods, one cubes. */
function Blocks({ hundreds, tens, ones }: { hundreds: number; tens: number; ones: number }) {
  const h = clamp(Math.round(hundreds), 0, 9), t = clamp(Math.round(tens), 0, 9), o = clamp(Math.round(ones), 0, 9);
  const unit = 5;
  const flat = unit * 10;
  const width = h * (flat + 8) + t * (unit + 6) + Math.ceil(o / 5) * (unit + 4) + 20;
  return (
    <Frame label={`Base-ten blocks: ${h} hundreds, ${t} tens, ${o} ones`}>
      <svg width={Math.max(width, 40)} height={flat + 10} viewBox={`0 0 ${Math.max(width, 40)} ${flat + 10}`}>
        <g stroke="currentColor" fill="none" strokeWidth={0.6}>
          {Array.from({ length: h }, (_, i) => {
            const x = 4 + i * (flat + 8);
            return (
              <g key={`h${i}`}>
                <rect x={x} y={4} width={flat} height={flat} strokeWidth={1.2} />
                {Array.from({ length: 9 }, (_, k) => (
                  <g key={k}>
                    <line x1={x + (k + 1) * unit} y1={4} x2={x + (k + 1) * unit} y2={4 + flat} />
                    <line x1={x} y1={4 + (k + 1) * unit} x2={x + flat} y2={4 + (k + 1) * unit} />
                  </g>
                ))}
              </g>
            );
          })}
          {Array.from({ length: t }, (_, i) => {
            const x = 4 + h * (flat + 8) + i * (unit + 6);
            return (
              <g key={`t${i}`}>
                <rect x={x} y={4} width={unit} height={flat} strokeWidth={1.2} />
                {Array.from({ length: 9 }, (_, k) => <line key={k} x1={x} y1={4 + (k + 1) * unit} x2={x + unit} y2={4 + (k + 1) * unit} />)}
              </g>
            );
          })}
          {Array.from({ length: o }, (_, i) => {
            const x = 4 + h * (flat + 8) + t * (unit + 6) + Math.floor(i / 5) * (unit + 4);
            const y = 4 + (i % 5) * (unit + 4);
            return <rect key={`o${i}`} x={x} y={y} width={unit} height={unit} strokeWidth={1.2} />;
          })}
        </g>
      </svg>
    </Frame>
  );
}

/** Boxes or bundles of 100 (count by hundreds). */
function Bundles({ count, each }: { count: number; each: number }) {
  const c = clamp(Math.round(count), 0, 12);
  return (
    <Frame label={`${c} bundles of ${each}`}>
      <div className="flex max-w-xs flex-wrap gap-2">
        {Array.from({ length: c }, (_, i) => (
          <span key={i} className="flex h-10 w-14 items-center justify-center rounded border-2 border-current text-sm font-bold">
            {each}
          </span>
        ))}
      </div>
    </Frame>
  );
}

/** A simple shape with a dashed line through it (line-of-symmetry questions). */
function Symmetry({ shape, line }: { shape: string; line: string }) {
  const s = shape.toLowerCase();
  const outline =
    s.includes("circle") ? <circle cx={60} cy={60} r={45} /> :
    s.includes("triangle") ? <polygon points="60,15 105,105 15,105" /> :
    s.includes("trapezoid") ? <polygon points="35,25 85,25 110,100 10,100" /> :
    s.includes("square") ? <rect x={20} y={20} width={80} height={80} /> :
    s.includes("rectangle") ? <rect x={10} y={30} width={100} height={60} /> :
    s.includes("heart") ? <path d="M60 105 C10 70 15 25 45 25 C55 25 60 35 60 40 C60 35 65 25 75 25 C105 25 110 70 60 105 Z" /> :
    null;
  if (!outline) return <Described text={`${shape} with a ${line} line`} />;
  const l = line.toLowerCase();
  const dashed =
    l.includes("horizontal") ? <line x1={0} y1={60} x2={120} y2={60} /> :
    l.includes("diagonal") ? <line x1={5} y1={5} x2={115} y2={115} /> :
    <line x1={60} y1={0} x2={60} y2={120} />;
  return (
    <Frame label={`A ${shape} with a ${line} dashed line`}>
      <svg width={120} height={120} viewBox="0 0 120 120">
        <g fill="none" stroke="currentColor" strokeWidth={2}>{outline}</g>
        <g stroke="currentColor" strokeWidth={1.5} strokeDasharray="6 4">{dashed}</g>
      </svg>
    </Frame>
  );
}
