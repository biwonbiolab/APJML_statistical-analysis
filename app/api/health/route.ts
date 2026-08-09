import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.SUPABASE_URL ?? "";
  const env = {
    SUPABASE_URL_present: !!process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY_present: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_ANON_KEY_present: !!process.env.SUPABASE_ANON_KEY,
    ADMIN_PASSWORD_present: !!process.env.ADMIN_PASSWORD,
    SUPABASE_URL_host: url ? url.replace(/^https?:\/\//, "").split("/")[0] : null,
    SUPABASE_URL_has_trailing_slash: /\/$/.test(url),
  };

  let db: Record<string, unknown> = { attempted: false };
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase");
    const supabase = getSupabaseAdmin();

    const counter = await supabase
      .from("assignment_counter")
      .select("condition,n");

    const rpc = await supabase.rpc("assign_condition");
    let rolledBack = false;
    if (!rpc.error && rpc.data) {
      const cond = String(rpc.data);
      const cur = await supabase
        .from("assignment_counter")
        .select("n")
        .eq("condition", cond)
        .single();
      if (!cur.error && cur.data) {
        await supabase
          .from("assignment_counter")
          .update({ n: Math.max(0, (cur.data.n as number) - 1) })
          .eq("condition", cond);
        rolledBack = true;
      }
    }

    db = {
      attempted: true,
      tables_ok: !counter.error,
      counter_error: counter.error?.message ?? null,
      counter_rows: counter.data?.length ?? 0,
      rpc_ok: !rpc.error,
      rpc_error: rpc.error?.message ?? null,
      rpc_result: rpc.error ? null : rpc.data,
      rpc_rolled_back: rolledBack,
    };
  } catch (e: any) {
    db = { attempted: true, fatal: e?.message ?? String(e) };
  }

  const verdict =
    !env.SUPABASE_URL_present || !env.SUPABASE_SERVICE_ROLE_KEY_present
      ? "ENV_MISSING: Vercel 환경변수(SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)가 없습니다. 등록 후 Redeploy 하세요."
      : (db as any).fatal || (db as any).counter_error
        ? "DB_CONNECT_FAIL: URL/키가 틀렸거나 스키마 미실행. 아래 오류 메시지를 확인하세요."
        : (db as any).rpc_error
          ? "RPC_MISSING: assign_condition() 함수가 없습니다. schema.sql 전체를 이 프로젝트에 다시 실행하세요."
          : "OK: 환경변수·테이블·함수 정상. 설문이 작동해야 합니다.";

  return NextResponse.json({ verdict, env, db }, { status: 200 });
}
