// Assemble the ordered list of survey pages for a given session (spec §5).
// Pure function — safe to run on both server and client.

import {
  CORE_BLOCKS,
  IRC1,
  PI_BLOCK,
  WTP_OE,
  WTP_LADDER,
  WTP_B_CODES,
  wtpBinaryQuestion,
  REL_BLOCK,
  MC_BLOCK,
  PQ_BLOCK,
  RECALL_CRITERIA,
  RECALL_EXPL,
  EQ_BLOCK,
  PC_BLOCK,
  AIL_BLOCK,
  INV_BLOCK,
  PSE_BLOCK,
  CAT_BLOCK,
  IRC2,
  DEM_BLOCK,
} from "./survey-config";
import { BLOCK_ORDER_SETS } from "./randomize";
import type { Construct, Question, SessionState, SurveyPage } from "./types";

const CORE_MAP: Record<string, Construct> = Object.fromEntries(
  CORE_BLOCKS.map((b) => [b.key, b]),
);

// Order a construct's items according to the session's saved item_orders.
function orderedItems(c: Construct, session: SessionState): Question[] {
  const order = session.item_orders?.[c.key];
  if (!order) return c.items;
  const byCode: Record<string, Question> = Object.fromEntries(
    c.items.map((q) => [q.code, q]),
  );
  const out = order.map((code) => byCode[code]).filter(Boolean) as Question[];
  // Safety: append any items missing from the stored order.
  for (const q of c.items) if (!order.includes(q.code)) out.push(q);
  return out;
}

function constructPage(
  c: Construct,
  session: SessionState,
  key: string,
): SurveyPage {
  return {
    key,
    kind: "questions",
    title: c.title,
    instruction: c.instruction,
    questions: orderedItems(c, session),
    countsToProgress: true,
  };
}

export function buildPages(session: SessionState): SurveyPage[] {
  const pages: SurveyPage[] = [];

  // P0 consent
  pages.push({
    key: "consent",
    kind: "consent",
    questions: [],
    countsToProgress: false,
  });

  // P1 eligibility / screening
  pages.push({
    key: "eligibility",
    kind: "eligibility",
    questions: [],
    countsToProgress: false,
  });

  // P2 scenario
  pages.push({
    key: "scenario",
    kind: "scenario",
    questions: [],
    countsToProgress: false,
  });

  // P3 stimulus exposure
  pages.push({
    key: "stimulus",
    kind: "stimulus",
    questions: [],
    countsToProgress: false,
  });

  // Core perception blocks in the session's block order
  const order = BLOCK_ORDER_SETS[session.block_order] ?? BLOCK_ORDER_SETS[1];
  order.forEach((blockKey) => {
    const c = CORE_MAP[blockKey];
    if (c) pages.push(constructPage(c, session, `core_${blockKey}`));
  });

  // IRC1 (fixed, after core blocks, before PI)
  pages.push(constructPage(IRC1, session, "irc1"));

  // PI (fixed order)
  pages.push(constructPage(PI_BLOCK, session, "pi"));

  // WTP task (fixed OE -> LADDER -> BINARY)
  pages.push({
    key: "wtp_oe",
    kind: "wtp_oe",
    title: "지불의향 금액",
    questions: [WTP_OE],
    countsToProgress: true,
  });
  pages.push({
    key: "wtp_ladder",
    kind: "wtp_ladder",
    title: "지불의향 가격 선택",
    questions: [WTP_LADDER],
    countsToProgress: true,
  });
  const bOrder =
    session.wtp_b_order && session.wtp_b_order.length === 4
      ? session.wtp_b_order
      : WTP_B_CODES;
  pages.push({
    key: "wtp_binary",
    kind: "wtp_binary",
    title: "가격별 구매 여부",
    instruction: "각 가격에서의 구매 여부를 선택해 주십시오.",
    questions: bOrder.map((code) => wtpBinaryQuestion(code)),
    countsToProgress: true,
  });

  // Post-diagnostic
  pages.push(constructPage(REL_BLOCK, session, "rel"));
  pages.push(constructPage(MC_BLOCK, session, "mc"));
  pages.push(constructPage(PQ_BLOCK, session, "pq"));

  // Recall (manipulation checks — stored only)
  pages.push({
    key: "recall",
    kind: "questions",
    title: "추천 화면 회상",
    questions: [RECALL_CRITERIA, RECALL_EXPL],
    countsToProgress: true,
  });

  // EQ — only when an explanation box was shown (skip C1/C4)
  if (session.explanation !== "none") {
    pages.push(constructPage(EQ_BLOCK, session, "eq"));
  }

  // Individual differences / controls
  pages.push(constructPage(PC_BLOCK, session, "pc"));
  pages.push(constructPage(AIL_BLOCK, session, "ail"));
  pages.push(constructPage(INV_BLOCK, session, "inv"));
  pages.push(constructPage(PSE_BLOCK, session, "pse"));
  pages.push(constructPage(CAT_BLOCK, session, "cat"));
  pages.push(constructPage(IRC2, session, "irc2"));
  pages.push(constructPage(DEM_BLOCK, session, "dem"));

  // P-END debrief
  pages.push({
    key: "debrief",
    kind: "debrief",
    questions: [],
    countsToProgress: false,
  });

  return pages;
}

// Progress percentage (0..100) for a page index, counting only stimulus-onward
// question pages (spec §3: progress shown from after the stimulus).
export function progressPercent(pages: SurveyPage[], index: number): number {
  const counting = pages.filter((p) => p.countsToProgress);
  if (counting.length === 0) return 0;
  const done = pages
    .slice(0, index)
    .filter((p) => p.countsToProgress).length;
  return Math.min(100, Math.round((done / counting.length) * 100));
}
