// Konfigurasi Tailwind CDN (harus dimuat SETELAH script cdn.tailwindcss.com)
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#dc2626",
          redDark: "#b91c1c",
          redLight: "#ef4444"
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      }
    }
  }
};
