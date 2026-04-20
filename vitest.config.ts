import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: [
      "src/**/*.{test,spec}.{ts,tsx}",
      "supabase/functions/_shared/__tests__/**/*.{test,spec}.{ts,tsx}",
    ],
  },
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      { find: "./cors.ts", replacement: path.resolve(__dirname, "./supabase/functions/_shared/cors.ts") },
      { find: "https://esm.sh/@supabase/supabase-js@2", replacement: path.resolve(__dirname, "./supabase/functions/_shared/__mocks__/supabase-client.ts") },
    ],
  },
});
