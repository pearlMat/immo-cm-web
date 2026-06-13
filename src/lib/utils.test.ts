import { describe, expect, it } from "vitest"

import { cn, formatDate, formatFCFA, formatPhone } from "./utils"

describe("cn", () => {
  it("merges class names and resolves tailwind conflicts", () => {
    expect(cn("px-2", "px-4")).toBe("px-4")
    expect(cn("text-sm", undefined, "font-bold")).toBe("text-sm font-bold")
  })
})

describe("formatFCFA", () => {
  it("formats an integer with French thousands separators and FCFA suffix", () => {
    expect(formatFCFA(150000)).toBe("150 000 FCFA")
  })

  it("formats small amounts without separators", () => {
    expect(formatFCFA(500)).toBe("500 FCFA")
  })

  it("formats zero", () => {
    expect(formatFCFA(0)).toBe("0 FCFA")
  })
})

describe("formatPhone", () => {
  it("formats a +237-prefixed number into grouped blocks", () => {
    expect(formatPhone("+237698765432")).toBe("+237 698 765 432")
  })

  it("formats a local 9-digit number", () => {
    expect(formatPhone("698765432")).toBe("+237 698 765 432")
  })

  it("returns the input unchanged when it doesn't match the expected length", () => {
    expect(formatPhone("12345")).toBe("12345")
  })
})

describe("formatDate", () => {
  it("formats an ISO date string in French", () => {
    expect(formatDate("2025-06-03")).toBe("03 juin 2025")
  })
})
