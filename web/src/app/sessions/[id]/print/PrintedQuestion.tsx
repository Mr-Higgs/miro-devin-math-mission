// One printed practice question, used by both the practice sheet and the
// answer key so the two pages always line up. With `answers`, the right
// choice is filled in, Yes/No is circled, the answer is written on the line,
// and the worked steps sit in the work box where the student writes theirs.
import { Picture } from "@/components/pictures/Picture";
import { isYesNo, letters, type PracticeSet } from "./shared";

type Item = PracticeSet["practice"][number];

export function PrintedQuestion({ p, answers = false }: { p: Item; answers?: boolean }) {
  const multi = Boolean(p.choices) && /choose all/i.test(p.question_text);
  const right = answers ? letters(p.correct_answer) : new Set<string>();
  const yesNo = !p.choices && isYesNo(p.correct_answer);
  const saidYes = /^\s*yes/i.test(p.correct_answer ?? "");

  return (
    <section className="print-q">
      <div className="print-q-row">
        <div className="print-q-body">
          <p>
            <span className="print-num">{p.position}.</span>
            {p.question_text}
          </p>
          {p.choices ? (
            <div className="print-choices">
              {Object.entries(p.choices).map(([letter, text]) => (
                <span key={letter} className="print-choice">
                  <span className={["print-bubble", multi && "print-box", right.has(letter) && "marked"].filter(Boolean).join(" ")}>{letter}</span>
                  {text}
                </span>
              ))}
            </div>
          ) : yesNo ? (
            <div className="print-yesno">
              <span className={answers && saidYes ? "marked" : undefined}>Yes</span>
              <span className={answers && !saidYes ? "marked" : undefined}>No</span>
            </div>
          ) : (
            <div className="print-answer-line">{answers && <span className="print-written">{p.correct_answer}</span>}</div>
          )}
        </div>
        {p.picture_spec && (
          <div className="print-q-picture">
            <Picture spec={p.picture_spec as Record<string, unknown>} />
          </div>
        )}
      </div>

      <div className={`print-work ${p.requires_work ? "large" : "small"}${answers ? " filled" : ""}`}>
        {answers ? (
          <>
            {p.steps_to_solve && <p><strong>Why:</strong> {p.steps_to_solve}</p>}
            {p.hint && <p className="print-hint"><strong>Hint to read out:</strong> {p.hint}</p>}
            {p.check_status !== "passed" && <p className="print-key-flag">Not confirmed by the app&apos;s math check: please check this answer.</p>}
          </>
        ) : p.requires_work ? (
          "Show your work"
        ) : (
          "Work space"
        )}
      </div>
    </section>
  );
}
