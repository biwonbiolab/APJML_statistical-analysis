import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// POST /api/response
// body: { sessionId, pageKey, answers: { CODE: value, ... } }
// Upserts one row per (session_id, question_code) so refresh/re-save updates.
export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  const body = await req.json().catch(() => ({}));
  const sessionId = body.sessionId as string | undefined;
  const pageKey = (body.pageKey ?? "").toString();
  const answers = (body.answers ?? {}) as Record<string, unknown>;

  if (!sessionId) {
    return NextResponse.json({ error: "missing_session" }, { status: 400 });
  }

  const rows = Object.entries(answers).map(([code, value]) => ({
    session_id: sessionId,
    question_code: code,
    value: value === null || value === undefined ? null : String(value),
    page_key: pageKey,
    answered_at: new Date().toISOString(),
  }));

  if (rows.length === 0) {
    return NextResponse.json({ ok: true, saved: 0 });
  }

  const { error } = await supabase
    .from("responses")
    .upsert(rows, { onConflict: "session_id,question_code" });

  if (error) {
    return NextResponse.json(
      { error: "save_failed", detail: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, saved: rows.length });
}
