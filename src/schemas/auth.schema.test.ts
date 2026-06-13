import { describe, expect, it } from "vitest"

import { UserAccountType } from "@/types/enums"

import {
  makeForgotPasswordSchema,
  makeLoginSchema,
  makeRegisterSchema,
  makeResetPasswordSchema,
  normalizePhone,
} from "./auth.schema"

const t = (key: string) => key

const validRegisterPayload = {
  fullName: "Jean Dupont",
  email: "jean@example.com",
  phone: "+237 690 123 456",
  whatsapp: "",
  accountType: UserAccountType.AGENT,
  password: "password1",
  confirmPassword: "password1",
}

describe("normalizePhone", () => {
  it("normalizes a phone number with spaces and country code to +2376XXXXXXXX", () => {
    expect(normalizePhone("+237 690 123 456")).toBe("+237690123456")
  })

  it("normalizes a local number without country code", () => {
    expect(normalizePhone("690123456")).toBe("+237690123456")
  })
})

describe("makeRegisterSchema", () => {
  const schema = makeRegisterSchema(t)

  it("accepts a valid payload and normalizes the phone number", () => {
    const result = schema.safeParse(validRegisterPayload)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.phone).toBe("+237690123456")
      expect(result.data.whatsapp).toBeUndefined()
    }
  })

  it("normalizes an optional whatsapp number when provided", () => {
    const result = schema.safeParse({ ...validRegisterPayload, whatsapp: "+237 690 111 222" })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.whatsapp).toBe("+237690111222")
    }
  })

  it("rejects an empty full name", () => {
    const result = schema.safeParse({ ...validRegisterPayload, fullName: "" })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("required")
    }
  })

  it("rejects an invalid email", () => {
    const result = schema.safeParse({ ...validRegisterPayload, email: "not-an-email" })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("invalidEmail")
    }
  })

  it("rejects an invalid phone number", () => {
    const result = schema.safeParse({ ...validRegisterPayload, phone: "123" })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("invalidPhone")
    }
  })

  it("rejects a password shorter than 8 characters", () => {
    const result = schema.safeParse({
      ...validRegisterPayload,
      password: "pass1",
      confirmPassword: "pass1",
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("passwordMin")
    }
  })

  it("rejects a password without a digit", () => {
    const result = schema.safeParse({
      ...validRegisterPayload,
      password: "passwordonly",
      confirmPassword: "passwordonly",
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("passwordComplexity")
    }
  })

  it("rejects mismatched passwords", () => {
    const result = schema.safeParse({
      ...validRegisterPayload,
      password: "password1",
      confirmPassword: "password2",
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("passwordMismatch")
      expect(result.error.issues[0].path).toEqual(["confirmPassword"])
    }
  })
})

describe("makeLoginSchema", () => {
  const schema = makeLoginSchema(t)

  it("accepts a valid payload", () => {
    expect(schema.safeParse({ email: "jean@example.com", password: "secret" }).success).toBe(
      true
    )
  })

  it("rejects an empty password", () => {
    const result = schema.safeParse({ email: "jean@example.com", password: "" })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("required")
    }
  })
})

describe("makeForgotPasswordSchema", () => {
  const schema = makeForgotPasswordSchema(t)

  it("accepts a valid email", () => {
    expect(schema.safeParse({ email: "jean@example.com" }).success).toBe(true)
  })

  it("rejects an invalid email", () => {
    const result = schema.safeParse({ email: "not-an-email" })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("invalidEmail")
    }
  })
})

describe("makeResetPasswordSchema", () => {
  const schema = makeResetPasswordSchema(t)

  it("accepts matching passwords", () => {
    expect(
      schema.safeParse({ password: "password1", confirmPassword: "password1" }).success
    ).toBe(true)
  })

  it("rejects mismatched passwords", () => {
    const result = schema.safeParse({ password: "password1", confirmPassword: "password2" })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("passwordMismatch")
      expect(result.error.issues[0].path).toEqual(["confirmPassword"])
    }
  })
})
