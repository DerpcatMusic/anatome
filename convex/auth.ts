import { Email } from "@convex-dev/auth/providers/Email";
import { convexAuth } from "@convex-dev/auth/server";

declare const process: {
  env: {
    CONVEX_SITE_URL?: string;
    FRONTEND_URL?: string;
  };
};

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
      async sendVerificationRequest({ identifier, token }) {
        const siteUrl = getFrontendUrl();
        const magicLink = `${siteUrl}/callback?code=${encodeURIComponent(token)}&email=${encodeURIComponent(identifier)}`;
        console.log(`HomeBody login code for ${identifier}: ${token}`);
        console.log(`HomeBody magic link for ${identifier}: ${magicLink}`);
      },
    }),
  ],
});
