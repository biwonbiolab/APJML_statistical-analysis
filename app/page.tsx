"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function Landing() {
  return (
    <Suspense fallback={null}>
      <LandingInner />
    </Suspense>
  );
}

function LandingInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Admin QA only: ?force=C1..C6&key=ADMIN_PASSWORD (ignored without a valid key).
  const force = searchParams.get("force") ?? "";
  const key = searchParams.get("key") ?? "";

  async function start() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAgent:
            typeof navigator !== "undefined" ? navigator.userAgent : "",
          force,
          adminKey: key,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.session?.id) {
        throw new Error(data?.error ?? "failed");
      }
      router.push(`/survey/${data.session.id}`);
    } catch {
      setError("설문을 시작하지 못했습니다. 잠시 후 다시 시도해 주십시오.");
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-survey flex-col justify-center px-4 py-10">
      <div className="card p-7 sm:p-9">
        <h1 className="text-2xl font-bold leading-snug text-slate-900">
          온라인 쇼핑 추천 화면에 대한
          <br />
          소비자 인식 연구
        </h1>
        <p className="mt-4 leading-relaxed text-slate-700">
          본 설문은 온라인 쇼핑몰의 상품 추천 화면이 소비자의 판단에 어떤 영향을
          주는지 알아보기 위한 학술연구입니다. 가상의 추천 화면을 확인한 뒤
          몇 가지 질문에 응답하시게 됩니다.
        </p>
        <ul className="mt-4 space-y-1.5 text-[15px] text-slate-600">
          <li>· 예상 소요시간: 약 12–15분</li>
          <li>· 참여는 자발적이며 언제든 중단할 수 있습니다</li>
          <li>· 정답이 없으니 평소 생각대로 응답해 주십시오</li>
        </ul>

        <button
          type="button"
          onClick={start}
          disabled={busy}
          className="btn-primary mt-8"
        >
          {busy ? "준비 중…" : "설문 시작하기"}
        </button>
        {error && (
          <p className="mt-3 text-center text-sm text-red-600">{error}</p>
        )}
      </div>
    </main>
  );
}
