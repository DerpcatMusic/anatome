import { Email } from "@convex-dev/auth/providers/Email";
import { convexAuth } from "@convex-dev/auth/server";

declare const process: {
  env: {
    CONVEX_SITE_URL?: string;
    FRONTEND_URL?: string;
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
      async sendVerificationRequest({ identifier, token }) {
        const siteUrl = getFrontendUrl();
        const magicLink = `${siteUrl}/callback?code=${encodeURIComponent(token)}&email=${encodeURIComponent(identifier)}`;
        if (/localhost|127\.0\.0\.1/.test(siteUrl)) {
          console.log(`HomeBody login OTP sent for ${identifier}`);
          console.log(`HomeBody magic link for ${identifier}: ${magicLink}`);
        }
      },
    }),
  ],
});
