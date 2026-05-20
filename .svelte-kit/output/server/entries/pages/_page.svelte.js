import "../../chunks/index-server.js";
import { a as bind_props, c as ensure_array_like, et as attr, g as html, l as head, nt as escape_html, o as derived } from "../../chunks/dev.js";
import { t as SITE } from "../../chunks/config.js";
import { n as routePath } from "../../chunks/context.js";
import { a as signOut, f as useConvexClient, r as initAuth, s as api } from "../../chunks/session.svelte.js";
import { p as Portal } from "../../chunks/scroll-lock.js";
import { n as Dialog, r as Dialog_overlay, t as Dialog_content } from "../../chunks/dialog-content.js";
import { t as Button_1 } from "../../chunks/Button.js";
import { t as page } from "../../chunks/state.js";
import { t as Notice } from "../../chunks/Notice.js";
import { t as useI18n } from "../../chunks/runes.svelte.js";
//#region src/lib/components/seo/SEO.svelte
function SEO($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { title, description = SITE.description, keywords = SITE.keywords, ogType = "website", ogImage = SITE.ogImage, canonical, noindex = false, nofollow = false, robotsMaxSnippet, robotsMaxImagePreview, jsonLd, breadcrumbs, alternateLanguages, article, video } = $$props;
		const fullTitle = derived(() => title.includes(SITE.name) ? title : `${title} | ${SITE.name}`);
		const canonicalUrl = derived(() => canonical ?? `${SITE.domain}${page.url.pathname}`);
		const ogImageUrl = derived(() => ogImage.startsWith("http") ? ogImage : `${SITE.domain}${ogImage}`);
		const robotsDirectives = derived(() => () => {
			const parts = [];
			if (noindex) parts.push("noindex");
			if (nofollow) parts.push("nofollow");
			if (!noindex && !nofollow) parts.push("index, follow");
			if (robotsMaxSnippet !== void 0) parts.push(`max-snippet:${robotsMaxSnippet}`);
			if (robotsMaxImagePreview) parts.push(`max-image-preview:${robotsMaxImagePreview}`);
			return parts.join(", ");
		});
		const allLd = derived(() => () => {
			const out = [];
			if (breadcrumbs) out.push({
				"@context": "https://schema.org",
				"@type": "BreadcrumbList",
				itemListElement: breadcrumbs.map((c, i) => ({
					"@type": "ListItem",
					position: i + 1,
					name: c.name,
					item: c.url
				}))
			});
			if (jsonLd) out.push(...Array.isArray(jsonLd) ? jsonLd : [jsonLd]);
			return out;
		});
		head("4zaoqz", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${escape_html(fullTitle())}</title>`);
			});
			$$renderer.push(`<meta name="description"${attr("content", description)}/> <meta name="keywords"${attr("content", keywords)}/> <link rel="canonical"${attr("href", canonicalUrl())}/> <meta name="robots"${attr("content", robotsDirectives()())}/> <meta name="googlebot"${attr("content", robotsDirectives()())}/> <meta name="language"${attr("content", SITE.lang)}/> <meta name="author"${attr("content", SITE.name)}/> <meta name="publisher"${attr("content", SITE.name)}/> <meta name="copyright"${attr("content", `© ${(/* @__PURE__ */ new Date()).getFullYear()} ${SITE.name}`)}/> <meta property="og:site_name"${attr("content", SITE.name)}/> <meta property="og:title"${attr("content", fullTitle())}/> <meta property="og:description"${attr("content", description)}/> <meta property="og:type"${attr("content", ogType)}/> <meta property="og:url"${attr("content", canonicalUrl())}/> <meta property="og:locale"${attr("content", SITE.locale)}/> <meta property="og:image"${attr("content", ogImageUrl())}/> <meta property="og:image:alt"${attr("content", fullTitle())}/> <meta name="twitter:card" content="summary_large_image"/> <meta name="twitter:site"${attr("content", SITE.twitterHandle)}/> <meta name="twitter:creator"${attr("content", SITE.twitterHandle)}/> <meta name="twitter:title"${attr("content", fullTitle())}/> <meta name="twitter:description"${attr("content", description)}/> <meta name="twitter:image"${attr("content", ogImageUrl())}/> <meta name="twitter:image:alt"${attr("content", fullTitle())}/> `);
			if (article) {
				$$renderer.push("<!--[0-->");
				if (article.publishedTime) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<meta property="article:published_time"${attr("content", article.publishedTime)}/>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				if (article.modifiedTime) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<meta property="article:modified_time"${attr("content", article.modifiedTime)}/>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				if (article.author) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<meta property="article:author"${attr("content", article.author)}/>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				if (article.section) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<meta property="article:section"${attr("content", article.section)}/>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				if (article.tags) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<!--[-->`);
					const each_array = ensure_array_like(article.tags);
					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let tag = each_array[$$index];
						$$renderer.push(`<meta property="article:tag"${attr("content", tag)}/>`);
					}
					$$renderer.push(`<!--]-->`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]-->`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (video) {
				$$renderer.push("<!--[0-->");
				if (video.duration) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<meta property="video:duration"${attr("content", video.duration)}/>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				if (video.releaseDate) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<meta property="video:release_date"${attr("content", video.releaseDate)}/>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]-->`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (alternateLanguages) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<!--[-->`);
				const each_array_1 = ensure_array_like(alternateLanguages);
				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let alt = each_array_1[$$index_1];
					$$renderer.push(`<link rel="alternate"${attr("hreflang", alt.lang)}${attr("href", alt.url)}/>`);
				}
				$$renderer.push(`<!--]-->`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <link rel="alternate" hreflang="x-default"${attr("href", SITE.domain)}/>`);
		});
		$$renderer.push(`<!--[-->`);
		const each_array_2 = ensure_array_like(allLd()());
		for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
			let item = each_array_2[$$index_2];
			const json = JSON.stringify(item);
			$$renderer.push(`${html(`<script type="application/ld+json">${json}<\/script>`)}`);
		}
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
//#region src/lib/seo/schema.ts
function ld(type, rest) {
	return {
		"@context": "https://schema.org",
		"@type": type,
		...rest
	};
}
function websiteSchema(searchUrl) {
	const base = ld("WebSite", {
		name: `${SITE.name} | ${SITE.tagline}`,
		url: SITE.domain,
		inLanguage: SITE.locale,
		description: SITE.description,
		publisher: { "@id": `${SITE.domain}/#organization` }
	});
	if (searchUrl) base.potentialAction = {
		"@type": "SearchAction",
		target: {
			"@type": "EntryPoint",
			urlTemplate: `${SITE.domain}/search?q={search_term_string}`
		},
		"query-input": "required name=search_term_string"
	};
	return base;
}
function organizationSchema() {
	return ld("Organization", {
		"@id": `${SITE.domain}/#organization`,
		name: SITE.name,
		alternateName: SITE.nameHebrew,
		url: SITE.domain,
		logo: `${SITE.domain}/favicon.svg`,
		description: SITE.description,
		foundingDate: SITE.founded,
		sameAs: Object.values(SITE.social).filter(Boolean),
		contactPoint: {
			"@type": "ContactPoint",
			telephone: SITE.phone,
			contactType: "customer service",
			availableLanguage: ["Hebrew", "English"]
		}
	});
}
function localBusinessSchema() {
	return ld("ExerciseGym", {
		"@id": `${SITE.domain}/#business`,
		name: `${SITE.name} — ${SITE.tagline}`,
		alternateName: SITE.nameHebrew,
		url: SITE.domain,
		logo: `${SITE.domain}/favicon.svg`,
		description: SITE.description,
		image: `${SITE.domain}${SITE.ogImage}`,
		priceRange: SITE.priceRange,
		telephone: SITE.phone,
		email: SITE.email,
		address: {
			"@type": "PostalAddress",
			addressLocality: SITE.address.city,
			addressRegion: SITE.address.region,
			addressCountry: SITE.address.country
		},
		geo: {
			"@type": "GeoCoordinates",
			latitude: SITE.geo.latitude,
			longitude: SITE.geo.longitude
		},
		openingHoursSpecification: SITE.openingHours.map((h) => ({
			"@type": "OpeningHoursSpecification",
			dayOfWeek: h.dayOfWeek,
			opens: h.opens,
			closes: h.closes
		})),
		sameAs: Object.values(SITE.social).filter(Boolean),
		areaServed: {
			"@type": "Country",
			name: "Israel"
		},
		hasOfferCatalog: { "@id": `${SITE.domain}/#offers` }
	});
}
function offerCatalogSchema() {
	return ld("OfferCatalog", {
		"@id": `${SITE.domain}/#offers`,
		name: "שירותי פילאטיס אונליין",
		itemListElement: [
			{
				"@type": "Offer",
				itemOffered: {
					"@type": "Service",
					name: "שיעורי פילאטיס מוקלטים",
					description: "מאות שיעורים מוקלטים בכל רמה — 15, 30, 45 דקות. עם גרפיקת פטולוגיה אנטומית.",
					provider: { "@id": `${SITE.domain}/#organization` },
					areaServed: {
						"@type": "Country",
						name: "Israel"
					},
					audience: {
						"@type": "PeopleAudience",
						audienceType: "מבוגרים עם כאבים או מגבלות תנועה"
					}
				}
			},
			{
				"@type": "Offer",
				itemOffered: {
					"@type": "Service",
					name: "שיעורי פילאטיס חיים בקבוצה",
					description: "שיעורים חיים בקבוצות קטנות עד 12 משתתפים, עם תיקון בזמן אמת.",
					provider: { "@id": `${SITE.domain}/#organization` },
					areaServed: {
						"@type": "Country",
						name: "Israel"
					}
				}
			},
			{
				"@type": "Offer",
				itemOffered: {
					"@type": "Service",
					name: "שיעור פילאטיס פרטי אונליין",
					description: "שיעור אחד על אחד עם התאמה מלאה לגוף, לכאבים ולמטרות האישיות.",
					provider: { "@id": `${SITE.domain}/#organization` },
					areaServed: {
						"@type": "Country",
						name: "Israel"
					}
				}
			}
		]
	});
}
function courseSchema() {
	return ld("Course", {
		"@id": `${SITE.domain}/#course`,
		name: "קורס פילאטיס שיקומי אונליין",
		description: "קורס פילאטיס מקיף באנגלית/עברית עם התמחות בפתולוגיות, כאבי גב, דיסק, כתף קפואה ושיקום אחרי ניתוח.",
		provider: { "@id": `${SITE.domain}/#organization` },
		inLanguage: "he",
		educationalLevel: "מתחילים עד מתקדמים",
		teaches: [
			"פילאטיס קלאסי",
			"פילאטיס שיקומי",
			"הבנת אנטומיה בתנועה",
			"תרגילים לכאבי גב",
			"תרגילים לדיסק",
			"תרגילים לכתף קפואה"
		],
		hasCourseInstance: [
			{
				"@type": "CourseInstance",
				courseMode: "online",
				courseWorkload: "PT15M",
				inLanguage: "he"
			},
			{
				"@type": "CourseInstance",
				courseMode: "online",
				courseWorkload: "PT30M",
				inLanguage: "he"
			},
			{
				"@type": "CourseInstance",
				courseMode: "online",
				courseWorkload: "PT45M",
				inLanguage: "he"
			},
			{
				"@type": "CourseInstance",
				courseMode: ["online", "synchronous"],
				courseWorkload: "PT60M",
				inLanguage: "he"
			}
		]
	});
}
function faqPageSchema(items) {
	return ld("FAQPage", { mainEntity: items.map((item) => ({
		"@type": "Question",
		name: item.question,
		acceptedAnswer: {
			"@type": "Answer",
			text: item.answer
		}
	})) });
}
function howToSchema(name, description, steps) {
	return ld("HowTo", {
		name,
		description,
		inLanguage: "he",
		step: steps.map((s) => ({
			"@type": "HowToStep",
			position: s.position,
			name: s.name,
			text: s.text
		}))
	});
}
function breadcrumbSchema(crumbs) {
	return ld("BreadcrumbList", { itemListElement: crumbs.map((c, i) => ({
		"@type": "ListItem",
		position: i + 1,
		name: c.name,
		item: c.url
	})) });
}
function medicalWebPageSchema(title, description, url, lastReviewed) {
	return ld("MedicalWebPage", {
		"@id": `${url}#webpage`,
		name: title,
		description,
		url,
		inLanguage: SITE.locale,
		lastReviewed: lastReviewed ?? (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		reviewedBy: {
			"@type": "Person",
			name: "מדריכת פילאטיס מוסמכת",
			description: "מדריכת פילאטיס עם הסמכה מבית מרתה פילאטיס והתמחות בפתולוגיות ושיקום."
		},
		about: {
			"@type": "MedicalCondition",
			name: "כאבי גב כרוניים, מגבלות תנועה, שיקום אורתופדי",
			description: "פילאטיס שיקומי כטיפול תומך בכאבי גב, דיסק, כתף קפואה ומגבלות תנועה נוספות."
		},
		isPartOf: { "@id": `${SITE.domain}/#website` },
		primaryImageOfPage: {
			"@type": "ImageObject",
			url: `${SITE.domain}${SITE.ogImage}`
		},
		speakable: {
			"@type": "SpeakableSpecification",
			cssSelector: [
				".hero h1",
				".lead",
				"#content"
			]
		}
	});
}
function personSchema(name, description, jobTitle, alumniOf) {
	return ld("Person", {
		name,
		description,
		jobTitle,
		alumniOf: alumniOf ? {
			"@type": "Organization",
			name: alumniOf
		} : void 0,
		worksFor: { "@id": `${SITE.domain}/#organization` },
		knowsAbout: [
			"פילאטיס קלאסי",
			"פילאטיס שיקומי",
			"פתולוגיות של מערכת תנועה",
			"אנטומיה פונקציונלית",
			"שיקום אורתופדי"
		]
	});
}
function schemaGraph(...schemas) {
	return {
		"@context": "https://schema.org",
		"@graph": schemas.map((s) => {
			const { "@context": _, ...rest } = s;
			return rest;
		})
	};
}
//#endregion
//#region src/lib/components/ui/Input.svelte
function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { label, name, type = "text", value = "", autocomplete, inputmode, required = false } = $$props;
		$$renderer.push(`<label class="hb-input-field"><span class="hb-field__label">${escape_html(label)}</span> <input class="hb-input"${attr("value", value)}${attr("name", name)}${attr("type", type)}${attr("autocomplete", autocomplete)}${attr("inputmode", inputmode)}${attr("required", required, true)}/></label>`);
		bind_props($$props, { value });
	});
}
//#endregion
//#region src/lib/features/auth/components/EmailStep.svelte
function EmailStep($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { email = void 0, pending, method, sendCode, sendLink } = $$props;
		const { t } = useI18n();
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			Input($$renderer, {
				label: t.auth.emailLabel(),
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
			$$renderer.push(`<!----> <div class="method-buttons svelte-115ousx">`);
			Button_1($$renderer, {
				type: "button",
				tone: "ink",
				disabled: pending,
				onclick: sendCode,
				children: ($$renderer) => {
					$$renderer.push(`<!---->${escape_html(pending && method === "code" ? t.auth.pendingSendCode() : `📩 ${t.auth.submitSendCode()}`)}`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----> `);
			Button_1($$renderer, {
				type: "button",
				tone: "paper",
				disabled: pending,
				onclick: sendLink,
				children: ($$renderer) => {
					$$renderer.push(`<!---->${escape_html(pending && method === "link" ? t.auth.pendingSendLink() : `🔗 ${t.auth.submitSendLink()}`)}`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----></div>`);
		}
		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer.subsume($$inner_renderer);
		bind_props($$props, { email });
	});
}
//#endregion
//#region src/lib/features/auth/components/CodeStep.svelte
function CodeStep($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { code = void 0, email, pending, method, reset, switchToCode } = $$props;
		const { t } = useI18n();
		function openEmailApp() {
			window.location.href = "mailto:";
		}
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			if (method === "code") {
				$$renderer.push("<!--[0-->");
				Input($$renderer, {
					label: t.auth.codeLabel(),
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
				$$renderer.push(`<!----> `);
				Button_1($$renderer, {
					type: "submit",
					tone: "ink",
					disabled: pending,
					children: ($$renderer) => {
						$$renderer.push(`<!---->${escape_html(pending ? t.auth.pendingVerify() : t.auth.submitEnter())}`);
					},
					$$slots: { default: true }
				});
				$$renderer.push(`<!----> <div class="auth-links svelte-2pyi9i">`);
				Button_1($$renderer, {
					tone: "ghost",
					type: "button",
					onclick: reset,
					children: ($$renderer) => {
						$$renderer.push(`<!---->${escape_html(t.auth.switchEmail())}`);
					},
					$$slots: { default: true }
				});
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div class="link-sent svelte-2pyi9i"><p class="svelte-2pyi9i">${escape_html(t.auth.linkSentText())}</p> `);
				Button_1($$renderer, {
					type: "button",
					tone: "paper",
					onclick: openEmailApp,
					children: ($$renderer) => {
						$$renderer.push(`<!---->📧 ${escape_html(t.auth.openEmailApp())}`);
					},
					$$slots: { default: true }
				});
				$$renderer.push(`<!----></div> <div class="auth-divider svelte-2pyi9i"><span>${escape_html(t.misc.or())}</span></div> <div class="auth-links svelte-2pyi9i">`);
				Button_1($$renderer, {
					tone: "ghost",
					type: "button",
					onclick: switchToCode,
					children: ($$renderer) => {
						$$renderer.push(`<!---->${escape_html(t.auth.enterCodeManually())}`);
					},
					$$slots: { default: true }
				});
				$$renderer.push(`<!----> `);
				Button_1($$renderer, {
					tone: "ghost",
					type: "button",
					onclick: reset,
					children: ($$renderer) => {
						$$renderer.push(`<!---->${escape_html(t.auth.switchEmail())}`);
					},
					$$slots: { default: true }
				});
				$$renderer.push(`<!----></div>`);
			}
			$$renderer.push(`<!--]-->`);
		}
		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer.subsume($$inner_renderer);
		bind_props($$props, { code });
	});
}
//#endregion
//#region src/lib/features/auth/components/LoggedInState.svelte
function LoggedInState($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { signOut, closeModal } = $$props;
		const { t } = useI18n();
		$$renderer.push(`<div class="auth-state svelte-1si2n1d"><div class="auth-state__text svelte-1si2n1d"><p class="kicker svelte-1si2n1d">${escape_html(t.auth.loggedIn.kicker())}</p> <h2 class="svelte-1si2n1d">${escape_html(t.auth.loggedIn.title())}</h2> <p class="intro svelte-1si2n1d">${escape_html(t.auth.loggedIn.subtitle())}</p></div> `);
		Button_1($$renderer, {
			tone: "ink",
			href: routePath("dashboard"),
			children: ($$renderer) => {
				$$renderer.push(`<!---->${escape_html(t.auth.loggedIn.cta())}`);
			},
			$$slots: { default: true }
		});
		$$renderer.push(`<!----> `);
		Button_1($$renderer, {
			tone: "paper",
			type: "button",
			onclick: () => {
				signOut();
				closeModal();
			},
			children: ($$renderer) => {
				$$renderer.push(`<!---->${escape_html(t.auth.loggedIn.signOut())}`);
			},
			$$slots: { default: true }
		});
		$$renderer.push(`<!----></div>`);
	});
}
//#endregion
//#region src/lib/features/auth/components/AuthPanel.svelte
function AuthPanel($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let step = "email";
		let method = null;
		let email = "";
		let code = "";
		let status = "";
		let pending = false;
		const auth = initAuth();
		const client = useConvexClient();
		const { t } = useI18n();
		async function sendCode() {
			if (!email.trim()) {
				status = t.auth.validation.emailRequired();
				return;
			}
			method = "code";
			await submitRequest();
		}
		async function sendLink() {
			if (!email.trim()) {
				status = t.auth.validation.emailRequired();
				return;
			}
			method = "link";
			await submitRequest();
		}
		async function submitRequest() {
			status = "";
			pending = true;
			try {
				await client.action(api.auth.signIn, {
					provider: "email",
					params: { email: email.trim().toLowerCase() }
				});
				step = "verify";
				if (method === "code") status = t.auth.statusCodeSent();
				else status = t.auth.statusLinkSent();
			} catch (reason) {
				status = reason instanceof Error ? reason.message : t.auth.statusSendError();
				method = null;
			} finally {
				pending = false;
			}
		}
		function reset() {
			step = "email";
			method = null;
			status = "";
			code = "";
		}
		function closeModal() {
			window.dispatchEvent(new CustomEvent("homebody:auth-close"));
		}
		function switchToCode() {
			method = "code";
			code = "";
			status = "";
		}
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			if (auth.isLoading) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="auth-state svelte-1afm3hr">`);
				Notice($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->${escape_html(t.auth.loading())}`);
					},
					$$slots: { default: true }
				});
				$$renderer.push(`<!----></div>`);
			} else if (auth.isAuthenticated) {
				$$renderer.push("<!--[1-->");
				LoggedInState($$renderer, {
					signOut,
					closeModal
				});
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<form class="auth-form svelte-1afm3hr"><div class="auth-form__header svelte-1afm3hr"><p class="kicker svelte-1afm3hr">${escape_html(t.auth.title())}</p> `);
				if (step === "email") {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<h2 class="svelte-1afm3hr">${escape_html(t.auth.emailStepTitle())}</h2> <p class="intro svelte-1afm3hr">${escape_html(t.auth.emailStepIntro())}</p>`);
				} else if (method === "code") {
					$$renderer.push("<!--[1-->");
					$$renderer.push(`<h2 class="svelte-1afm3hr">${escape_html(t.auth.codeStepTitle())}</h2> <p class="intro svelte-1afm3hr">${escape_html(t.auth.codeStepIntro({ email }))}</p>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<h2 class="svelte-1afm3hr">${escape_html(t.auth.codeStepTitle())}</h2> <p class="intro svelte-1afm3hr">${escape_html(t.auth.linkStepIntro({ email }))}</p>`);
				}
				$$renderer.push(`<!--]--></div> `);
				if (step === "email") {
					$$renderer.push("<!--[0-->");
					EmailStep($$renderer, {
						pending,
						method,
						sendCode,
						sendLink,
						get email() {
							return email;
						},
						set email($$value) {
							email = $$value;
							$$settled = false;
						}
					});
				} else {
					$$renderer.push("<!--[-1-->");
					CodeStep($$renderer, {
						email,
						pending,
						method,
						reset,
						switchToCode,
						get code() {
							return code;
						},
						set code($$value) {
							code = $$value;
							$$settled = false;
						}
					});
				}
				$$renderer.push(`<!--]--> `);
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
				if (status) {
					$$renderer.push("<!--[0-->");
					Notice($$renderer, {
						tone: status.includes("לא הצלחנו") || status.includes("שגוי") || status.includes("נא להזין") ? "danger" : "neutral",
						children: ($$renderer) => {
							$$renderer.push(`<!---->${escape_html(status)}`);
						},
						$$slots: { default: true }
					});
				} else $$renderer.push("<!--[-1-->");
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
//#region src/lib/components/layout/Footer.svelte
function Footer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const year = (/* @__PURE__ */ new Date()).getFullYear();
		$$renderer.push(`<footer class="site-footer svelte-7lfk2o"><div class="footer-inner svelte-7lfk2o"><div class="footer-brand svelte-7lfk2o"><span class="footer-logo svelte-7lfk2o">HomeBody</span> <span class="footer-tagline svelte-7lfk2o">פילאטיס שיקומי אונליין</span></div> <div class="footer-links svelte-7lfk2o"><a href="/" class="svelte-7lfk2o">דף הבית</a></div> <div class="footer-contact svelte-7lfk2o"><a href="mailto:hello@homebody.fitness" class="svelte-7lfk2o">hello@homebody.fitness</a> <span dir="ltr" class="svelte-7lfk2o">+972-50-000-0000</span></div></div> <div class="footer-legal svelte-7lfk2o"><span>© ${escape_html(year)} HomeBody</span> <span>תנאי שימוש</span> <span>מדיניות פרטיות</span></div></footer>`);
	});
}
//#endregion
//#region src/lib/features/landing/components/HeroSection.svelte
function HeroSection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { openAuthOverlay } = $$props;
		const { t } = useI18n();
		$$renderer.push(`<section class="hero" aria-label="ראשי"><div class="hero__inner"><p class="eyebrow">${escape_html(t.landing.hero.eyebrow())}</p> <h1>${escape_html(t.landing.hero.headline())}</h1> <p class="lead">${escape_html(t.landing.hero.lead())}</p> <div class="actions">`);
		Button_1($$renderer, {
			tone: "ink",
			onclick: openAuthOverlay,
			children: ($$renderer) => {
				$$renderer.push(`<!---->${escape_html(t.landing.hero.ctaPrimary())}`);
			},
			$$slots: { default: true }
		});
		$$renderer.push(`<!----> `);
		Button_1($$renderer, {
			tone: "paper",
			href: "#instructor",
			children: ($$renderer) => {
				$$renderer.push(`<!---->${escape_html(t.landing.hero.ctaSecondary())}`);
			},
			$$slots: { default: true }
		});
		$$renderer.push(`<!----></div></div></section>`);
	});
}
//#endregion
//#region src/lib/features/landing/components/PhilosophySection.svelte
function PhilosophySection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { t } = useI18n();
		$$renderer.push(`<section class="content-section section--philosophy" aria-label="הגישה שלנו"><div class="philosophy-inner"><span class="section-tag">${escape_html(t.landing.philosophy.tag())}</span> <h2>${escape_html(t.landing.philosophy.headline())}</h2> <p class="philosophy-body">${escape_html(t.landing.philosophy.body())}</p></div></section>`);
	});
}
//#endregion
//#region src/lib/features/landing/components/InstructorSection.svelte
function InstructorSection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { instructor } = $$props;
		const { t } = useI18n();
		$$renderer.push(`<section id="instructor" class="content-section section--instructor" aria-label="המדריכה"><div class="instructor-split"><div class="instructor-visual"><div class="instructor-photo-placeholder"><span class="instructor-photo-label">${escape_html(t.landing.instructor.photoPlaceholder())}</span></div></div> <div class="instructor-text"><span class="section-tag">${escape_html(t.landing.instructor.tag())}</span> <h2>${escape_html(instructor.name)} — ${escape_html(t.landing.instructor.subtitle())}</h2> <p class="instructor-lead">${escape_html(t.landing.instructor.lead())}</p> <p class="instructor-body">${escape_html(t.landing.instructor.body({ years: instructor.years }))}</p> <p class="instructor-story">${escape_html(instructor.story)}</p> <div class="instructor-creds"><div class="cred-item"><span class="cred-num">01</span> <span class="cred-label">${escape_html(t.landing.instructor.cred1())}</span></div> <div class="cred-item"><span class="cred-num">02</span> <span class="cred-label">${escape_html(t.landing.instructor.cred2())}</span></div> <div class="cred-item"><span class="cred-num">03</span> <span class="cred-label">${escape_html(t.landing.instructor.cred3({ years: instructor.years }))}</span></div></div></div></div></section>`);
	});
}
//#endregion
//#region src/lib/features/landing/components/PreviewSection.svelte
function PreviewSection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { t } = useI18n();
		$$renderer.push(`<section class="content-section section--preview" aria-label="תצוגה מקדימה"><div class="section-header section-header--center"><span class="section-tag">${escape_html(t.landing.preview.tag())}</span> <h2>${escape_html(t.landing.preview.headline())}</h2></div> <div class="preview-frame"><div class="preview-placeholder"><div class="preview-label"><strong>${escape_html(t.landing.preview.videoPlaceholderTitle())}</strong> <span>${escape_html(t.landing.preview.videoPlaceholderSubtitle())}</span></div></div> <div class="preview-caption">${escape_html(t.landing.preview.caption())}</div></div> <div class="preview-features"><div class="preview-feature"><span class="preview-feature-num">01</span> <h3>${escape_html(t.landing.preview.feature1Title())}</h3> <p>${escape_html(t.landing.preview.feature1Desc())}</p></div> <div class="preview-feature"><span class="preview-feature-num">02</span> <h3>${escape_html(t.landing.preview.feature2Title())}</h3> <p>${escape_html(t.landing.preview.feature2Desc())}</p></div> <div class="preview-feature"><span class="preview-feature-num">03</span> <h3>${escape_html(t.landing.preview.feature3Title())}</h3> <p>${escape_html(t.landing.preview.feature3Desc())}</p></div></div></section>`);
	});
}
//#endregion
//#region src/lib/features/landing/components/PillarsSection.svelte
function PillarsSection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { t } = useI18n();
		$$renderer.push(`<section class="content-section section--pillars" aria-label="השירותים"><div class="section-header section-header--center"><span class="section-tag">${escape_html(t.landing.pillars.tag())}</span> <h2>${escape_html(t.landing.pillars.headline())}</h2></div> <div class="pillars-grid"><article class="pillar"><span class="pillar-num">01</span> <h3>${escape_html(t.landing.pillars.macroTitle())}</h3> <p class="pillar-lead">${escape_html(t.landing.pillars.macroLead())}</p> <p class="pillar-body">${escape_html(t.landing.pillars.macroBody())}</p></article> <article class="pillar"><span class="pillar-num">02</span> <h3>${escape_html(t.landing.pillars.microTitle())}</h3> <p class="pillar-lead">${escape_html(t.landing.pillars.microLead())}</p> <p class="pillar-body">${escape_html(t.landing.pillars.microBody())}</p></article> <article class="pillar"><span class="pillar-num">03</span> <h3>${escape_html(t.landing.pillars.liveTitle())}</h3> <p class="pillar-lead">${escape_html(t.landing.pillars.liveLead())}</p> <p class="pillar-body">${escape_html(t.landing.pillars.liveBody())}</p></article></div></section>`);
	});
}
//#endregion
//#region src/lib/features/landing/components/StepsSection.svelte
function StepsSection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { t } = useI18n();
		$$renderer.push(`<section class="content-section section--steps" aria-label="איך זה עובד"><div class="section-header section-header--center"><span class="section-tag">${escape_html(t.landing.steps.tag())}</span> <h2>${escape_html(t.landing.steps.headline())}</h2></div> <div class="steps-grid"><div class="step"><span class="step-num">01</span> <h3>${escape_html(t.landing.steps.step1Title())}</h3> <p>${escape_html(t.landing.steps.step1Desc())}</p></div> <div class="step"><span class="step-num">02</span> <h3>${escape_html(t.landing.steps.step2Title())}</h3> <p>${escape_html(t.landing.steps.step2Desc())}</p></div> <div class="step"><span class="step-num">03</span> <h3>${escape_html(t.landing.steps.step3Title())}</h3> <p>${escape_html(t.landing.steps.step3Desc())}</p></div></div></section>`);
	});
}
//#endregion
//#region src/lib/features/landing/components/PricingSection.svelte
function PricingSection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { openAuthOverlay } = $$props;
		const { t } = useI18n();
		$$renderer.push(`<section class="content-section section--pricing" aria-label="מחירים"><div class="section-header section-header--center"><span class="section-tag">${escape_html(t.landing.pricing.tag())}</span> <h2>${escape_html(t.landing.pricing.headline())}</h2></div> <div class="pricing-grid"><div class="pricing-card pricing-card--featured"><div class="pricing-header"><span class="pricing-label">${escape_html(t.landing.pricing.trial.label())}</span> <span class="pricing-price pricing-price--highlight">${escape_html(t.landing.pricing.trial.price())}</span></div> <p class="pricing-note">${escape_html(t.landing.pricing.trial.note())}</p> `);
		Button_1($$renderer, {
			tone: "ink",
			onclick: openAuthOverlay,
			children: ($$renderer) => {
				$$renderer.push(`<!---->${escape_html(t.landing.pricing.ctaButton())}`);
			},
			$$slots: { default: true }
		});
		$$renderer.push(`<!----></div> <div class="pricing-card"><div class="pricing-header"><span class="pricing-label">${escape_html(t.landing.pricing.recorded.label())}</span> <span class="pricing-price">${escape_html(t.landing.pricing.recorded.price())}</span></div> <p class="pricing-note">${escape_html(t.landing.pricing.recorded.note())}</p></div> <div class="pricing-card"><div class="pricing-header"><span class="pricing-label">${escape_html(t.landing.pricing.live.label())}</span> <span class="pricing-price">${escape_html(t.landing.pricing.live.price())}</span></div> <p class="pricing-note">${escape_html(t.landing.pricing.live.note())}</p></div> <div class="pricing-card"><div class="pricing-header"><span class="pricing-label">${escape_html(t.landing.pricing.private.label())}</span> <span class="pricing-price">${escape_html(t.landing.pricing.private.price())}</span></div> <p class="pricing-note">${escape_html(t.landing.pricing.private.note())}</p></div></div> <p class="pricing-guarantee">${escape_html(t.landing.pricing.guarantee())}</p></section>`);
	});
}
//#endregion
//#region src/lib/features/landing/components/FAQSection.svelte
function FAQSection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { items } = $$props;
		const { t } = useI18n();
		$$renderer.push(`<section class="content-section section--faq" aria-label="שאלות נפוצות"><div class="section-header"><span class="section-tag">${escape_html(t.landing.faq.tag())}</span> <h2>${escape_html(t.landing.faq.headline())}</h2></div> <div class="faq-list"><!--[-->`);
		const each_array = ensure_array_like(items);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];
			$$renderer.push(`<details class="faq-item"><summary>${escape_html(item.question)}</summary> <div class="faq-answer"><p>${escape_html(item.answer)}</p></div></details>`);
		}
		$$renderer.push(`<!--]--></div></section>`);
	});
}
//#endregion
//#region src/lib/features/landing/components/CTASection.svelte
function CTASection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { openAuthOverlay } = $$props;
		const { t } = useI18n();
		$$renderer.push(`<section class="content-section section--final-cta" aria-label="התחילי עכשיו"><div class="final-cta-inner"><h2>${escape_html(t.landing.cta.headlineLine1())}<br/>${escape_html(t.landing.cta.headlineLine2())}</h2> <p>${escape_html(t.landing.cta.subheadline())}</p> `);
		Button_1($$renderer, {
			tone: "ink",
			onclick: openAuthOverlay,
			children: ($$renderer) => {
				$$renderer.push(`<!---->${escape_html(t.landing.cta.button())}`);
			},
			$$slots: { default: true }
		});
		$$renderer.push(`<!----> <p class="final-cta-note">${escape_html(t.landing.cta.note())}</p></div></section>`);
	});
}
//#endregion
//#region src/routes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { t } = useI18n();
		let authOpen = false;
		const INSTRUCTOR = {
			name: "[שם המדריכה]",
			years: "X",
			story: "[סיפור אישי קצר — למה התחלת ללמד פילאטיס, מה הוביל אותך לפתוח HomeBody, איך הירושה ממרתה פילאטיס מעצבת את השיטה שלך. 2-3 משפטים אמיתיים.]"
		};
		function openAuthOverlay() {
			authOpen = true;
		}
		const pageUrl = SITE.domain;
		const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		const faqItems = [
			{
				question: "אני מתחילה לגמרי — זה מתאים לי?",
				answer: "לגמרי. יש שיעורי מבוא שמסבירים את הבסיס — איך לנשום, איך להפעיל את ליבת הגוף, איך להתאים כל תרגיל לרמה שלך. אם יש לך מגבלה פיזית ספציפית (דיסק, כתף קפואה, כאבי ברכיים), תמיד אפשר לשאול לפני השיעור איזה תרגילים להימנע מהם."
			},
			{
				question: "האם השיעורים מתאימים לכאבי גב / דיסק / כתף קפואה?",
				answer: `כן — זה בדיוק התמחות שלנו. כל שיעור מלווה בהסברים על איזה תרגיל מתאים לאיזו פתולוגיה, ומה לעשות אם משהו כואב. אנחנו לא עושים "תעשי איתי" בלי הסבר. אם יש לך אבחון רפואי ספציפי, מומלץ לשלוח אותו לפני השיעור הראשון כדי שהמדריכה תוכל להתאים את התוכנית.`
			},
			{
				question: "מה ההבדל בין מקרופלואו למיקרופלואו?",
				answer: "מקרופלואו — סרטוני פילאטיס פלואו שלם בין חצי שעה לשעה. כל סרטון עולה קרדיט אחד ונשאר אצלך לתמיד, גם אחרי שאת כבר לא רשומה. מיקרופלואו — סרטונים קצרים של תרגיל או שניים, מתמקדים על שריר או גיד או פטולוגיה אחת. זמין לכל מי שמשלם מנוי. כשמפסיקים להיות רשומים — אין גישה אליהם יותר."
			},
			{
				question: "איך עובד הלייב? זום? גוגל מיט?",
				answer: "בכלל לא. הכל בפלטפורמה שלנו. נרשמת? את כבר בפנים. בלי להסתבך עם אימייל וקישורים ובלאגן. שיעורים קבוצתיים בלייב — אנחנו רואים אותם, הם רואים אותנו, והמדריכה נותנת תיקונים בזמן אמת. יש גם אפשרות לאחד על אחד."
			},
			{
				question: "איזה ציוד אני צריכה?",
				answer: "רק מזרן. אין צורך בציוד מקצועי או בסטודיו יקר. חלק מהשיעורים משתמשים בחפצים פשוטים מהבית — כרית, מגבת מגולגלת, כדור טניס. כל מה שצריך מופיע בתיאור השיעור לפני שמתחילים."
			},
			{
				question: "איך עובד השיעור הפרטי?",
				answer: "תואמים זמן דרך המערכת, מתחברים בווידאו, והמדריכה בונה שיעור מותאם אישית — על בסיס אבחון קצר שתמלאי לפני השיעור. אחרי השיעור תקבלי תכנית עבודה אישית עם תרגילים לשבוע הקרוב."
			},
			{
				question: "איך נראית הגרפיקה האנטומית בפועל?",
				answer: "בכל שיעור מוקלט מופיעים חצים ותוויות על גבי הסרטון שמראים בדיוק איזו שריר מופעל באותו רגע. אם התרגיל מיועד לדיסק צווארי — תראי בדיוק איזה חלק בגוף עובד ולמה. זה לא אנטומיה גנרית — זה מותאם לתרגיל הספציפי."
			}
		];
		const howToSteps = [
			{
				position: 1,
				name: t.landing.schema.step1Name(),
				text: t.landing.schema.step1Text()
			},
			{
				position: 2,
				name: t.landing.schema.step2Name(),
				text: t.landing.schema.step2Text()
			},
			{
				position: 3,
				name: t.landing.schema.step3Name(),
				text: t.landing.schema.step3Text()
			}
		];
		const jsonLd = schemaGraph(websiteSchema(), organizationSchema(), localBusinessSchema(), offerCatalogSchema(), courseSchema(), faqPageSchema(faqItems), howToSchema(t.landing.schema.howToTitle(), t.landing.schema.howToDescription(), howToSteps), medicalWebPageSchema(t.landing.seo.pageTitle(), SITE.description, pageUrl, today), personSchema(INSTRUCTOR.name, INSTRUCTOR.story, t.landing.instructor.subtitle(), t.landing.schema.instructorMentor()), breadcrumbSchema([{
			name: t.landing.seo.breadcrumbHome(),
			url: SITE.domain
		}]));
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			SEO($$renderer, {
				title: t.landing.seo.pageTitle(),
				description: t.landing.seo.pageDescription(),
				keywords: SITE.keywords,
				ogType: "website",
				canonical: SITE.domain,
				jsonLd,
				breadcrumbs: [{
					name: t.landing.seo.breadcrumbHome(),
					url: SITE.domain
				}]
			});
			$$renderer.push(`<!----> <main class="landing" id="main-content">`);
			HeroSection($$renderer, { openAuthOverlay });
			$$renderer.push(`<!----> `);
			PhilosophySection($$renderer, {});
			$$renderer.push(`<!----> `);
			InstructorSection($$renderer, { instructor: INSTRUCTOR });
			$$renderer.push(`<!----> `);
			PreviewSection($$renderer, {});
			$$renderer.push(`<!----> `);
			PillarsSection($$renderer, {});
			$$renderer.push(`<!----> `);
			StepsSection($$renderer, {});
			$$renderer.push(`<!----> `);
			PricingSection($$renderer, { openAuthOverlay });
			$$renderer.push(`<!----> `);
			FAQSection($$renderer, { items: faqItems });
			$$renderer.push(`<!----> `);
			CTASection($$renderer, { openAuthOverlay });
			$$renderer.push(`<!----></main> `);
			Footer($$renderer, {});
			$$renderer.push(`<!----> `);
			if (Dialog) {
				$$renderer.push("<!--[-->");
				Dialog($$renderer, {
					get open() {
						return authOpen;
					},
					set open($$value) {
						authOpen = $$value;
						$$settled = false;
					},
					children: ($$renderer) => {
						if (Portal) {
							$$renderer.push("<!--[-->");
							Portal($$renderer, {
								children: ($$renderer) => {
									if (Dialog_overlay) {
										$$renderer.push("<!--[-->");
										Dialog_overlay($$renderer, { class: "auth-overlay" });
										$$renderer.push("<!--]-->");
									} else {
										$$renderer.push("<!--[!-->");
										$$renderer.push("<!--]-->");
									}
									$$renderer.push(` `);
									if (Dialog_content) {
										$$renderer.push("<!--[-->");
										Dialog_content($$renderer, {
											class: "auth-card",
											"aria-label": "כניסה והרשמה",
											children: ($$renderer) => {
												AuthPanel($$renderer, {});
											},
											$$slots: { default: true }
										});
										$$renderer.push("<!--]-->");
									} else {
										$$renderer.push("<!--[!-->");
										$$renderer.push("<!--]-->");
									}
								},
								$$slots: { default: true }
							});
							$$renderer.push("<!--]-->");
						} else {
							$$renderer.push("<!--[!-->");
							$$renderer.push("<!--]-->");
						}
					},
					$$slots: { default: true }
				});
				$$renderer.push("<!--]-->");
			} else {
				$$renderer.push("<!--[!-->");
				$$renderer.push("<!--]-->");
			}
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
export { _page as default };
