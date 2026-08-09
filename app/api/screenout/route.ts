import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const VALID_REASONS = ["consent_no", "age", "residence", "online", "honest"];

// POST /api/screenout  body: { sessionId, reason }
// Records status without reverting the assignment counter (spec §4).
export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  const body = await req.json().catch(() => ({}));
  const sessionId = body.sessionId as string | undefined;
  const reason = (body.reason ?? "").toString();

  if (!sessionId || !VALID_REASONS.includes(reason)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const { error } = await supabase
    .from("sessions")
    .update({ status: "screened_out", screen_out_reason: reason })
    .eq("id", sessionId)
    .eq("status", "started"); // don't override a completed session

  if (error) {
    return NextResponse.json(
      { error: "screenout_failed", detail: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
