# APJML Main Survey v8 — 온라인 실험 플랫폼

SSCI 투고용 집단간 실험(2×3, 6조건)을 위한 배포형 한국어 설문 웹앱입니다.
**Next.js 14 (App Router) + Supabase (Postgres) + Vercel** 스택으로 구축되어 있으며,
무작위 배정의 균형·노출시간 통제·타임스탬프 무결성·부분저장·CSV 내보내기를 지원합니다.

---

## 1. 무엇이 들어 있나

| 경로 | 설명 |
|---|---|
| `app/page.tsx` | 랜딩 → 세션 생성 후 `/survey/[sid]`로 이동 |
| `app/survey/[sid]/page.tsx` | 단계별 설문 진행(클라이언트 상태머신, 부분저장·복원·뒤로가기 차단) |
| `app/admin/page.tsx` | 비밀번호 보호 관리자(집계·CSV 내보내기) |
| `app/api/session/route.ts` | `POST` 세션 생성 + 6셀 균형 배정 / `GET` 세션 복원 |
| `app/api/response/route.ts` | `POST` 페이지별 응답 저장(upsert 부분저장) |
| `app/api/complete/route.ts` | `POST` 완료 처리 |
| `app/api/screenout/route.ts` | `POST` 스크린아웃 처리 |
| `app/api/stimulus/route.ts` | `POST` 자극물 노출시간(서버 시각) 기록 |
| `app/api/export/route.ts` | `GET` CSV 내보내기(와이드/롱, 관리자 인증) |
| `app/api/admin/stats/route.ts` | `GET` 관리자 집계(관리자 인증) |
| `lib/survey-config.ts` | 전체 문항·자극물·안내문 (§5–§9 단일 소스) |
| `lib/randomize.ts` | 블록순서·문항순서·WTP_B 순서 무작위화 |
| `lib/pages.ts` | 세션별 설문 페이지 조립 + 진행률 |
| `lib/codebook.ts` | 와이드 CSV 열 순서·다중선택 더미 |
| `lib/product-image.ts` | 6조건 공통 제품 이미지(그래파이트 블랙 헤드폰) — data URI 1개 공유 |
| `supabase/schema.sql` | 테이블 + 균형배정/노출타이밍 RPC |

---

## 2. 사전 준비물

1. 무료 **Supabase** 계정 — <https://supabase.com>
2. 무료 **Vercel** 계정 — <https://vercel.com>
3. Node.js 18.18+ (로컬 확인용)

---

## 3. Supabase 설정

1. Supabase에서 **New project** 생성 (리전은 `Northeast Asia (Seoul)` 권장).
2. 좌측 **SQL Editor → New query**에 `supabase/schema.sql` 전체를 붙여넣고 **Run**.
   - `sessions`, `responses`, `assignment_counter` 3개 테이블과
     `assign_condition()`, `stimulus_start()`, `stimulus_click()` 함수가 생성됩니다.
3. **Project Settings → API**에서 다음 값을 복사합니다.
   - `Project URL` → `SUPABASE_URL`
   - `service_role` **secret** key → `SUPABASE_SERVICE_ROLE_KEY` *(서버 전용, 절대 노출 금지)*
   - `anon` public key → `SUPABASE_ANON_KEY` *(선택 · 본 앱은 서버에서만 DB 접근)*

> **보안 메모**: 앱은 서버 API 라우트에서 `service_role` 키로만 DB에 접근합니다.
> 스키마는 RLS를 켠 뒤 공개 정책을 두지 않으므로 anon/public 접근은 차단되고
> 서버(서비스 롤)만 읽고 씁니다.

---

## 4. 로컬 실행

```bash
cp .env.local.example .env.local
# .env.local 을 열어 4개 값을 채웁니다:
#   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY(선택), ADMIN_PASSWORD

npm install
npm run dev
# http://localhost:3000  (설문)
# http://localhost:3000/admin  (관리자)
```

전체 플로우(동의 → 선별 → 자극물 25초 → 측정 → WTP → 사후 → 완료)를 한 번 돌려보고,
`/admin`에서 응답이 집계되는지, 와이드/롱 CSV가 내려받아지는지 확인하세요.

---

## 5. Vercel 배포

### 방법 A — GitHub 연동 (권장)
1. 이 저장소를 GitHub에 푸시합니다.
2. Vercel → **Add New… → Project** → 저장소 선택 → **Import**.
3. **Environment Variables**에 `.env.local`의 4개 값을 동일하게 등록:
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `ADMIN_PASSWORD`.
4. **Deploy** → 배포 완료 후 발급되는 **공개 URL**이 참가자 배포 링크입니다.

### 방법 B — Vercel CLI
```bash
npm i -g vercel
vercel            # 최초 배포(프로젝트 연결)
# 대시보드에서 위 4개 환경변수 등록 후
vercel --prod     # 프로덕션 배포 → 공개 URL 출력
```

---

## 6. 운영 · QA

- **참가자 링크**: 배포된 루트 URL 하나만 공유하면 됩니다. (예: `https://<프로젝트>.vercel.app`)
- **관리자**: `/admin` 접속 후 `ADMIN_PASSWORD` 입력 → 조건별 진척·품질지표·CSV.
- **조건 강제(QA 전용)**: `?force=C1&key=<ADMIN_PASSWORD>` … `C6`.
  올바른 `key`가 없으면 `force`는 **무시**되고 일반 균형배정이 적용됩니다.
  (QA 세션은 배정 카운터를 소모하지 않으며 `user_agent`에 `[QA]`로 표시됩니다.)

---

## 7. 무작위화 · 통제 요약 (사양 대조)

- **6셀 균형 배정**: `assign_condition()` 이 트랜잭션 advisory lock으로 최소 셀을 선택(+1).
  새로고침·재접속 시 동일 세션 복원, 재배정 없음.
- **블록 순서**: 핵심 6블록(TRN·CTL·TRU·SUR·PR·AUT)을 4개 균형 세트 중 하나로.
  IRC1·PI·WTP·이후 블록 고정.
- **문항 순서**: 각 반영형 구성개념 내부 순서를 세션별 무작위화(`item_orders`).
  단 MC·PI는 제시순서 고정(사양 §8.3, §11).
- **WTP**: 순서 고정 OE→LADDER→BINARY. WTP_B는 **화면순서만** 무작위, 가격은 고정
  (B1=760,000 / B2=890,000 / B3=980,000 / B4=1,110,000).
- **자극물**: "다음" 25초 강제 비활성(카운트다운). 노출시작/활성화/클릭 시각을
  서버 시각으로 저장. 이후 브라우저 back 무력화.
- **설명 없음 조건(C1/C4)**: 설명 상자 미표시 + EQ(MC6–8) 블록 건너뜀.
- **주의점검(IRC1=3, IRC2=6)·RECALL**: 통과여부만 저장, 자동 탈락 없음.

---

## 8. 데이터 내보내기

- **와이드 CSV**(분석용): 1행 = 1참가자. 열 = 메타(condition/personalization/explanation/
  block_order/타임스탬프/소요시간/노출시간) + 모든 문항코드(정규 순서) +
  다중선택 더미(`RECALL_CRITERIA__출퇴근이동` = 0/1).
- **롱 CSV**(감사용): `responses` 원자료 그대로.
- 두 파일 모두 **UTF-8 BOM**(엑셀 한글 안전), 파일명에 내보낸 시각 포함.

---

## 9. IRB / 안내문

- 동의문(P0)의 IRB 항목은 **placeholder**입니다. 승인 후 `lib/survey-config.ts`의
  `CONSENT.rows` 내 "연구윤리 심의" 항목을 승인번호로 교체하세요.
- 자극물 브랜드(VARELON)·이용정보·구매이력은 모두 가상이며, 디브리핑(P-END)에서 고지합니다.
