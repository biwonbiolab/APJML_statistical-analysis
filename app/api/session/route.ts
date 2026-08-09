import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { CONDITIONS, ALL_CONDITIONS } from "@/lib/survey-config";
import {
  buildItemOrders,
  pickBlockOrder,
  buildWtpBOrder,
} from "@/lib/randomize";
import type { ConditionCode, SessionState } from "@/lib/types";

export const dynamic = "force-dynamic";

function toState(row: any): SessionState {
  return {
    id: row.id,
    condition: row.condition,
    personalization: row.personalization,
    explanation: row.explanation,
    block_order: row.block_order,
    item_orders: row.item_orders,
    wtp_b_order: row.wtp_b_order,
    status: row.status,
    screen_out_reason: row.screen_out_reason ?? null,
    exposure_start: row.exposure_start,
    next_enabled_at: row.next_enabled_at,
    next_clicked_at: row.next_clicked_at,
  };
}

// POST /api/session  → create a new session with balanced assignment.
export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  const body = await req.json().catch(() => ({}));
  const userAgent = (body.userAgent ?? "").toString().slice(0, 500);

  // Admin QA force (?force=C1..C6 with correct admin key). Ignored otherwise.
  let condition: ConditionCode | null = null;
  let forced = false;
  const forceReq = (body.force ?? "").toString().toUpperCase();
  const adminKey = (body.adminKey ?? "").toString();
  if (
    ALL_CONDITIONS.includes(forceReq as ConditionCode) &&
    process.env.ADMIN_PASSWORD &&
    adminKey === process.env.ADMIN_PASSWORD
  ) {
    condition = forceReq as ConditionCode;
    forced = true;
  }

  // Balanced assignment via atomic RPC (least-filled cell, random tie-break).
  if (!condition) {
    const { data, error } = await supabase.rpc("assign_condition");
    if (error || !data) {
      return NextResponse.json(
        { error: "assignment_failed", detail: error?.message },
        { status: 500 },
      );
    }
    condition = (typeof data === "string" ? data : data?.condition) as ConditionCode;
  }

  const spec = CONDITIONS[condition];
  const block_order = pickBlockOrder();
  const item_orders = buildItemOrders();
  const wtp_b_order = buildWtpBOrder();

  const { data: inserted, error: insErr } = await supabase
    .from("sessions")
    .insert({
      condition,
      personalization: spec.personalization,
      explanation: spec.explanation,
      block_order,
      item_orders,
      wtp_b_order,
      user_agent: forced ? `[QA] ${userAgent}` : userAgent,
      status: "started",
    })
    .select()
    .single();

  if (insErr || !inserted) {
    return NextResponse.json(
      { error: "insert_failed", detail: insErr?.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ session: toState(inserted) });
}

// GET /api/session?sid=...  → restore an existing session + saved answers.
export async function GET(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  const sid = req.nextUrl.searchParams.get("sid");
  if (!sid) {
    return NextResponse.json({ error: "missing_sid" }, { status: 400 });
  }

  const { data: session, error } = await supabase
    .from("sessions")
    .select()
    .eq("id", sid)
    .single();

  if (error || !session) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { data: rows } = await supabase
    .from("responses")
    .select("question_code, value, page_key")
    .eq("session_id", sid);

  const answers: Record<string, string> = {};
  const savedPages: string[] = [];
  for (const r of rows ?? []) {
    answers[r.question_code] = r.value ?? "";
    if (r.page_key && !savedPages.includes(r.page_key)) savedPages.push(r.page_key);
  }

  return NextResponse.json({
    session: toState(session),
    answers,
    savedPages,
  });
}
