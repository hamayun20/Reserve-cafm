import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#001b3d",
        lagoon: "#00a884",
        sun: "#f7b955",
        coral: "#ef476f",
        leaf: "#12a66a",
      },
      boxShadow: {
        lift: "0 10px 26px rgba(15, 23, 42, 0.07)",
      },
    },
  },
  plugins: [],
};

export default config;
