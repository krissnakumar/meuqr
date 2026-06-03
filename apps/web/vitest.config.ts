import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["**/__tests__/**/*.test.ts"],
    env: {
      NEXT_PUBLIC_SUPABASE_URL: "https://mock-supabase-url.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "mock-service-role-key-very-long-and-secure-for-test",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@meuqr/shared": path.resolve(__dirname, "../../packages/shared/src"),
    },
  },
});
