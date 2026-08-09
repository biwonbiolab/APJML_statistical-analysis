// Shared VARELON V1 product image — a neutral graphite-black over-ear
// headphone rendered as an inline SVG data URI. One single asset referenced
// identically by all six conditions (stimulus purity): no person, rating,
// review, discount, award, or origin cues.
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" role="img" aria-label="그래파이트 블랙 오버이어 헤드폰">
  <defs>
    <linearGradient id="cup" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3a3f45"/>
      <stop offset="1" stop-color="#17191c"/>
    </linearGradient>
    <linearGradient id="band" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2b2f34"/>
      <stop offset="1" stop-color="#111316"/>
    </linearGradient>
  </defs>
  <rect width="240" height="240" fill="#ffffff"/>
  <!-- headband -->
  <path d="M48 132 C48 58 192 58 192 132" fill="none" stroke="url(#band)" stroke-width="18" stroke-linecap="round"/>
  <path d="M48 132 C48 62 192 62 192 132" fill="none" stroke="#4a5057" stroke-width="4" stroke-linecap="round" opacity="0.5"/>
  <!-- left ear cup -->
  <g>
    <rect x="34" y="120" width="46" height="74" rx="20" fill="url(#cup)"/>
    <rect x="44" y="130" width="26" height="54" rx="13" fill="#0c0d0f"/>
    <rect x="40" y="112" width="10" height="20" rx="4" fill="#26292e"/>
  </g>
  <!-- right ear cup -->
  <g>
    <rect x="160" y="120" width="46" height="74" rx="20" fill="url(#cup)"/>
    <rect x="170" y="130" width="26" height="54" rx="13" fill="#0c0d0f"/>
    <rect x="190" y="112" width="10" height="20" rx="4" fill="#26292e"/>
  </g>
</svg>`;

export const PRODUCT_IMAGE_DATA_URI =
  "data:image/svg+xml;utf8," + encodeURIComponent(SVG);
