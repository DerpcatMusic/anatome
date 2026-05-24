import { redirect } from "@sveltejs/kit";

/** Legacy path → Hebrew live room (breakout layout). */
export function load({ url }) {
  const target = `/חדר-לייב${url.search}`;
  redirect(307, target);
}
