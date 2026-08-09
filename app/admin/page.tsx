"use client";

import { useState } from "react";

interface Stats {
  perCondition: {
    condition: string;
    recruited: number;
    completed: number;
    target: number;
  }[];
  started: number;
  completed: number;
  screenedOut: number;
  screenReasons: Record<string, number>;
  avgDurationSec: number | null;
  avgExposureSec: number | null;
  attentionChecks: {
    IRC1: { total: number; pass: number };
    IRC2: { total: number; pass: number };
  };
}

const REASON_LABEL: Record<string, string> = {
  consent_no: "동의 거부",
  age: "연령 미달",
  residence: "거주지",
  online: "온라인 구매경험",
  honest: "성실서약 거부",
  unknown: "기타",
};

export default function Admin() {
  const [key, setKey] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/stats", {
        headers: { "x-admin-key": key },
      });
      if (res.status === 401) {
        setError("비밀번호가 올바르지 않습니다.");
        setStats(null);
        return;
      }
      if (!res.ok) throw new Error("failed");
      setStats(await res.json());
    } catch {
      setError("불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function download(type: "wide" | "long") {
    const url = `/api/export?type=${type}&key=${encodeURIComponent(key)}`;
    window.open(url, "_blank");
  }

  const fmtDur = (s: number | null) =>
    s == null ? "—" : `${Math.floor(s / 60)}분 ${s % 60}초`;

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">관리자 대시보드</h1>
      <p className="mt-1 text-slate-500">APJML Main Survey v8</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="password"
          placeholder="관리자 비밀번호"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 sm:max-w-xs"
        />
        <button
          onClick={load}
          disabled={loading || !key}
          className="rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark disabled:opacity-40"
        >
          {loading ? "불러오는 중…" : "조회"}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {stats && (
        <div className="mt-8 space-y-8">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="시작" value={stats.started} />
            <Stat label="완료" value={stats.completed} />
            <Stat label="종료(스크린아웃)" value={stats.screenedOut} />
            <Stat label="평균 소요시간" value={fmtDur(stats.avgDurationSec)} />
          </div>

          {/* Per-condition progress */}
          <section>
            <h2 className="mb-3 text-lg font-bold text-slate-800">
              조건별 모집 · 완료 (목표 각 142)
            </h2>
            <div className="space-y-3">
              {stats.perCondition.map((c) => {
                const pct = Math.min(
                  100,
                  Math.round((c.completed / c.target) * 100),
                );
                return (
                  <div key={c.condition} className="rounded-xl border border-slate-200 p-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">{c.condition}</span>
                      <span className="text-slate-600">
                        완료 {c.completed} / 모집 {c.recruited} · 목표 {c.target}
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full bg-brand"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Screen-out reasons + attention checks + exposure */}
          <section className="grid gap-6 sm:grid-cols-2">
            <div>
              <h2 className="mb-2 text-lg font-bold text-slate-800">
                종료 사유
              </h2>
              <ul className="space-y-1 text-[15px] text-slate-700">
                {Object.keys(stats.screenReasons).length === 0 && (
                  <li className="text-slate-400">없음</li>
                )}
                {Object.entries(stats.screenReasons).map(([k, v]) => (
                  <li key={k} className="flex justify-between">
                    <span>{REASON_LABEL[k] ?? k}</span>
                    <span className="font-semibold">{v}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="mb-2 text-lg font-bold text-slate-800">
                품질 지표
              </h2>
              <ul className="space-y-1 text-[15px] text-slate-700">
                <li className="flex justify-between">
                  <span>자극물 평균 노출시간</span>
                  <span className="font-semibold">
                    {stats.avgExposureSec == null
                      ? "—"
                      : `${stats.avgExposureSec}초`}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>주의점검 통과 (IRC1=3)</span>
                  <span className="font-semibold">
                    {stats.attentionChecks.IRC1.pass}/
                    {stats.attentionChecks.IRC1.total}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>주의점검 통과 (IRC2=6)</span>
                  <span className="font-semibold">
                    {stats.attentionChecks.IRC2.pass}/
                    {stats.attentionChecks.IRC2.total}
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* Export */}
          <section>
            <h2 className="mb-3 text-lg font-bold text-slate-800">
              데이터 내보내기 (UTF-8 BOM)
            </h2>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => download("wide")}
                className="rounded-lg border border-brand px-5 py-3 font-medium text-brand hover:bg-brand-light"
              >
                와이드 CSV (분석용)
              </button>
              <button
                onClick={() => download("long")}
                className="rounded-lg border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
              >
                롱 CSV (감사용)
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}
