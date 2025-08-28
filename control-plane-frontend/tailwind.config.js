/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      SFProDisplay: ["SF Pro Display", "sans-serif"],
      Rubik: ["Rubik", "sans-serif"],
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#084E8F",
          800: "#205F9A",
          700: "#3971A5",
          600: "#5283B0",
          500: "#6A94BB",
          400: "#83A6C7",
          300: "#9CBBd2",
          200: "#B4C9DD",
          100: "#CDDDE8",
          50: "#E6EDF3",
        },
        secondary: {
          DEFAULT: "#E7F3FE",
          800: "#C3DCF8",
          700: "#A7CCF4",
          600: "#8BBBF0",
          500: "#6FAAEc",
          400: "#94C0F3",
          300: "#B8D5F7",
          200: "#DCEAFB",
          100: "#F1F8FE",
          50: "#F9FCFF",
        },
        black: {
          DEFAULT: "#24292e",
          800: "#363839",
          700: "#4C4E4F",
          600: "#626465",
          500: "#797A7B",
          400: "#8F9091",
          300: "#A5A6A7",
          200: "#BCBCBD",
          100: "#D2D2D3",
          50: "#E8E8E9",
        },
        green: {
          DEFAULT: "#1E7E25",
          800: "#348A3A",
          700: "#4B9750",
          600: "#61A466",
          500: "#78B17C",
          400: "#8EBE92",
          300: "#A5CBA7",
          200: "#BDD8BD",
          100: "#D2E5D3",
          50: "#E8F2E9",
        },
        red: {
          DEFAULT: "#FF3B30",
          800: "#FF4E44",
          700: "#FF6259",
          600: "#FF756E",
          500: "#FF8982",
          400: "#FF9D97",
          300: "#FFB0AC",
          200: "#FFC4C0",
          100: "#FFD7D5",
          50: "#FFEBEA",
        },
        orange: {
          DEFAULT: "#FF9500",
          800: "#FF9F19",
          700: "#FFAA33",
          600: "#FFB44C",
          500: "#FFBF66",
          400: "#FFCA7F",
          300: "#FFD499",
          200: "#FFDFB2",
          100: "#FFE9CC",
          50: "#FFF4E5",
        },
        yellow: {
          DEFAULT: "#FFCC00",
          800: "#FFD119",
          700: "#FFD633",
          600: "#FFDB4C",
          500: "#FFE066",
          400: "#FFE57F",
          300: "#FFEA99",
          200: "#FFEEB2",
          100: "#FFF4CC",
          50: "#FFF9E5",
        },
        surface: {
          DEFAULT: "#F6F6F6",
        },
      },
      fontSize: {
        "display-extra-large": [
          "54px",
          {
            lineHeight: "120%",
            letterSpacing: "0.08px",
          },
        ],
        "display-large": [
          "48px",
          {
            lineHeight: "120%",
            letterSpacing: "0.08px",
          },
        ],
        "heading-1": [
          "42px",
          {
            lineHeight: "160%",
            letterSpacing: "0.08px",
          },
        ],
        "heading-2": [
          "38px",
          {
            lineHeight: "160%",
            letterSpacing: "0.08px",
          },
        ],
        "heading-3": [
          "32px",
          {
            lineHeight: "160%",
            letterSpacing: "0.5px",
          },
        ],
        "heading-4": [
          "24px",
          {
            lineHeight: "160%",
            letterSpacing: "0.4px",
          },
        ],
        "heading-5": [
          "20px",
          {
            lineHeight: "160%",
            letterSpacing: "0.08px",
          },
        ],
        "heading-6": [
          "18px",
          {
            lineHeight: "160%",
            letterSpacing: "0.08px",
          },
        ],
        "body-large": [
          "16px",
          {
            lineHeight: "150%",
            letterSpacing: "0.05px",
          },
        ],
        "body-medium": [
          "14px",
          {
            lineHeight: "150%",
            letterSpacing: "0.05px",
          },
        ],
        "body-small": [
          "12px",
          {
            lineHeight: "150%",
            letterSpacing: "0.05px",
          },
        ],
        caption: [
          "11px",
          {
            lineHeight: "140%",
            letterSpacing: "0.05px",
          },
        ],
      },
    },
  },
  plugins: [],
}
