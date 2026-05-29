import { redirect } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ url }) => {
  const params = new URLSearchParams();
  params.set("panel", "account");
  if (url.searchParams.get("edit") === "1") {
    params.set("edit", "1");
  }
  throw redirect(307, `/i/dashboard?${params.toString()}`);
};
