import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.reservecafm.app",
  appName: "CAFM PRO",
  webDir: "mobile-shell",
  server: {
    cleartext: true,
    allowNavigation: ["*"],
  },
};

export default config;
