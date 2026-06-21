/** Typed wrappers around the authentication endpoints (docs/API.md). */
import { api } from "./api-client";
import type { AuthTokens, User } from "./types";

export interface SendOtpResponse {
  detail: string;
  expires_in: number;
  /** Present only in development (OTP_DEBUG_RETURN) so the flow is testable. */
  debug_otp?: string;
}

export interface AuthResult extends AuthTokens {
  user: User;
}

/** Request an OTP for a phone number. Creates a pending account if needed. */
export function sendOtp(phoneNumber: string) {
  return api.post<SendOtpResponse>("/auth/send-otp/", {
    json: { phone_number: phoneNumber },
    auth: false,
  });
}

/** Verify an OTP for a brand-new account and receive JWT tokens. */
export function register(phoneNumber: string, otpCode: string) {
  return api.post<AuthResult>("/auth/register/", {
    json: { phone_number: phoneNumber, otp_code: otpCode },
    auth: false,
  });
}

/** Verify an OTP for an existing account and receive JWT tokens. */
export function login(phoneNumber: string, otpCode: string) {
  return api.post<AuthResult>("/auth/login/", {
    json: { phone_number: phoneNumber, otp_code: otpCode },
    auth: false,
  });
}

/** Fetch the currently authenticated user. */
export function getMe() {
  return api.get<User>("/auth/me/");
}

/** Light client-side check for an Iranian mobile number (backend is authoritative). */
export function isValidIranianMobile(raw: string): boolean {
  const digits = raw.replace(/\D/g, "");
  return /^(0098|98|0)?9\d{9}$/.test(digits);
}
