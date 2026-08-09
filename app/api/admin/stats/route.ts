import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import { ALL_CONDITIONS } from "@/lib/survey-config";

export const dynamic = "force-dynamic";

const TARGET_PER_CELL = 142; // spec §10

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const supabase = getSupabaseAdmin();

  const { data: sessions, error } = await supabase
    .from("sessions")
    .select(
      "id, condition, status, screen_out_reason, created_at, completed_at, exposure_start, next_clicked_at",
    );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: ircRows } = await supabase
    .from("responses")
    .select("session_id, question_code, value")
    .in("question_code", ["IRC1", "IRC2"]);

  const rows = sessions ?? [];

  // Per-condition recruited / completed
  const perCondition = ALL_CONDITIONS.map((c) => {
    const cell = rows.filter((r) => r.condition === c);
    return {
      condition: c,
      recruited: cell.length,
      completed: cell.filter((r) => r.status === "completed").length,
      target: TARGET_PER_CELL,
    };
  });

  // Status breakdown
  const started = rows.length;
  const completed = rows.filter((r) => r.status === "completed").length;
  const screened = rows.filter((r) => r.status === "screened_out");
  const screenReasons: Record<string, number> = {};
  for (const s of screened) {
    const k = s.screen_out_reason ?? "unknown";
    screenReasons[k] = (screenReasons[k] ?? 0) + 1;
  }

  // Avg duration (completed only)
  const durations = rows
    .filter((r) => r.status === "completed" && r.created_at && r.completed_at)
    .map(
      (r) =>
        (new Date(r.completed_at!).getTime() -
          new Date(r.created_at!).getTime()) /
        1000,
    );
  const avgDuration =
    durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : null;

  // Avg stimulus exposure (next_clicked - exposure_start)
  const exposures = rows
    .filter((r) => r.exposure_start && r.next_clicked_at)
    .map(
      (r) =>
        (new Date(r.next_clicked_at!).getTime() -
          new Date(r.exposure_start!).getTime()) /
        1000,
    );
  const avgExposure =
    exposures.length > 0
      ? Math.round(
          (exposures.reduce((a, b) => a + b, 0) / exposures.length) * 10,
        ) / 10
      : null;

  // Attention-check pass rates
  const irc = { IRC1: { total: 0, pass: 0 }, IRC2: { total: 0, pass: 0 } };
  for (const r of ircRows ?? []) {
    const key = r.question_code as "IRC1" | "IRC2";
    if (!irc[key]) continue;
    irc[key].total += 1;
    const target = key === "IRC1" ? "3" : "6";
    if (r.value === target) irc[key].pass += 1;
  }

  return NextResponse.json({
    perCondition,
    started,
    completed,
    screenedOut: screened.length,
    screenReasons,
    avgDurationSec: avgDuration,
    avgExposureSec: avgExposure,
    attentionChecks: irc,
  });
}
