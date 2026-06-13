import "@testing-library/jest-dom/vitest"
import { createTranslator } from "next-intl"
import { vi } from "vitest"

import messages from "./messages/fr.json"

process.env.NEXT_PUBLIC_API_URL ??= "http://localhost:3000/api/v1"

vi.mock("next-intl/server", () => ({
  getTranslations: async (options?: string | { locale?: string; namespace?: string }) => {
    const namespace = typeof options === "string" ? options : options?.namespace
    return createTranslator({ locale: "fr", messages, namespace } as Parameters<
      typeof createTranslator
    >[0])
  },
  getLocale: async () => "fr",
  setRequestLocale: () => {},
}))

vi.mock("next/navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/navigation")>()
  return {
    ...actual,
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    }),
    usePathname: () => "/",
  }
})
