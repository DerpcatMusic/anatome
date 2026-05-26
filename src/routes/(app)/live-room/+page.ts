import { redirect } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

/** Legacy path → Hebrew live room (breakout layout). */
export const load: PageLoad = ({ url }) => {
  const target = `/חדר-לייב${url.search}`;
  redirect(307, target);
};
