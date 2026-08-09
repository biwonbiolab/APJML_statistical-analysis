import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { STIMULUS_HOLD_SECONDS } from "@/lib/survey-config";

export const dynamic = "force-dynamic";

// POST /api/stimulus
// body: { sessionId, action: 'start' | 'click' }
// Server-authoritative timestamps for exposure integrity (spec §3, §5-P3).
export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  const body = await req.json().catch(() => ({}));
  const sessionId = body.sessionId as string | undefined;
  const action = (body.action ?? "").toString();
  if (!sessionId) {
    return NextResponse.json({ error: "missing_session" }, { status: 400 });
  }

  if (action === "start") {
    const { data, error } = await supabase.rpc("stimulus_start", {
      p_sid: sessionId,
      p_hold: STIMULUS_HOLD_SECONDS,
    });
    if (error) {
      return NextResponse.json(
        { error: "start_failed", detail: error.message },
        { status: 500 },
      );
    }
    const row = Array.isArray(data) ? data[0] : data;
    return NextResponse.json({
      exposure_start: row?.exposure_start ?? null,
      next_enabled_at: row?.next_enabled_at ?? null,
      hold_seconds: STIMULUS_HOLD_SECONDS,
    });
  }

  if (action === "click") {
    const { data, error } = await supabase.rpc("stimulus_click", {
      p_sid: sessionId,
    });
    if (error) {
      return NextResponse.json(
        { error: "click_failed", detail: error.message },
        { status: 500 },
      );
    }
    // data = true when the 25s hold had elapsed and click was recorded.
    return NextResponse.json({ ok: data === true });
  }

  return NextResponse.json({ error: "bad_action" }, { status: 400 });
}
