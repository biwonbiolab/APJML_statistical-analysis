"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import type { SessionState, SurveyPage } from "@/lib/types";
import { buildPages, progressPercent } from "@/lib/pages";
import {
  ELIGIBILITY,
  SCENARIO,
  DEBRIEF,
  SCREEN_OUT_MESSAGES,
} from "@/lib/survey-config";
import ProgressBar from "@/components/ProgressBar";
import ConsentGate from "@/components/ConsentGate";
import StimulusScreen from "@/components/StimulusScreen";
import QuestionField from "@/components/QuestionField";
import SingleChoice from "@/components/SingleChoice";

type Phase = "loading" | "error" | "running" | "screened" | "completed";

export default function SurveyPage() {
  const params = useParams<{ sid: string }>();
  const sid = params.sid;

  const [phase, setPhase] = useState<Phase>("loading");
  const [session, setSession] = useState<SessionState | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0);
  const [invalidCodes, setInvalidCodes] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [screenReason, setScreenReason] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const confirmedRef = useRef<Set<string>>(new Set());
  const topRef = useRef<HTMLDivElement | null>(null);

  const pages: SurveyPage[] = useMemo(
    () => (session ? buildPages(session) : []),
    [session],
  );
  const stimIndex = useMemo(
    () => pages.findIndex((p) => p.kind === "stimulus"),
    [pages],
  );

  // ── Load / restore session ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/session?sid=${encodeURIComponent(sid)}`);
        if (!res.ok) {
          if (!cancelled) setPhase("error");
          return;
        }
        const data = await res.json();
        if (cancelled) return;

        const s: SessionState = data.session;
        const savedAnswers: Record<string, string> = data.answers ?? {};
        const savedPages: string[] = data.savedPages ?? [];

        setSession(s);
        setAnswers(savedAnswers);

        if (s.status === "completed") {
          setPhase("completed");
          return;
        }
        if (s.status === "screened_out") {
          setScreenReason(s.screen_out_reason ?? "");
          setPhase("screened");
          return;
        }

        // Resume to the page after the furthest saved page.
        const built = buildPages(s);
        let start = 0;
        for (let i = 0; i < built.length; i++) {
          if (savedPages.includes(built[i].key)) start = i + 1;
        }
        if (start >= built.length) start = built.length - 1;
        setIndex(start);
        setPhase("running");
      } catch {
        if (!cancelled) setPhase("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sid]);

  // ── Block browser back after the stimulus ───────────────────────────────
  useEffect(() => {
    if (phase !== "running" || stimIndex < 0 || index < stimIndex) return;
    const push = () => window.history.pushState(null, "", window.location.href);
    push();
    window.addEventListener("popstate", push);
    return () => window.removeEventListener("popstate", push);
  }, [phase, index, stimIndex]);

  // Scroll to top on page change.
  useEffect(() => {
    topRef.current?.scrollIntoView({ block: "start" });
    window.scrollTo(0, 0);
  }, [index]);

  const setAnswer = useCallback((code: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [code]: value }));
    setInvalidCodes((prev) => prev.filter((c) => c !== code));
    setErrorMsg("");
  }, []);

  async function saveAnswers(pageKey: string, obj: Record<string, string>) {
    try {
      await fetch("/api/response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, pageKey, answers: obj }),
      });
    } catch {
      /* partial-save best effort */
    }
  }

  async function doScreenOut(reason: string, pageKey: string, obj: Record<string, string>) {
    setBusy(true);
    await saveAnswers(pageKey, obj);
    try {
      await fetch("/api/screenout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, reason }),
      });
    } catch {
      /* ignore */
    }
    setScreenReason(reason);
    setPhase("screened");
    setBusy(false);
  }

  async function completeSurvey() {
    try {
      await fetch("/api/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid }),
      });
    } catch {
      /* ignore */
    }
  }

  // Advance from the stimulus page (called by StimulusScreen after 25s click).
  async function advanceFromStimulus() {
    const page = pages[index];
    await saveAnswers(page.key, { STIMULUS_SEEN: "1" });
    await goNext(index + 1);
  }

  async function goNext(nextIndex: number) {
    if (nextIndex < pages.length && pages[nextIndex].kind === "debrief") {
      await completeSurvey();
    }
    setIndex(nextIndex);
  }

  // ── Validation + submit for the current page ────────────────────────────
  async function handleNext() {
    if (busy) return;
    const page = pages[index];

    // Consent
    if (page.kind === "consent") {
      const v = answers["CONSENT"];
      if (!v) return flagError(["CONSENT"], "응답을 선택해 주십시오.");
      if (v === "동의하지 않음") {
        return doScreenOut("consent_no", page.key, { CONSENT: v });
      }
      setBusy(true);
      await saveAnswers(page.key, { CONSENT: v });
      setBusy(false);
      return goNext(index + 1);
    }

    // Eligibility (screen-out on any non-pass answer)
    if (page.kind === "eligibility") {
      const missing = ELIGIBILITY.filter((q) => !answers[q.code]).map((q) => q.code);
      if (missing.length) return flagError(missing, "모든 문항에 응답해 주십시오.");
      const obj: Record<string, string> = {};
      ELIGIBILITY.forEach((q) => (obj[q.code] = answers[q.code]));
      const failed = ELIGIBILITY.find((q) => answers[q.code] !== q.passAnswer);
      if (failed) return doScreenOut(failed.reason, page.key, obj);
      setBusy(true);
      await saveAnswers(page.key, obj);
      setBusy(false);
      return goNext(index + 1);
    }

    // Scenario
    if (page.kind === "scenario") {
      const v = answers["READY"];
      if (v !== "예") return flagError(["READY"], "확인 후 '예'를 선택해 주십시오.");
      setBusy(true);
      await saveAnswers(page.key, { READY: v });
      setBusy(false);
      return goNext(index + 1);
    }

    // Question / WTP pages
    const invalid: string[] = [];
    for (const q of page.questions) {
      if (!q.required) continue;
      const v = (answers[q.code] ?? "").trim();
      if (v === "") invalid.push(q.code);
    }
    if (invalid.length) {
      return flagError(invalid, "표시된 문항에 응답해 주십시오.");
    }

    // One-time confirm for very large WTP amounts.
    for (const q of page.questions) {
      const threshold = q.number?.confirmAbove;
      if (
        q.type === "number" &&
        threshold &&
        answers[q.code] &&
        Number(answers[q.code]) > threshold &&
        !confirmedRef.current.has(q.code)
      ) {
        const ok = window.confirm(
          `입력하신 금액이 ${Number(answers[q.code]).toLocaleString(
            "ko-KR",
          )}원 입니다. 이 금액이 맞습니까?`,
        );
        if (!ok) return;
        confirmedRef.current.add(q.code);
      }
    }

    const obj: Record<string, string> = {};
    for (const q of page.questions) obj[q.code] = answers[q.code] ?? "";
    setBusy(true);
    await saveAnswers(page.key, obj);
    setBusy(false);
    return goNext(index + 1);
  }

  function flagError(codes: string[], msg: string) {
    setInvalidCodes(codes);
    setErrorMsg(msg);
    // scroll to first invalid field
    setTimeout(() => {
      const el = document.querySelector(`[data-qcode="${codes[0]}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  }

  // ── Render states ───────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <Shell>
        <div className="py-20 text-center text-slate-500">불러오는 중…</div>
      </Shell>
    );
  }

  if (phase === "error") {
    return (
      <Shell>
        <div className="card p-8 text-center">
          <h1 className="text-lg font-bold text-slate-800">
            설문을 불러올 수 없습니다
          </h1>
          <p className="mt-2 text-slate-600">
            링크가 올바른지 확인하시거나 처음부터 다시 시작해 주십시오.
          </p>
          <a href="/" className="mt-6 inline-block text-brand underline">
            처음으로
          </a>
        </div>
      </Shell>
    );
  }

  if (phase === "screened") {
    return (
      <Shell>
        <div className="card p-8 text-center">
          <h1 className="text-lg font-bold text-slate-800">참여 안내</h1>
          <p className="mt-3 leading-relaxed text-slate-600">
            {SCREEN_OUT_MESSAGES[screenReason] ??
              "본 설문의 참여 대상에 해당하지 않습니다. 참여해 주셔서 감사합니다."}
          </p>
        </div>
      </Shell>
    );
  }

  if (phase === "completed") {
    return (
      <Shell>
        <div className="card p-8">
          <h1 className="text-xl font-bold text-slate-900">{DEBRIEF.heading}</h1>
          <p className="mt-4 leading-relaxed text-slate-700">{DEBRIEF.body}</p>
        </div>
      </Shell>
    );
  }

  const page = pages[index];
  const showProgress = page.countsToProgress || index > stimIndex;
  const percent = progressPercent(pages, index);

  return (
    <Shell>
      <div ref={topRef} />
      {showProgress && (
        <div className="mb-4">
          <ProgressBar percent={percent} />
        </div>
      )}

      <div className="card p-5 sm:p-7">
        {renderPage(page)}
      </div>

      {errorMsg && (
        <p className="mt-3 text-center text-sm font-medium text-red-600">
          {errorMsg}
        </p>
      )}

      {page.kind !== "stimulus" && page.kind !== "debrief" && (
        <div className="mt-5">
          <button
            type="button"
            className="btn-primary"
            onClick={handleNext}
            disabled={busy}
          >
            {busy ? "저장 중…" : "다음"}
          </button>
        </div>
      )}
    </Shell>
  );

  // ── Page renderers ──────────────────────────────────────────────────────
  function renderPage(p: SurveyPage) {
    if (p.kind === "consent") {
      return (
        <div data-qcode="CONSENT">
          <ConsentGate
            value={answers["CONSENT"] ?? ""}
            onChange={(v) => setAnswer("CONSENT", v)}
            invalid={invalidCodes.includes("CONSENT")}
          />
        </div>
      );
    }

    if (p.kind === "eligibility") {
      return (
        <div>
          <h1 className="text-xl font-bold text-slate-900">참여 대상 확인</h1>
          <p className="mt-2 text-[15px] text-slate-600">
            아래 문항에 응답해 주십시오.
          </p>
          <div className="mt-5 space-y-4">
            {ELIGIBILITY.map((q) => (
              <div key={q.code} data-qcode={q.code}>
                <SingleChoice
                  code={q.code}
                  text={q.text}
                  options={["예", "아니오"]}
                  value={answers[q.code] ?? ""}
                  onChange={(v) => setAnswer(q.code, v)}
                  invalid={invalidCodes.includes(q.code)}
                  horizontal
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (p.kind === "scenario") {
      return (
        <div>
          <h1 className="text-xl font-bold text-slate-900">{SCENARIO.heading}</h1>
          <p className="mt-4 leading-relaxed text-slate-700">{SCENARIO.body}</p>
          <div className="mt-6" data-qcode="READY">
            <SingleChoice
              code="READY"
              text={SCENARIO.question.text}
              options={SCENARIO.question.options}
              value={answers["READY"] ?? ""}
              onChange={(v) => setAnswer("READY", v)}
              invalid={invalidCodes.includes("READY")}
            />
          </div>
        </div>
      );
    }

    if (p.kind === "stimulus" && session) {
      return <StimulusScreen session={session} onNext={advanceFromStimulus} />;
    }

    if (p.kind === "debrief") {
      return (
        <div>
          <h1 className="text-xl font-bold text-slate-900">{DEBRIEF.heading}</h1>
          <p className="mt-4 leading-relaxed text-slate-700">{DEBRIEF.body}</p>
        </div>
      );
    }

    // questions / wtp_*
    return (
      <div>
        {p.title && (
          <h2 className="text-lg font-bold text-slate-900">{p.title}</h2>
        )}
        {p.instruction && (
          <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
            {p.instruction}
          </p>
        )}
        <div className="mt-5 space-y-4">
          {p.questions.map((q) => (
            <div key={q.code} data-qcode={q.code}>
              <QuestionField
                question={q}
                value={answers[q.code] ?? ""}
                onChange={(v) => setAnswer(q.code, v)}
                invalid={invalidCodes.includes(q.code)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-survey px-4 py-6 sm:py-10">
      {children}
    </main>
  );
}
