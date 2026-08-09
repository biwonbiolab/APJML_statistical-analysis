// Shared types for the APJML survey platform.

export type ConditionCode = "C1" | "C2" | "C3" | "C4" | "C5" | "C6";
export type Personalization = "low" | "high";
export type Explanation = "none" | "rationale" | "data_control";

export interface ConditionSpec {
  code: ConditionCode;
  personalization: Personalization;
  explanation: Explanation;
}

// One question item.
export type QuestionType =
  | "likert7"
  | "single"
  | "multi"
  | "number"
  | "yesno";

export interface Question {
  code: string;
  text: string;
  type: QuestionType;
  // Likert anchor labels [left(1), right(7)]
  anchors?: [string, string];
  // for single / multi — the displayed label is also the stored value
  options?: string[];
  // number field extras
  number?: {
    min?: number;
    unit?: string; // e.g. "원", "세"
    thousandSep?: boolean;
    confirmAbove?: number; // one-time confirm dialog threshold
    placeholder?: string;
  };
  required: boolean;
  // multi choice option that is exclusive (e.g. "기억나지 않음")
  exclusiveValues?: string[];
}

// A construct (group of items sharing an instruction / anchors).
export interface Construct {
  key: string; // e.g. "TRN"
  title?: string; // shown as small heading (never a condition code)
  instruction?: string; // block-level instruction line
  items: Question[];
  randomizeItems?: boolean; // whether item presentation order is shuffled per session
}

// Session record as returned by the API to the client.
export interface SessionState {
  id: string;
  condition: ConditionCode;
  personalization: Personalization;
  explanation: Explanation;
  block_order: number; // 1..4
  item_orders: Record<string, string[]>; // construct key -> ordered item codes
  wtp_b_order: string[]; // e.g. ["WTP_B3","WTP_B1",...]
  status: string;
  screen_out_reason: string | null;
  exposure_start: string | null;
  next_enabled_at: string | null;
  next_clicked_at: string | null;
}

// A rendered page in the survey flow.
export type PageKind =
  | "consent"
  | "eligibility"
  | "scenario"
  | "stimulus"
  | "questions"
  | "wtp_oe"
  | "wtp_ladder"
  | "wtp_binary"
  | "debrief";

export interface SurveyPage {
  key: string; // stable page identifier (page_key)
  kind: PageKind;
  title?: string;
  instruction?: string;
  anchors?: [string, string];
  questions: Question[];
  countsToProgress: boolean; // included in the progress bar denominator
}
