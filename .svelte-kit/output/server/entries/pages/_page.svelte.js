import { H as attr, U as escape_html, i as bind_props, s as head } from "../../chunks/dev.js";
import { r as initAuth } from "../../chunks/session.svelte.js";
import { t as Button } from "../../chunks/Button.js";
import { t as Notice } from "../../chunks/Notice.js";
//#region src/components/ui/Input.svelte
function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { label, name, type = "text", value = "", autocomplete, inputmode, required = false } = $$props;
		$$renderer.push(`<label class="field svelte-n2qwlb"><span>${escape_html(label)}</span> <input${attr("value", value)}${attr("name", name)}${attr("type", type)}${attr("autocomplete", autocomplete)}${attr("inputmode", inputmode)}${attr("required", required, true)} class="svelte-n2qwlb"/></label>`);
		bind_props($$props, { value });
	});
}
//#endregion
//#region src/components/auth/AuthPanel.svelte
function AuthPanel($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let step = "email";
		let email = "";
		let code = "";
		let pending = false;
		const auth = initAuth();
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			if (auth.isLoading) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="auth-state svelte-1pu47ub">`);
				Notice($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->בודקים חשבון...`);
					},
					$$slots: { default: true }
				});
				$$renderer.push(`<!----></div>`);
			} else if (auth.isAuthenticated) {
				$$renderer.push("<!--[1-->");
				$$renderer.push(`<div class="auth-state svelte-1pu47ub"><div class="auth-state__text svelte-1pu47ub"><p class="kicker svelte-1pu47ub">מחוברת ✦</p> <h2 class="svelte-1pu47ub">החשבון פתוח</h2> <p class="intro svelte-1pu47ub">אפשר להמשיך לאזור האישי או לצאת.</p></div> <a class="auth-btn auth-btn--primary svelte-1pu47ub" href="/dashboard">לאזור האישי</a> <button class="auth-btn svelte-1pu47ub" type="button">יציאה</button></div>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<form class="auth-form svelte-1pu47ub"><div class="auth-form__header svelte-1pu47ub"><p class="kicker svelte-1pu47ub">גישה לחברים</p> <h2 class="svelte-1pu47ub">${escape_html(step === "email" ? "כניסה או הרשמה" : "בדקי את האימייל")}</h2> <p class="intro svelte-1pu47ub">${escape_html(step === "email" ? "מכניסים כתובת אימייל ומקבלים קוד חד־פעמי. אין צורך בסיסמה." : `שלחנו קוד לכתובת ${email}`)}</p></div> `);
				if (step === "email") {
					$$renderer.push("<!--[0-->");
					Input($$renderer, {
						label: "אימייל",
						name: "email",
						type: "email",
						autocomplete: "email",
						required: true,
						get value() {
							return email;
						},
						set value($$value) {
							email = $$value;
							$$settled = false;
						}
					});
				} else {
					$$renderer.push("<!--[-1-->");
					Input($$renderer, {
						label: "קוד חד־פעמי",
						name: "code",
						inputmode: "numeric",
						autocomplete: "one-time-code",
						required: true,
						get value() {
							return code;
						},
						set value($$value) {
							code = $$value;
							$$settled = false;
						}
					});
					$$renderer.push(`<!----> <button class="link svelte-1pu47ub" type="button">להשתמש באימייל אחר</button>`);
				}
				$$renderer.push(`<!--]--> `);
				Button($$renderer, {
					type: "submit",
					tone: "ink",
					disabled: pending,
					children: ($$renderer) => {
						$$renderer.push(`<!---->${escape_html(step === "email" ? "שלחו לי קוד" : "להיכנס")}`);
					},
					$$slots: { default: true }
				});
				$$renderer.push(`<!----> `);
				if (auth.error) {
					$$renderer.push("<!--[0-->");
					Notice($$renderer, {
						tone: "danger",
						children: ($$renderer) => {
							$$renderer.push(`<!---->${escape_html(auth.error)}`);
						},
						$$slots: { default: true }
					});
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></form>`);
			}
			$$renderer.push(`<!--]-->`);
		}
		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer.subsume($$inner_renderer);
	});
}
//#endregion
//#region src/routes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		head("1uha8ag", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>HomeBody | פילאטיס שיקומי בבית</title>`);
			});
			$$renderer.push(`<meta name="description" content="פילאטיס אונליין בעברית — שיעורים חיים, מוקלטים ופרטיים. התמחות בפטולוגיות ופילאטיס שיקומי. למדתי אצל מרתה פילאטיס." class="svelte-1uha8ag"/> <meta property="og:title" content="HomeBody | פילאטיס שיקומי בבית" class="svelte-1uha8ag"/> <meta property="og:description" content="פילאטיס אונליין בעברית — שיעורים חיים, מוקלטים ופרטיים. התמחות בפטולוגיות ופילאטיס שיקומי." class="svelte-1uha8ag"/> <meta property="og:type" content="website" class="svelte-1uha8ag"/> <meta property="og:locale" content="he_IL" class="svelte-1uha8ag"/>`);
		});
		$$renderer.push(`<main class="landing svelte-1uha8ag"><section class="hero svelte-1uha8ag" aria-label="ראשי"><div class="hero__inner svelte-1uha8ag"><p class="eyebrow svelte-1uha8ag">HomeBody — פילאטיס שיקומי בבית</p> <h1 class="svelte-1uha8ag">גוף אמיתי.<br class="svelte-1uha8ag"/>תנועה אמיתית.</h1> <p class="lead svelte-1uha8ag">פילאטיס אונליין בעברית, לגוף עם כאבים, מגבלות ורצון לחזור לתנועה. שיעורים חיים, מוקלטים ופרטיים — עם התמחות בפטולוגיות.</p> <div class="actions svelte-1uha8ag"><button class="btn btn--ink svelte-1uha8ag">שיעור ראשון בחינם</button> <a class="btn btn--paper svelte-1uha8ag" href="#content">גלי איך זה עובד</a></div></div></section> <section id="content" class="content-section section--pain svelte-1uha8ag" aria-label="למה השאר לא עובדים"><div class="section-header svelte-1uha8ag"><span class="section-tag svelte-1uha8ag">THE PROBLEM</span> <h2 class="svelte-1uha8ag">למה שיעורים רגילים לא עובדים</h2></div> <div class="pain-grid svelte-1uha8ag"><div class="pain-item svelte-1uha8ag"><span class="pain-x svelte-1uha8ag">✕</span><span class="svelte-1uha8ag">נדרשת הרשמה מראש</span></div> <div class="pain-item svelte-1uha8ag"><span class="pain-x svelte-1uha8ag">✕</span><span class="svelte-1uha8ag">שיעורים של 60–75 דקות</span></div> <div class="pain-item svelte-1uha8ag"><span class="pain-x svelte-1uha8ag">✕</span><span class="svelte-1uha8ag">צריך לנהוג לשם</span></div> <div class="pain-item svelte-1uha8ag"><span class="pain-x svelte-1uha8ag">✕</span><span class="svelte-1uha8ag">רשימת המתנה</span></div> <div class="pain-item svelte-1uha8ag"><span class="pain-x svelte-1uha8ag">✕</span><span class="svelte-1uha8ag">קוד לבוש</span></div> <div class="pain-item svelte-1uha8ag"><span class="pain-x svelte-1uha8ag">✕</span><span class="svelte-1uha8ag">מרגישה לא בנוח כי את חדשה</span></div> <div class="pain-item svelte-1uha8ag"><span class="pain-x svelte-1uha8ag">✕</span><span class="svelte-1uha8ag">קצב שלהם, לא שלך</span></div> <div class="pain-item svelte-1uha8ag"><span class="pain-x svelte-1uha8ag">✕</span><span class="svelte-1uha8ag">לא מתאימים לכאבים או מגבלות</span></div></div></section> <section class="content-section section--pillars svelte-1uha8ag" aria-label="השלושה יסודות"><div class="section-header section-header--center svelte-1uha8ag"><span class="section-tag svelte-1uha8ag">WHAT YOU GET</span> <h2 class="svelte-1uha8ag">שלוש דרכים לזוז</h2></div> <div class="pillars-grid svelte-1uha8ag"><article class="pillar svelte-1uha8ag"><span class="pillar-num svelte-1uha8ag">01</span> <h3 class="svelte-1uha8ag">מוקלטים</h3> <p class="pillar-lead svelte-1uha8ag">15, 30, 45 דקות. לפי הקצב שלך.</p> <p class="pillar-body svelte-1uha8ag">מאות שיעורים בכל רמה. עם גרפיקת פטולוגיה שמסבירה בדיוק איזו שריר או עצם כל תרגיל מחזק. אין לוח זמנים נוקשה. אין אשמה על פספוס.</p></article> <article class="pillar svelte-1uha8ag"><span class="pillar-num svelte-1uha8ag">02</span> <h3 class="svelte-1uha8ag">חיים</h3> <p class="pillar-lead svelte-1uha8ag">עד 12 משתתפים. תיקון בזמן אמת.</p> <p class="pillar-body svelte-1uha8ag">שיעורים חיים בקבוצות קטנות. המדריכה רואה את כולם, מתקנת בזמן אמת, ויוצרת תחושת סטודיו — רק מהספה. קהילה ישראלית אמיתית.</p></article> <article class="pillar svelte-1uha8ag"><span class="pillar-num svelte-1uha8ag">03</span> <h3 class="svelte-1uha8ag">פרטי</h3> <p class="pillar-lead svelte-1uha8ag">אחד על אחד. התאמה מלאה.</p> <p class="pillar-body svelte-1uha8ag">שיעור פרטי אונליין עם התאמה מלאה לגוף שלך, לכאבים שלך, למטרות שלך. ליווי אישי ותכנית עבודה מותאמת — בנוי רק בשבילך.</p></article></div></section> <section class="content-section section--feature svelte-1uha8ag" aria-label="גרפיקת פטולוגיה"><div class="feature-split svelte-1uha8ag"><div class="feature-text svelte-1uha8ag"><span class="section-tag svelte-1uha8ag">UNIQUE</span> <h2 class="svelte-1uha8ag">תראי בדיוק מה כל תרגיל עושה לגוף שלך</h2> <p class="feature-lead svelte-1uha8ag">כל שיעור מוקלט מלווה בגרפיקה אנטומית שמראה בדיוק איזו שריר מופעל, איזו עצמה תומכת, ואיך התנועה עוזרת לפתולוגיה שלך.</p> <p class="feature-body svelte-1uha8ag">לא צריך לנחש. לא צריך לדע אנטומיה. פשוט רואים את החץ על השריר, קוראים את ההסבר, ויודעים בדיוק למה את עושה את זה.</p></div> <div class="feature-visual svelte-1uha8ag"><div class="anatomy-demo svelte-1uha8ag"><div class="anatomy-figure svelte-1uha8ag"><div class="anatomy-bone anatomy-bone--femur svelte-1uha8ag"></div> <div class="anatomy-muscle anatomy-muscle--quad svelte-1uha8ag"></div> <div class="anatomy-dot anatomy-dot--a svelte-1uha8ag"></div> <div class="anatomy-dot anatomy-dot--b svelte-1uha8ag"></div> <div class="anatomy-line anatomy-line--a svelte-1uha8ag"></div> <div class="anatomy-line anatomy-line--b svelte-1uha8ag"></div> <div class="anatomy-tag anatomy-tag--muscle svelte-1uha8ag">שריר הירך</div> <div class="anatomy-tag anatomy-tag--bone svelte-1uha8ag">עצם הירך</div></div> <div class="anatomy-caption svelte-1uha8ag">דוגמה לגרפיקה בשיעור</div></div></div></div></section> <section class="content-section section--creds svelte-1uha8ag" aria-label="הסמכות"><div class="creds-inner svelte-1uha8ag"><span class="section-tag svelte-1uha8ag">LINEAGE</span> <blockquote class="creds-quote svelte-1uha8ag">למדתי אצל מרתה פילאטיס.</blockquote> <p class="creds-body svelte-1uha8ag">השיטה שלי מבוססת על ירושה ישירה של שיטת פילאטיס הקלאסית, עם התמחות עמוקה בפתולוגיות ושיקום. לא "תעשי איתי" מיוטיוב — אלא הבנה אנטומית מדויקת של הגוף שלך.</p></div></section> <section class="content-section section--steps svelte-1uha8ag" aria-label="איך זה עובד"><div class="section-header section-header--center svelte-1uha8ag"><span class="section-tag svelte-1uha8ag">HOW IT WORKS</span> <h2 class="svelte-1uha8ag">שלוש צעדים ואת בתוכנית</h2></div> <div class="steps-grid svelte-1uha8ag"><div class="step svelte-1uha8ag"><span class="step-num svelte-1uha8ag">01</span> <h3 class="svelte-1uha8ag">נרשמת בחינם</h3> <p class="svelte-1uha8ag">שיעור ראשון בחינם, בלי כרטיס אשראי, בלי התחייבות.</p></div> <div class="step svelte-1uha8ag"><span class="step-num svelte-1uha8ag">02</span> <h3 class="svelte-1uha8ag">בוחרת את הנתיב שלך</h3> <p class="svelte-1uha8ag">מוקלטים לבד, לייב בקבוצה, או שיעור פרטי — לפי הרמה והנוחות שלך.</p></div> <div class="step svelte-1uha8ag"><span class="step-num svelte-1uha8ag">03</span> <h3 class="svelte-1uha8ag">מתחילה לזוז</h3> <p class="svelte-1uha8ag">לוחצת play ומתחילה. עם תמיכה, קהילה, וגרפיקה שמלמדת אותך בדרך.</p></div></div></section> <section class="content-section section--testimonials svelte-1uha8ag" aria-label="מה אומרים עלינו"><div class="section-header svelte-1uha8ag"><span class="section-tag svelte-1uha8ag">TESTIMONIALS</span> <h2 class="svelte-1uha8ag">מה הקהילה אומרת</h2></div> <div class="testimonials-grid svelte-1uha8ag"><blockquote class="testimonial svelte-1uha8ag"><p class="svelte-1uha8ag">"אחרי שנים של כאבי גב, סוף סוף מצאתי מקום שמבין אותי. השיעורים השיקומיים הצילו אותי."</p> <footer class="svelte-1uha8ag">— רוני, 42, תל אביב</footer></blockquote> <blockquote class="testimonial svelte-1uha8ag"><p class="svelte-1uha8ag">"הגרפיקה של השרירים עוזרת לי להבין בדיוק מה אני עושה. פעם ראשונה שאני לא מרגישה אבודה בשיעור פילאטיס."</p> <footer class="svelte-1uha8ag">— מיכל, 35, חיפה</footer></blockquote> <blockquote class="testimonial svelte-1uha8ag"><p class="svelte-1uha8ag">"השיעורים הפרטיים שינו לי את החיים. התאמה אישית, הקשבה אמיתית, ותוצאות שאני מרגישה."</p> <footer class="svelte-1uha8ag">— שרה, 51, ירושלים</footer></blockquote></div></section> <section class="content-section section--faq svelte-1uha8ag" aria-label="שאלות נפוצות"><div class="section-header svelte-1uha8ag"><span class="section-tag svelte-1uha8ag">FAQ</span> <h2 class="svelte-1uha8ag">שאלות נפוצות</h2></div> <div class="faq-list svelte-1uha8ag"><details class="faq-item svelte-1uha8ag"><summary class="svelte-1uha8ag">אני מתחילה לגמרי — זה מתאים לי?</summary> <p class="svelte-1uha8ag">לגמרי. יש שיעורי מבוא, ניווט ברמות, והתאמה לכל רמה פיזית. ואם צריך — תמיד אפשר שיעור פרטי.</p></details> <details class="faq-item svelte-1uha8ag"><summary class="svelte-1uha8ag">האם השיעורים מתאימים לכאבי גב / דיסק / כתף קפואה?</summary> <p class="svelte-1uha8ag">כן. זה בדיוק התמחות שלנו. כל שיעור מלווה בהסברים על איזה תרגיל מתאים לאיזו פתולוגיה, ומה לעשות אם משהו כואב.</p></details> <details class="faq-item svelte-1uha8ag"><summary class="svelte-1uha8ag">איזה ציוד אני צריכה?</summary> <p class="svelte-1uha8ag">רק מזרן. אין צורך בציוד מקצועי או בסטודיו יקר. חלק מהשיעורים משתמשים בחפצים פשוטים מהבית.</p></details> <details class="faq-item svelte-1uha8ag"><summary class="svelte-1uha8ag">מה ההבדל בין מוקלט ללייב?</summary> <p class="svelte-1uha8ag">מוקלט — צופים בזמן שלך, 15/30/45 דקות. לייב — שיעור קבוצתי בזמן אמת עם תיקונים אישיים. למי שרוצה אנרגיה של קבוצה.</p></details> <details class="faq-item svelte-1uha8ag"><summary class="svelte-1uha8ag">איך עובד השיעור הפרטי?</summary> <p class="svelte-1uha8ag">תואמים זמן, מתחברים בווידאו, והמדריכה בונה שיעור מותאם אישית לגוף ולמטרות שלך.</p></details></div></section> <section class="content-section section--final-cta svelte-1uha8ag" aria-label="התחילי עכשיו"><div class="final-cta-inner svelte-1uha8ag"><h2 class="svelte-1uha8ag">גוף אמיתי.<br class="svelte-1uha8ag"/>תנועה אמיתית.</h2> <p class="svelte-1uha8ag">השיעור הראשון בחינם. בלי כרטיס אשראי. בלי סיפורים.</p> <button class="btn btn--ink btn--xl svelte-1uha8ag">תני לי את השיעור הראשון</button> <p class="final-cta-note svelte-1uha8ag">HomeBody — פילאטיס שיקומי בבית, בעברית, עם קהילה.</p></div></section></main> <div id="auth-overlay" class="auth-overlay svelte-1uha8ag" role="button" tabindex="-1"><div class="auth-card svelte-1uha8ag" role="dialog" aria-modal="true" aria-label="כניסה והרשמה">`);
		AuthPanel($$renderer, {});
		$$renderer.push(`<!----></div></div>`);
	});
}
//#endregion
export { _page as default };
