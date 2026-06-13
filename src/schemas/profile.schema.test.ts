import { describe, expect, it } from "vitest"

import { makeChangePasswordSchema, makePersonalInfoSchema } from "./profile.schema"

const t = (key: string) => key

const validPersonalInfo = {
  fullName: "Jean Dupont",
  phone: "+237 690 123 456",
  whatsapp: "",
}

const validChangePassword = {
  currentPassword: "oldpassword1",
  newPassword: "newpassword1",
  confirmPassword: "newpassword1",
}

describe("makePersonalInfoSchema", () => {
  const schema = makePersonalInfoSchema(t)

  it("accepts a valid payload and normalizes the phone number", () => {
    const result = schema.safeParse(validPersonalInfo)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.phone).toBe("+237690123456")
      expect(result.data.whatsapp).toBeUndefined()
    }
  })

  it("normalizes an optional whatsapp number when provided", () => {
    const result = schema.safeParse({ ...validPersonalInfo, whatsapp: "+237 690 111 222" })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.whatsapp).toBe("+237690111222")
    }
  })

  it("rejects an empty full name", () => {
    const result = schema.safeParse({ ...validPersonalInfo, fullName: "" })

    expect(result.success).toBe(false)
  })

  it("rejects an invalid phone number", () => {
    const result = schema.safeParse({ ...validPersonalInfo, phone: "12345" })

    expect(result.success).toBe(false)
  })
})

describe("makeChangePasswordSchema", () => {
  const schema = makeChangePasswordSchema(t)

  it("accepts a valid payload", () => {
    const result = schema.safeParse(validChangePassword)

    expect(result.success).toBe(true)
  })

  it("rejects a mismatched confirmation password", () => {
    const result = schema.safeParse({ ...validChangePassword, confirmPassword: "different1" })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["confirmPassword"])
    }
  })

  it("rejects a new password that fails complexity rules", () => {
    const result = schema.safeParse({ ...validChangePassword, newPassword: "alllettersnoNum", confirmPassword: "alllettersnoNum" })

    expect(result.success).toBe(false)
  })

  it("rejects an empty current password", () => {
    const result = schema.safeParse({ ...validChangePassword, currentPassword: "" })

    expect(result.success).toBe(false)
  })
})
