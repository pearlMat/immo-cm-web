import { describe, expect, it } from "vitest"

import { makeReasonSchema } from "./moderation.schema"

const t = (key: string) => key

describe("makeReasonSchema", () => {
  const schema = makeReasonSchema(t)

  it("accepts a reason with at least 10 characters", () => {
    const result = schema.safeParse({ reason: "Photos de mauvaise qualité" })

    expect(result.success).toBe(true)
  })

  it("rejects an empty reason", () => {
    const result = schema.safeParse({ reason: "" })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("reasonTooShort")
    }
  })

  it("rejects a reason shorter than 10 characters", () => {
    const result = schema.safeParse({ reason: "Court" })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("reasonTooShort")
    }
  })
})
