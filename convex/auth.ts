import { Email } from "@convex-dev/auth/providers/Email";
import { convexAuth } from "@convex-dev/auth/server";
import { sendAuthVerificationEmail } from "./email/authVerification";

declare const process: {
  env: {
    CONVEX_SITE_URL?: string;
    FRONTEND_URL?: string;
    RESEND_API_KEY?: string;
  };
};

function generateOtp() {
  const digits = globalThis.crypto.getRandomValues(new Uint32Array(1))[0] % 1000000;
  return digits.toString().padStart(6, "0");
}

function getFrontendUrl(): string {
  const frontendUrl = process.env.FRONTEND_URL;
  if (frontendUrl) return frontendUrl.replace(/\/$/, "");
  return "http://localhost:4321";
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Email({
      maxAge: 10 * 60,
      authorize: undefined,
      generateVerificationToken: async () => generateOtp(),
      // Convex Auth passes the action ctx as a second argument at runtime.
      // @ts-expect-error Auth.js types only declare the params object.
      async sendVerificationRequest({ identifier, token, expires }, ctx) {
        const siteUrl = getFrontendUrl();
        const magicLink = `${siteUrl}/callback?code=${encodeURIComponent(token)}&email=${encodeURIComponent(identifier)}`;
        const isLocal = /localhost|127\.0\.0\.1/.test(siteUrl);

        if (isLocal) {
          console.log(`AnatoMe login OTP for ${identifier}: ${token}`);
          console.log(`AnatoMe magic link for ${identifier}: ${magicLink}`);
        }

        if (!process.env.RESEND_API_KEY) {
          if (!isLocal) {
            throw new Error("RESEND_API_KEY is not configured for this deployment");
          }
          return;
        }

        await sendAuthVerificationEmail(ctx, {
          to: identifier,
          code: token,
          magicLink,
          expiresAt: expires,
        });
      },
    }),
  ],
});
