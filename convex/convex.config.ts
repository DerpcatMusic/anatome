import { defineApp } from "convex/server";
import mux from "@mux/convex/convex.config.js";
import resend from "@convex-dev/resend/convex.config.js";

const app = defineApp();
app.use(mux, { name: "mux" });
app.use(resend);

export default app;
