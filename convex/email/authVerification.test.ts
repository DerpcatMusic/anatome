import { describe, expect, test } from "vitest";
import { buildAuthVerificationSubject, normalizeOtpCode } from "./authVerification";

describe("normalizeOtpCode", () => {
  test("pads short codes", () => {
    expect(normalizeOtpCode("42")).toBe("000042");
  });

  test("strips non-digits", () => {
    expect(normalizeOtpCode("123-456")).toBe("123456");
  });
});

describe("buildAuthVerificationSubject", () => {
  test("formats notification-friendly subject", () => {
    expect(buildAuthVerificationSubject("123456")).toBe("AnatoMe OTP - 123456");
  });
});
