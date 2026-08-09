import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import { toCsv, timestampSlug } from "@/lib/csv";
import { CANONICAL_CODES, MULTI_DUMMY, dummySuffix } from "@/lib/codebook";

export const dynamic = "force-dynamic";

function durationSec(created?: string | null, completed?: string | null): string {
  if (!created || !completed) return "";
  const d = (new Date(completed).getTime() - new Date(created).getTime()) / 1000;
  return d >= 0 ? String(Math.round(d)) : "";
}

function exposureMs(start?: string | null, click?: string | null): string {
  if (!start || !click) return "";
  const d = new Date(click).getTime() - new Date(start).getTime();
  return d >= 0 ? String(d) : "";
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const type = req.nextUrl.searchParams.get("type") ?? "wide";
  const supabase = getSupabaseAdmin();

  if (type === "long") {
    const { data: rows, error } = await supabase
      .from("responses")
      .select("id, session_id, question_code, value, page_key, answered_at")
      .order("id", { ascending: true });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const headers = [
      "id",
      "session_id",
      "question_code",
      "value",
      "page_key",
      "answered_at",
    ];
    const body = (rows ?? []).map((r) => [
      r.id,
      r.session_id,
      r.question_code,
      r.value,
      r.page_key,
      r.answered_at,
    ]);
    const csv = toCsv(headers, body);
    return csvResponse(csv, `apjml_long_${timestampSlug()}.csv`);
  }

  // ── WIDE ────────────────────────────────────────────────────────────────
  const { data: sessions, error: sErr } = await supabase
    .from("sessions")
    .select("*")
    .order("created_at", { ascending: true });
  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });

  const { data: responses, error: rErr } = await supabase
    .from("responses")
    .select("session_id, question_code, value");
  if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 });

  // session_id -> { code -> value }
  const bySession: Record<string, Record<string, string>> = {};
  for (const r of responses ?? []) {
    (bySession[r.session_id] ??= {})[r.question_code] = r.value ?? "";
  }

  const metaCols = [
    "session_id",
    "condition",
    "personalization",
    "explanation",
    "block_order",
    "status",
    "screen_out_reason",
    "created_at",
    "completed_at",
    "duration_sec",
    "exposure_start",
    "next_enabled_at",
    "next_clicked_at",
    "exposure_ms",
    "user_agent",
  ];

  // Build headers: meta + canonical codes, expanding multi-select to dummies.
  const dataCols: string[] = [];
  for (const code of CANONICAL_CODES) {
    dataCols.push(code);
    if (MULTI_DUMMY[code]) {
      for (const opt of MULTI_DUMMY[code]) {
        dataCols.push(`${code}__${dummySuffix(opt)}`);
      }
    }
  }
  const headers = [...metaCols, ...dataCols];

  const rows = (sessions ?? []).map((s) => {
    const ans = bySession[s.id] ?? {};
    const meta = [
      s.id,
      s.condition,
      s.personalization,
      s.explanation,
      s.block_order,
      s.status,
      s.screen_out_reason,
      s.created_at,
      s.completed_at,
      durationSec(s.created_at, s.completed_at),
      s.exposure_start,
      s.next_enabled_at,
      s.next_clicked_at,
      exposureMs(s.exposure_start, s.next_clicked_at),
      s.user_agent,
    ];
    const data: unknown[] = [];
    for (const code of CANONICAL_CODES) {
      const raw = ans[code] ?? "";
      data.push(raw);
      if (MULTI_DUMMY[code]) {
        const selected = raw ? raw.split(",").map((x) => x.trim()) : [];
        for (const opt of MULTI_DUMMY[code]) {
          data.push(selected.includes(opt) ? 1 : 0);
        }
      }
    }
    return [...meta, ...data];
  });

  const csv = toCsv(headers, rows);
  return csvResponse(csv, `apjml_wide_${timestampSlug()}.csv`);
}

function csvResponse(csv: string, filename: string) {
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
