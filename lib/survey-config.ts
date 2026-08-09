// ─────────────────────────────────────────────────────────────────────────
// APJML Main Survey v8 — full item bank & stimulus content.
// This file is the single source of truth for all questionnaire content.
// (Spec §5–§9.) No condition codes / researcher notes are ever rendered.
// ─────────────────────────────────────────────────────────────────────────

import type {
  ConditionCode,
  ConditionSpec,
  Construct,
  Question,
} from "./types";
import { PRODUCT_IMAGE_DATA_URI } from "./product-image";

// Default 7-point Likert anchors.
const A_AGREE: [string, string] = ["전혀 그렇지 않다", "매우 그렇다"];

export const LIKERT_COMMON_INTRO =
  "다음 문장에 동의하는 정도를 선택해 주십시오. (1 = 전혀 그렇지 않다 · 7 = 매우 그렇다)";

// Helper to build a 7-point Likert item with default agree anchors.
const lk = (code: string, text: string): Question => ({
  code,
  text,
  type: "likert7",
  anchors: A_AGREE,
  required: true,
});

const yn = (code: string, text: string): Question => ({
  code,
  text,
  type: "yesno",
  options: ["예", "아니오"],
  required: true,
});

// ── Condition mapping (§7) ────────────────────────────────────────────────
export const CONDITIONS: Record<ConditionCode, ConditionSpec> = {
  C1: { code: "C1", personalization: "low", explanation: "none" },
  C2: { code: "C2", personalization: "low", explanation: "rationale" },
  C3: { code: "C3", personalization: "low", explanation: "data_control" },
  C4: { code: "C4", personalization: "high", explanation: "none" },
  C5: { code: "C5", personalization: "high", explanation: "rationale" },
  C6: { code: "C6", personalization: "high", explanation: "data_control" },
};

export const ALL_CONDITIONS: ConditionCode[] = [
  "C1",
  "C2",
  "C3",
  "C4",
  "C5",
  "C6",
];

// ── Stimulus content (§7) ─────────────────────────────────────────────────
export const STIMULUS = {
  brand: "VARELON",
  productName: "VARELON V1",
  productSubtitle: "무선 오버이어 노이즈캔슬링 헤드폰",
  productImage: PRODUCT_IMAGE_DATA_URI,
  productFeatures: [
    "40mm 다이내믹 드라이버",
    "액티브 노이즈캔슬링 및 주변음 허용 모드",
    "고해상도 무선 오디오 및 공간음향",
    "Bluetooth 5.4 멀티포인트 연결",
    "노이즈캔슬링 사용 시 최대 35시간 재생",
    "USB-C 및 3.5mm 오디오 연결",
    "무게 약 265g",
    "그래파이트 블랙",
    "2년 제한 보증",
  ],
  price: "890,000원",
  criteriaLow: ["출퇴근·이동", "희망 구매가격대 70만~100만원"],
  criteriaHigh: [
    "출퇴근·이동",
    "희망 구매가격대 70만~100만원",
    "소음 차단 중요",
    "공간음향 관심",
    "두 대의 기기 연결 선호",
    "긴 배터리 사용시간 선호",
  ],
};

// Explanation box content per explanation type (§7).
export const EXPLANATION_BOX: Record<
  Exclude<ConditionSpec["explanation"], "none">,
  Record<"low" | "high", { title: string; body: string }>
> = {
  rationale: {
    low: {
      title: "왜 이 제품을 추천했나요?",
      body: "출퇴근·이동 중 주변 소음을 줄이고 안정적으로 음악과 영상을 이용하려는 목적에 적합합니다. 최대 35시간의 배터리 사용시간과 890,000원의 판매가격도 설정한 사용 목적과 희망 구매가격대에 부합합니다.",
    },
    high: {
      title: "왜 이 제품을 추천했나요?",
      body: "이동 중 소음 차단을 중요하게 생각하고, 공간음향과 두 대의 기기 연결 기능을 선호하며, 긴 배터리 사용시간을 원하는 이용 특성에 적합합니다. VARELON V1의 노이즈캔슬링, 공간음향, 멀티포인트 연결 및 최대 35시간 재생 기능이 이러한 요구와 희망 구매가격대에 부합합니다.",
    },
  },
  data_control: {
    low: {
      title: "추천에 어떤 정보가 사용되었나요?",
      body: "이번 추천에는 현재 설정한 사용 목적과 희망 구매가격대만 사용되었습니다. 해당 정보는 이번 제품 추천을 위해 처리되며, 다른 계정 정보는 반영되지 않았습니다. 추천 설정에서 사용된 정보를 언제든 확인하거나 변경할 수 있습니다.",
    },
    high: {
      title: "추천에 어떤 정보가 사용되었나요?",
      body: "이번 추천에는 현재 설정한 사용 목적과 희망 구매가격대, 최근 제품 열람·비교 항목 및 이전 구매 특성이 사용되었습니다. 음성·생체·청력정보와 실시간 청취기록은 사용되지 않습니다. 추천 설정에서 각 정보를 확인·변경·제외하거나 삭제할 수 있습니다.",
    },
  },
};

// ── §8.1 Core perception blocks (7pt, item order randomized) ──────────────
export const CORE_BLOCKS: Construct[] = [
  {
    key: "TRN",
    title: "지각된 투명성",
    instruction: LIKERT_COMMON_INTRO,
    randomizeItems: true,
    items: [
      lk("TRN1", "이 추천이 제시된 근거가 명확했다."),
      lk("TRN2", "이 제품이 추천된 이유를 이해할 수 있었다."),
      lk("TRN3", "추천 과정은 내가 판단할 수 있을 만큼 투명했다."),
    ],
  },
  {
    key: "CTL",
    title: "지각된 통제",
    instruction: LIKERT_COMMON_INTRO,
    randomizeItems: true,
    items: [
      lk("CTL1", "추천에 사용된 정보를 확인할 수 있다고 느꼈다."),
      lk("CTL2", "추천에 사용된 정보가 잘못된 경우 수정할 수 있다고 느꼈다."),
      lk("CTL3", "추천에 사용되는 정보의 범위를 제한할 수 있다고 느꼈다."),
      lk("CTL4", "원한다면 맞춤 추천 기능을 끌 수 있다고 느꼈다."),
    ],
  },
  {
    key: "TRU",
    title: "AI 추천 서비스에 대한 신뢰",
    instruction: LIKERT_COMMON_INTRO,
    randomizeItems: true,
    items: [
      lk("TRU1", "이 브랜드의 AI 추천 서비스를 신뢰할 수 있다고 느꼈다."),
      lk("TRU2", "이 브랜드의 AI 추천 서비스는 믿고 의지할 만해 보였다."),
      lk("TRU3", "이 브랜드의 AI 추천 서비스는 정직하게 작동하는 것처럼 보였다."),
      lk("TRU4", "이 구매결정을 내릴 때 이 AI 추천 서비스에 의지할 수 있을 것 같다."),
    ],
  },
  {
    key: "SUR",
    title: "지각된 감시",
    instruction:
      "이 추천을 보면서 다음과 같은 느낌이 어느 정도 들었습니까? (1 = 전혀 들지 않았다 · 7 = 매우 많이 들었다)",
    randomizeItems: true,
    items: [
      {
        code: "SUR1",
        text: "브랜드가 내 어깨너머로 지켜보는 듯한 느낌이 들었다.",
        type: "likert7",
        anchors: ["전혀 들지 않았다", "매우 많이 들었다"],
        required: true,
      },
      {
        code: "SUR2",
        text: "브랜드가 나의 모든 움직임을 지켜보는 듯한 느낌이 들었다.",
        type: "likert7",
        anchors: ["전혀 들지 않았다", "매우 많이 들었다"],
        required: true,
      },
      {
        code: "SUR3",
        text: "브랜드가 나의 사적인 영역에 들어온 듯한 느낌이 들었다.",
        type: "likert7",
        anchors: ["전혀 들지 않았다", "매우 많이 들었다"],
        required: true,
      },
      {
        code: "SUR4",
        text: "브랜드가 나를 계속 확인하는 듯한 느낌이 들었다.",
        type: "likert7",
        anchors: ["전혀 들지 않았다", "매우 많이 들었다"],
        required: true,
      },
    ],
  },
  {
    key: "PR",
    title: "지각된 프라이버시 위험",
    instruction: LIKERT_COMMON_INTRO,
    randomizeItems: true,
    items: [
      lk("PR1", "내 정보가 내가 원하지 않는 목적으로 사용될 위험이 있다고 느꼈다."),
      lk("PR2", "내 정보가 허가받지 않은 사람이나 기관에 공유될 위험이 있다고 느꼈다."),
      lk("PR3", "내 정보가 추천 목적을 넘어 사용될 위험이 있다고 느꼈다."),
      lk("PR4", "전반적으로 이 추천은 개인정보 보호 측면에서 위험하게 느껴졌다."),
    ],
  },
  {
    key: "AUT",
    title: "지각된 브랜드 진정성",
    instruction: "VARELON 브랜드에 대한 생각을 선택해 주십시오. (1 = 전혀 그렇지 않다 · 7 = 매우 그렇다)",
    randomizeItems: true,
    items: [
      lk("AUT1", "이 브랜드는 진정성 있게 느껴졌다."),
      lk("AUT2", "이 브랜드의 행동은 브랜드가 내세우는 가치와 일관되어 보였다."),
      lk("AUT3", "이 브랜드는 자신이 한 약속에 충실한 것처럼 보였다."),
      lk("AUT4", "이 브랜드가 소비자를 대하는 방식은 진실되고 꾸밈없어 보였다."),
    ],
  },
];

export const IRC1: Construct = {
  key: "IRC1",
  instruction: "응답 품질 확인을 위한 문항입니다.",
  items: [
    {
      code: "IRC1",
      text: "응답 품질 확인을 위해 이 문항에서는 '3'을 선택해 주십시오.",
      type: "likert7",
      anchors: A_AGREE,
      required: true,
    },
  ],
};

export const PI_BLOCK: Construct = {
  key: "PI",
  title: "프리미엄 제품 구매의도",
  instruction:
    "VARELON V1에 대한 현재의 구매의도를 선택해 주십시오. (1 = 전혀 가능성/의향 없음 · 7 = 매우 높은 가능성/의향)",
  randomizeItems: false, // fixed order (spec §11)
  items: [
    {
      code: "PI1",
      text: "이 헤드폰을 구매할 가능성은 어느 정도입니까?",
      type: "likert7",
      anchors: ["전혀 가능성 없음", "매우 높은 가능성"],
      required: true,
    },
    {
      code: "PI2",
      text: "실제로 이 헤드폰을 구매할 것 같습니까?",
      type: "likert7",
      anchors: ["전혀 그렇지 않다", "매우 그렇다"],
      required: true,
    },
    {
      code: "PI3",
      text: "이 헤드폰을 구매할 의향은 어느 정도입니까?",
      type: "likert7",
      anchors: ["전혀 의향 없음", "매우 높은 의향"],
      required: true,
    },
  ],
};

// ── §8.2 WTP task (fixed order OE → LADDER → BINARY) ───────────────────────
export const WTP_OE: Question = {
  code: "WTP_OE",
  text: "VARELON V1을 구매한다고 할 때, 지불할 의향이 있는 최대 금액을 원 단위로 입력해 주십시오.",
  type: "number",
  number: {
    min: 0,
    unit: "원",
    thousandSep: true,
    confirmAbove: 10_000_000,
    placeholder: "예: 500,000",
  },
  required: true,
};

export const WTP_LADDER: Question = {
  code: "WTP_LADDER",
  text: "다음 중 VARELON V1을 구매할 의향이 있는 가장 높은 가격을 하나만 선택해 주십시오.",
  type: "single",
  options: [
    "760,000원에도 구매하지 않음",
    "760,000원",
    "850,000원",
    "890,000원",
    "930,000원",
    "980,000원",
    "1,020,000원 이상도 지불할 수 있음",
  ],
  required: true,
};

// price is FIXED per code; only screen order is randomized (wtp_b_order).
export const WTP_BINARY_PRICES: Record<string, number> = {
  WTP_B1: 760_000,
  WTP_B2: 890_000,
  WTP_B3: 980_000,
  WTP_B4: 1_110_000,
};

export const WTP_B_CODES = ["WTP_B1", "WTP_B2", "WTP_B3", "WTP_B4"];

export function wtpBinaryQuestion(code: string): Question {
  const price = WTP_BINARY_PRICES[code];
  return {
    code,
    text: `VARELON V1의 판매가격이 ${price.toLocaleString("ko-KR")}원이라면 구매하시겠습니까?`,
    type: "yesno",
    options: ["구매함", "구매하지 않음"],
    required: true,
  };
}

// ── §8.3 Post-diagnostic ──────────────────────────────────────────────────
export const REL_BLOCK: Construct = {
  key: "REL",
  title: "지각된 관련성",
  instruction: LIKERT_COMMON_INTRO,
  randomizeItems: true,
  items: [
    lk("REL1", "추천 제품은 내 요구와 관련이 있었다."),
    lk("REL2", "추천 제품은 내가 찾는 제품과 잘 맞았다."),
    lk("REL3", "추천 내용은 나에게 유용하게 맞춤화되어 있었다."),
  ],
};

// MC — presentation order fixed exactly as listed (spec §8.3).
export const MC_BLOCK: Construct = {
  key: "MC",
  title: "추천 화면 인식",
  instruction: LIKERT_COMMON_INTRO,
  randomizeItems: false,
  items: [
    lk("MC1", "이 추천은 나에 대한 다양한 정보를 바탕으로 만들어진 것 같았다."),
    lk("MC11", "이 추천은 깊이 개인화되어 있었다."),
    lk("MC2", "추천이 제시된 이유 또는 사용 정보가 설명되어 있었다."),
    lk("MC3", "설명은 이 제품이 나에게 적합한 이유에 초점을 두었다."),
    lk("MC4", "설명은 추천에 어떤 정보가 사용되었는지를 알려주었다."),
    lk("MC15", "설명은 내가 정보 사용을 통제할 수 있음을 분명히 전달했다."),
    lk("MC5", "이 쇼핑 상황은 현실적으로 느껴졌다."),
  ],
};

export const PQ_BLOCK: Construct = {
  key: "PQ",
  title: "제품·가격 등가성",
  instruction: LIKERT_COMMON_INTRO,
  randomizeItems: false,
  items: [
    lk("PQ1", "VARELON V1은 품질이 높아 보였다."),
    lk("PQ2", "VARELON V1은 기술적 성능이 우수해 보였다."),
    lk("PQ3", "VARELON V1은 전반적으로 잘 만들어진 제품처럼 보였다."),
    lk("PRICE_REAL", "890,000원은 이와 같은 제품에 실제로 책정될 법한 가격으로 느껴졌다."),
    lk("PRICE_EXP", "890,000원은 나에게 비싸게 느껴졌다."),
  ],
};

export const RECALL_CRITERIA: Question = {
  code: "RECALL_CRITERIA",
  text: "추천 기준으로 제시되었던 항목을 모두 선택해 주십시오.",
  type: "multi",
  options: [
    "출퇴근·이동",
    "희망 구매가격대 70만–100만원",
    "소음 차단 중요",
    "공간음향 관심",
    "두 대의 기기 연결 선호",
    "긴 배터리 사용시간 선호",
    "기억나지 않음",
  ],
  exclusiveValues: ["기억나지 않음"],
  required: true,
};

export const RECALL_EXPL: Question = {
  code: "RECALL_EXPL",
  text: "추천 결과 아래에 제시된 안내 유형은 무엇이었습니까?",
  type: "single",
  options: [
    "별도의 설명이 없었다",
    "제품이 나에게 적합한 이유를 설명했다",
    "추천에 사용된 정보와 통제방법을 설명했다",
    "기억나지 않음",
  ],
  required: true,
};

// EQ — NOT presented when explanation === "none" (C1/C4).
export const EQ_BLOCK: Construct = {
  key: "EQ",
  title: "설명문 등가성",
  instruction: LIKERT_COMMON_INTRO,
  randomizeItems: false,
  items: [
    lk("MC6", "설명은 읽고 이해하기 쉬웠다."),
    lk("MC7", "설명은 길게 느껴졌다."),
    lk("MC8", "설명에는 많은 정보가 담겨 있었다."),
  ],
};

// ── §8.4 Individual differences / controls ────────────────────────────────
export const PC_BLOCK: Construct = {
  key: "PC",
  title: "일반적 프라이버시 우려",
  instruction: "평소 온라인 정보 이용에 대한 생각을 선택해 주십시오. (1 = 전혀 그렇지 않다 · 7 = 매우 그렇다)",
  randomizeItems: true,
  items: [
    lk("PC1", "온라인 기업이 나에 대한 정보를 지나치게 많이 수집할까 우려한다."),
    lk("PC2", "온라인에서 내 정보에 대한 통제권을 잃을까 우려한다."),
    lk("PC3", "온라인 기업이 내 정보를 예상하지 못한 방식으로 사용할까 우려한다."),
    lk("PC4", "온라인 기업이 내가 모르는 사이에 내 정보를 다른 곳과 공유할까 우려한다."),
  ],
};

export const AIL_BLOCK: Construct = {
  key: "AIL",
  title: "AI 리터러시",
  instruction: "인공지능에 관한 자신의 역량을 선택해 주십시오. (1 = 전혀 그렇지 않다 · 7 = 매우 그렇다)",
  randomizeItems: true,
  items: [
    lk("AIL1", "나는 인공지능의 핵심 개념을 알고 있다."),
    lk("AIL2", "나는 인공지능이 무엇을 의미하는지 알고 있다."),
    lk("AIL3", "나는 인공지능 사용의 한계와 가능성을 평가할 수 있다."),
    lk("AIL4", "나는 인공지능 사용의 장점과 단점을 평가할 수 있다."),
  ],
};

export const INV_BLOCK: Construct = {
  key: "INV",
  title: "프리미엄 오버이어 헤드폰 관여도",
  instruction: LIKERT_COMMON_INTRO,
  randomizeItems: true,
  items: [
    lk("INV1", "프리미엄 오버이어 헤드폰은 나에게 중요하다."),
    lk("INV2", "프리미엄 오버이어 헤드폰은 나와 관련이 있다."),
    lk("INV3", "프리미엄 오버이어 헤드폰은 나에게 흥미롭다."),
  ],
};

export const PSE_BLOCK: Construct = {
  key: "PSE",
  title: "가격의식",
  instruction: LIKERT_COMMON_INTRO,
  randomizeItems: true,
  items: [
    lk("PSE1", "나는 헤드폰과 같은 전자제품의 더 낮은 가격을 찾기 위해 추가적인 노력을 기울인다."),
    lk("PSE2", "나는 낮은 가격을 찾기 위해 여러 판매처의 가격을 비교한다."),
    lk("PSE3", "더 낮은 가격을 찾아 절약하는 금액은 들이는 시간과 노력만큼 가치가 있다."),
  ],
};

// CAT — mixed item types, fixed order.
export const CAT_BLOCK: Construct = {
  key: "CAT",
  title: "헤드폰·온라인 이용경험",
  randomizeItems: false,
  items: [
    yn("CATOWN", "현재 오버이어 헤드폰을 보유하고 있습니까?"),
    {
      code: "CATUSE",
      text: "최근 3개월 동안 헤드폰 또는 이어폰을 얼마나 자주 사용했습니까?",
      type: "single",
      options: [
        "전혀 사용하지 않음",
        "월 1회 미만",
        "월 1–3회",
        "주 1–2회",
        "주 3–4회",
        "주 5–6회",
        "매일",
      ],
      required: true,
    },
    yn("CATBUY", "최근 12개월 동안 헤드폰 또는 이어폰을 구매한 적이 있습니까?"),
    {
      code: "CATFAM",
      text: "프리미엄 오버이어 헤드폰에 얼마나 친숙합니까?",
      type: "likert7",
      anchors: ["전혀 친숙하지 않다", "매우 친숙하다"],
      required: true,
    },
    {
      code: "EXP_AI",
      text: "온라인 쇼핑에서 AI 추천 또는 맞춤형 상품 추천을 얼마나 자주 이용합니까?",
      type: "single",
      options: [
        "전혀 이용하지 않음",
        "거의 이용하지 않음",
        "가끔 이용함",
        "자주 이용함",
        "매우 자주 이용함",
      ],
      required: true,
    },
    {
      code: "FREQ_ON",
      text: "평균적으로 온라인 쇼핑을 얼마나 자주 합니까?",
      type: "single",
      options: [
        "월 1회 미만",
        "월 1–2회",
        "월 3–5회",
        "월 6–9회",
        "월 10회 이상",
      ],
      required: true,
    },
  ],
};

export const IRC2: Construct = {
  key: "IRC2",
  instruction: "응답 품질 확인을 위한 문항입니다.",
  items: [
    {
      code: "IRC2",
      text: "응답 품질 확인을 위해 이 문항에서는 '6'을 선택해 주십시오.",
      type: "likert7",
      anchors: A_AGREE,
      required: true,
    },
  ],
};

// DEM — optional (missing allowed).
export const DEM_BLOCK: Construct = {
  key: "DEM",
  title: "인구통계 (선택 · 응답하지 않아도 됩니다)",
  randomizeItems: false,
  items: [
    {
      code: "AGE",
      text: "현재 만 나이를 숫자로 입력해 주십시오.",
      type: "number",
      number: { min: 0, unit: "세", thousandSep: false, placeholder: "예: 34" },
      required: false,
    },
    {
      code: "GENDER",
      text: "성별을 선택해 주십시오.",
      type: "single",
      options: ["여성", "남성", "논바이너리·기타", "응답하지 않음"],
      required: false,
    },
    {
      code: "EDU",
      text: "최종 학력을 선택해 주십시오.",
      type: "single",
      options: [
        "고등학교 졸업 이하",
        "전문대학 재학·졸업",
        "대학교 재학·졸업",
        "대학원 재학·졸업",
        "응답하지 않음",
      ],
      required: false,
    },
    {
      code: "INCOME",
      text: "월 평균 가구 소득을 선택해 주십시오.",
      type: "single",
      options: [
        "200만원 미만",
        "200만–399만원",
        "400만–599만원",
        "600만–799만원",
        "800만–999만원",
        "1,000만원 이상",
        "응답하지 않음",
      ],
      required: false,
    },
  ],
};

// ── §9 Static text ────────────────────────────────────────────────────────
export const CONSENT = {
  heading: "연구 참여 안내 및 동의",
  rows: [
    ["연구 제목", "온라인 쇼핑 추천 화면에 대한 소비자 인식 연구"],
    ["연구윤리 심의", "한성대학교 IRB 심의 예정 (2026년 9월). 승인 후 승인번호로 안내드립니다."],
    [
      "연구 목적",
      "온라인 쇼핑몰에서 제시되는 상품 추천 정보가 소비자의 판단에 어떤 영향을 주는지 알아보기 위한 학술연구입니다.",
    ],
    [
      "참여 내용 및 시간",
      "가상의 헤드폰 추천 화면을 확인한 뒤 인식과 구매 판단에 관한 설문에 응답합니다. 예상 소요시간은 약 12–15분입니다.",
    ],
    [
      "위험과 불편",
      "일부 문항은 온라인 활동정보와 개인정보 이용에 관한 생각을 묻습니다. 불편함을 느끼면 언제든 참여를 중단할 수 있습니다.",
    ],
    [
      "개인정보 및 자료관리",
      "실제 계정, 검색기록, 구매기록은 사용하지 않습니다. 수집자료는 연구 종료 후 1년간 보관한 뒤 복구할 수 없는 방법으로 폐기합니다. 구체적인 수집항목과 폐기방법은 추후 승인되는 IRB 동의문에 따르며, 승인문과 본 문서가 다를 경우 승인문을 우선합니다.",
    ],
    [
      "자발성 및 철회",
      "참여는 자발적이며 참여하지 않거나 중단해도 불이익이 없습니다. 제출 후 철회 가능 범위와 절차는 승인문의 안내를 따릅니다.",
    ],
    ["문의", "이승준 교수 (한성대학교, 02-760-4078, joon2452@hansung.kr)"],
  ] as [string, string][],
  question: {
    code: "CONSENT",
    text: "위 내용을 읽고 이해했으며 연구 참여에 자발적으로 동의하십니까?",
    options: ["동의함", "동의하지 않음"],
  },
};

export const ELIGIBILITY: {
  code: string;
  text: string;
  passAnswer: string;
  reason: string;
}[] = [
  { code: "ELIG_AGE", text: "귀하는 만 19세 이상입니까?", passAnswer: "예", reason: "age" },
  { code: "ELIG_KR", text: "귀하는 대한민국에 거주하고 있습니까?", passAnswer: "예", reason: "residence" },
  {
    code: "ELIG_ONLINE",
    text: "최근 6개월 이내에 온라인으로 상품을 구매한 경험이 있습니까?",
    passAnswer: "예",
    reason: "online",
  },
  {
    code: "HONEST",
    text: "본 설문에 성실하게 응답할 것을 서약하십니까?",
    passAnswer: "예",
    reason: "honest",
  },
];

export const SCENARIO = {
  heading: "가상 쇼핑 상황 안내",
  body: "다음은 온라인 쇼핑몰에서 헤드폰을 추천받는 가상의 상황입니다. 화면에 제시되는 이용정보와 구매이력은 실험을 위해 설정된 가상 정보이며, 귀하의 실제 계정이나 이용기록은 사용되지 않습니다. 아래 상황을 본인의 쇼핑 상황이라고 가정하고 내용을 확인해 주십시오.",
  question: {
    code: "READY",
    text: "안내 내용을 이해했으며 다음 화면을 확인할 준비가 되셨습니까?",
    options: ["예"],
  },
};

export const DEBRIEF = {
  heading: "설문이 완료되었습니다",
  body: "설문에 참여해 주셔서 감사합니다. VARELON은 본 연구를 위해 만든 가상 브랜드이며, 추천 화면의 이용정보와 구매이력도 실험을 위해 설정된 가상 정보입니다. 귀하의 실제 계정·검색기록·구매기록·음성·생체·청력정보 또는 실시간 청취기록은 사용되지 않았습니다. 본 연구는 개인화 수준과 설명 방식이 소비자 인식과 판단에 미치는 영향을 알아보기 위한 것입니다. 연구에 관한 문의처는 외부 모집 전 최종 동의문에 안내합니다.",
};

// Screen-out messages by reason.
export const SCREEN_OUT_MESSAGES: Record<string, string> = {
  consent_no: "연구 참여에 동의하지 않으셨습니다. 참여를 원치 않으시는 경우 창을 닫으셔도 됩니다. 관심 가져 주셔서 감사합니다.",
  age: "본 연구는 만 19세 이상을 대상으로 합니다. 참여해 주셔서 감사합니다.",
  residence: "본 연구는 대한민국 거주자를 대상으로 합니다. 참여해 주셔서 감사합니다.",
  online: "본 연구는 최근 온라인 구매 경험이 있는 분을 대상으로 합니다. 참여해 주셔서 감사합니다.",
  honest: "성실 응답에 동의하지 않으셨습니다. 참여해 주셔서 감사합니다.",
};

export const STIMULUS_HOLD_SECONDS = 25;

// The recall "correct" criteria sets (scoring reference only; stored not enforced).
export const RECALL_CORRECT = {
  low: STIMULUS.criteriaLow, // first 2
  high: STIMULUS.criteriaHigh, // first 6
};
