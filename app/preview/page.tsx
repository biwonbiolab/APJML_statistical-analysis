import {
  STIMULUS,
  EXPLANATION_BOX,
  CONDITIONS,
  ALL_CONDITIONS,
} from "@/lib/survey-config";
import type { ConditionCode } from "@/lib/types";

export const dynamic = "force-dynamic";

const PERS_LABEL: Record<string, string> = {
  low: "낮은 개인화 (추천기준 2개)",
  high: "높은 개인화 (추천기준 6개)",
};
const EXPL_LABEL: Record<string, string> = {
  none: "설명 없음",
  rationale: "추천근거",
  data_control: "데이터 이용·통제",
};

function StimulusCard({ code }: { code: ConditionCode }) {
  const spec = CONDITIONS[code];
  const criteria =
    spec.personalization === "high"
      ? STIMULUS.criteriaHigh
      : STIMULUS.criteriaLow;
  const box =
    spec.explanation === "none"
      ? null
      : EXPLANATION_BOX[spec.explanation][spec.personalization];

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
        <span className="text-sm font-bold text-brand-dark">
          {code} — {PERS_LABEL[spec.personalization]} × {EXPL_LABEL[spec.explanation]}
        </span>
      </div>
      <div className="p-5 sm:p-6">
        <div className="border-b border-slate-200 pb-3">
          <span className="text-lg font-extrabold tracking-tight text-slate-800">
            {STIMULUS.brand}
          </span>
        </div>

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

        {box && (
          <div className="mt-5 rounded-xl border border-brand/30 bg-brand-light p-4">
            <div className="font-bold text-brand-dark">{box.title}</div>
            <p className="mt-2 text-[14.5px] leading-relaxed text-slate-700">
              {box.body}
            </p>
          </div>
        )}

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
              <div className="mt-4 text-xl font-extrabold text-slate-900">
                판매가격 {STIMULUS.price}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PreviewPage({
  searchParams,
}: {
  searchParams: { key?: string };
}) {
  const authorized =
    !!process.env.ADMIN_PASSWORD && searchParams.key === process.env.ADMIN_PASSWORD;

  if (!authorized) {
    return (
      <main className="mx-auto max-w-survey px-4 py-16 text-center">
        <div className="card p-8">
          <h1 className="text-lg font-bold text-slate-800">검수 전용 페이지</h1>
          <p className="mt-3 text-slate-600">
            관리자 암호가 필요합니다. 주소 끝에{" "}
            <code className="rounded bg-slate-100 px-1">?key=관리자암호</code> 를
            붙여 접속해 주십시오.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">자극물 6조건 검수</h1>
      <p className="mt-1 text-slate-500">
        연구자 전용. 참가자에게는 아래 중 무작위 배정된 1개 조건만 제시됩니다.
      </p>
      <div className="mt-6 space-y-8">
        {ALL_CONDITIONS.map((code) => (
          <StimulusCard key={code} code={code} />
        ))}
      </div>
    </main>
  );
}
