"use client";

import { useEffect, useRef, useState } from "react";
import {
  STIMULUS,
  EXPLANATION_BOX,
  STIMULUS_HOLD_SECONDS,
} from "@/lib/survey-config";
import type { SessionState } from "@/lib/types";

interface Props {
  session: SessionState;
  onNext: () => void;
}

export default function StimulusScreen({ session, onNext }: Props) {
  const [remaining, setRemaining] = useState<number>(STIMULUS_HOLD_SECONDS);
  const [enabled, setEnabled] = useState(false);
  const [clicking, setClicking] = useState(false);
  const startedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const criteria =
    session.personalization === "high"
      ? STIMULUS.criteriaHigh
      : STIMULUS.criteriaLow;

  const box =
    session.explanation === "none"
      ? null
      : EXPLANATION_BOX[session.explanation][session.personalization];

  // Register exposure start on the server (idempotent) and drive countdown
  // off the server-authoritative next_enabled_at.
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let enabledAt = Date.now() + STIMULUS_HOLD_SECONDS * 1000;

    async function start() {
      try {
        const res = await fetch("/api/stimulus", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: session.id, action: "start" }),
        });
        const data = await res.json();
        if (data?.next_enabled_at) {
          enabledAt = new Date(data.next_enabled_at).getTime();
        }
      } catch {
        // fall back to local timer
      }
      tick();
      timerRef.current = setInterval(tick, 250);
    }

    function tick() {
      const secs = Math.max(0, Math.ceil((enabledAt - Date.now()) / 1000));
      setRemaining(secs);
      if (secs <= 0) {
        setEnabled(true);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }

    start();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id]);

  async function handleNext() {
    if (!enabled || clicking) return;
    setClicking(true);
    try {
      await fetch("/api/stimulus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id, action: "click" }),
      });
    } catch {
      /* proceed regardless */
    }
    onNext();
  }

  return (
    <div>
      {/* Recommendation card — identical across conditions except criteria count
          and the (optional) explanation box. */}
      <div className="card overflow-hidden">
        <div className="p-5 sm:p-6">
          {/* brand */}
          <div className="border-b border-slate-200 pb-3">
            <span className="text-lg font-extrabold tracking-tight text-slate-800">
              {STIMULUS.brand}
            </span>
          </div>

          {/* ① 추천 기준 */}
          <div className="pt-4">
            <div className="text-sm font-semibold text-slate-500">추천 기준</div>
            <ul className="mt-2 space-y-1.5">
              {criteria.map((c) => (
                <li key={c} className="flex items-start gap-2 text-[15px] text-slate-800">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-500" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ③ 설명 상자 (해당 조건만) */}
          {box && (
            <div className="mt-5 rounded-xl border border-brand/30 bg-brand-light p-4">
              <div className="font-bold text-brand-dark">{box.title}</div>
              <p className="mt-2 text-[14.5px] leading-relaxed text-slate-700">
                {box.body}
              </p>
            </div>
          )}

          {/* ② 추천 결과 */}
          <div className="mt-6 border-t border-slate-200 pt-4">
            <div className="text-sm font-semibold text-slate-500">추천 결과</div>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row">
              <div className="mx-auto w-40 shrink-0 sm:mx-0 sm:w-44">
                <div className="aspect-square w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={STIMULUS.productImage}
                    alt="VARELON V1 헤드폰"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-2xl font-extrabold text-slate-900">
                  {STIMULUS.productName}
                </div>
                <div className="mt-1 text-[15px] text-slate-500">
                  {STIMULUS.productSubtitle}
                </div>
                <ul className="mt-3 space-y-1 text-[14px] text-slate-700">
                  {STIMULUS.productFeatures.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                {/* ⑤ 판매가격 */}
                <div className="mt-4 text-xl font-extrabold text-slate-900">
                  판매가격 {STIMULUS.price}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next button with 25s enforced hold */}
      <div className="mt-5">
        <button
          type="button"
          onClick={handleNext}
          disabled={!enabled || clicking}
          className="btn-primary"
        >
          {enabled ? "다음" : `잠시만 기다려 주세요 · ${remaining}초`}
        </button>
        {!enabled && (
          <p className="mt-2 text-center text-sm text-slate-500">
            추천 화면을 충분히 살펴봐 주십시오.
          </p>
        )}
      </div>
    </div>
  );
}
