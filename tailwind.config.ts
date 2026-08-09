import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#22497a",
          dark: "#1b3a63",
          light: "#eef2f8",
        },
      },
      maxWidth: {
        survey: "640px",
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "'Noto Sans KR'",
          "'Apple SD Gothic Neo'",
          "'Malgun Gothic'",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
