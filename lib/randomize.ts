// Session-level randomization (spec §6).

import {
  CORE_BLOCKS,
  REL_BLOCK,
  PC_BLOCK,
  AIL_BLOCK,
  INV_BLOCK,
  PSE_BLOCK,
  WTP_B_CODES,
} from "./survey-config";
import type { Construct } from "./types";

// 4 balanced block-order sets for the 6 core perception blocks.
export const BLOCK_ORDER_SETS: Record<number, string[]> = {
  1: ["TRN", "CTL", "TRU", "SUR", "PR", "AUT"],
  2: ["AUT", "PR", "SUR", "TRU", "CTL", "TRN"],
  3: ["SUR", "PR", "AUT", "TRN", "CTL", "TRU"],
  4: ["TRU", "CTL", "TRN", "AUT", "PR", "SUR"],
};

// Fisher–Yates shuffle (pure, returns a new array).
export function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Constructs whose within-construct item order is randomized per session.
const RANDOMIZED_CONSTRUCTS: Construct[] = [
  ...CORE_BLOCKS,
  REL_BLOCK,
  PC_BLOCK,
  AIL_BLOCK,
  INV_BLOCK,
  PSE_BLOCK,
];

// Build per-session item presentation orders for every randomized construct.
export function buildItemOrders(): Record<string, string[]> {
  const orders: Record<string, string[]> = {};
  for (const c of RANDOMIZED_CONSTRUCTS) {
    if (c.randomizeItems) {
      orders[c.key] = shuffle(c.items.map((i) => i.code));
    } else {
      orders[c.key] = c.items.map((i) => i.code);
    }
  }
  return orders;
}

export function pickBlockOrder(): number {
  return 1 + Math.floor(Math.random() * 4);
}

export function buildWtpBOrder(): string[] {
  return shuffle(WTP_B_CODES);
}
