// Canonical question-code ordering for the wide CSV export, plus multi-select
// dummy expansion. Kept fixed so exported columns are stable across runs.

import {
  ELIGIBILITY,
  CORE_BLOCKS,
  IRC1,
  PI_BLOCK,
  WTP_B_CODES,
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

// Canonical (analysis) order — NOT the randomized presentation order.
export const CANONICAL_CODES: string[] = [
  "CONSENT",
  ...ELIGIBILITY.map((e) => e.code),
  "READY",
  ...CORE_BLOCKS.flatMap((b) => b.items.map((i) => i.code)),
  IRC1.items[0].code,
  ...PI_BLOCK.items.map((i) => i.code),
  "WTP_OE",
  "WTP_LADDER",
  ...WTP_B_CODES,
  ...REL_BLOCK.items.map((i) => i.code),
  ...MC_BLOCK.items.map((i) => i.code),
  ...PQ_BLOCK.items.map((i) => i.code),
  RECALL_CRITERIA.code,
  RECALL_EXPL.code,
  ...EQ_BLOCK.items.map((i) => i.code),
  ...PC_BLOCK.items.map((i) => i.code),
  ...AIL_BLOCK.items.map((i) => i.code),
  ...INV_BLOCK.items.map((i) => i.code),
  ...PSE_BLOCK.items.map((i) => i.code),
  ...CAT_BLOCK.items.map((i) => i.code),
  IRC2.items[0].code,
  ...DEM_BLOCK.items.map((i) => i.code),
];

// Multi-select questions get one 0/1 dummy column per option.
export const MULTI_DUMMY: Record<string, string[]> = {
  RECALL_CRITERIA: RECALL_CRITERIA.options ?? [],
};

// Sanitize an option label into a column-name-safe suffix.
export function dummySuffix(label: string): string {
  return label.replace(/[^0-9A-Za-z가-힣]+/g, "");
}
