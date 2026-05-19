import { a as derived } from "./dev.js";
import { i18nObject } from "typesafe-i18n";
import "typesafe-i18n/detectors";
import { initExtendDictionary } from "typesafe-i18n/utils";
//#region src/lib/i18n/generated/formatters.ts
var initFormatters = (locale) => {
	return {};
};
//#endregion
//#region src/lib/i18n/generated/i18n-util.ts
var loadedLocales = {};
var loadedFormatters = {};
initExtendDictionary();
var i18nObject$1 = (locale) => i18nObject(locale, loadedLocales[locale], loadedFormatters[locale]);
//#endregion
//#region src/lib/i18n/generated/i18n-util.sync.ts
var localeTranslations = { he: {
	site: {
		name: "HomeBody",
		tagline: "פילאטיס בבית",
		description: "פילאטיס אונליין בעברית, חי ומוקלט, בלי רעש. שיעורי פילאטיס שיקומי לגוף אמיתי."
	},
	nav: {
		login: "כניסה",
		logout: "יציאה",
		dashboard: "אזור אישי",
		backHome: "לעמוד הראשי",
		onboarding: "התאמה אישית"
	},
	route: {
		dashboard: "/אזור-אישי",
		customerCalendar: "/לוח",
		customerOneOnOne: "/אחד-על-אחד",
		customerVideos: "/וידאו",
		watch: "/צפייה",
		profile: "/פרופיל",
		onboarding: "/התאמה",
		liveRoom: "/חדר-לייב",
		studioLive: "/סטודיו/לייב",
		studioVideos: "/סטודיו/וידאו"
	},
	landing: {
		hero: {
			eyebrow: "פילאטיס שיקומי אונליין — לגוף אמיתי עם כאבים אמיתיים",
			headline: "שיעורי פילאטיס שלא מבקשים ממך גוף מושלם.",
			lead: "פילאטיס אונליין בעברית, מותאם לגוף עם כאבים, מגבלות ורצון לחזור לתנועה. בלי לנהוג לשם, בלי לבוש מיוחד, בלי רשימת המתנה — רק את, המזרן, והמדריכה שרואה אותך.",
			ctaPrimary: "שיעור ראשון בחינם",
			ctaSecondary: "מי כאן מלמדת"
		},
		instructor: {
			tag: "המדריכה",
			subtitle: "מדריכת פילאטיס שיקומי מוסמכת",
			lead: "למדתי אצל מרתה פילאטיס. לא כקו ציור בקורס אונליין — אלא שיטה קלאסית שלמה, עם ירושה ישירה של התרגילים, הסדר והפילוסופיה המקורית.",
			body: "{years} שנות ניסיון בהוראת פילאטיס, עם התמחות עמוקה בפתולוגיות של מערכת התנועה — דיסקים, כתפיים קפואות, כאבי גב כרוניים, שיקום אחרי ניתוח. לא \"תעשי איתי\" מיוטיוב. אלא הבנה אנטומית מדויקת של הגוף שלך, ולמה כל תרגיל עוזר — או מזיק — למצב הספציפי שלך.",
			cred1: "הסמכה מבית מרתה פילאטיס",
			cred2: "התמחות בפתולוגיות ושיקום",
			cred3: "{years} שנות ניסיון בהוראה",
			photoPlaceholder: "[תמונת המדריכה]"
		},
		preview: {
			tag: "מה שבפנים",
			headline: "ככה נראה שיעור אמיתי",
			videoPlaceholderTitle: "[כאן יופיע screenshot או סרטון קצר]",
			videoPlaceholderSubtitle: "שיעור מוקלט עם חץ על השריר המופעל + הסבר על הקשר לפתולוגיה",
			caption: "דוגמה מהקטלוג — \"פלקסיות ירך לדיסק צווארי\"",
			feature1Title: "חץ על כל שריר",
			feature1Desc: "רואים בדיוק מה מופעל ברגע הזה — בלי לנחש.",
			feature2Title: "הסבר לפתולוגיה שלך",
			feature2Desc: "לא אנטומיה גנרית — התאמה לתרגיל הספציפי שאת עושה עכשיו.",
			feature3Title: "קצב שלך",
			feature3Desc: "עוצרים, חוזרים אחורה, בוחרים אורך — 15, 30 או 45 דקות."
		},
		pillars: {
			tag: "השירותים",
			headline: "שלוש דרכים לזוז",
			recordedTitle: "מוקלטים",
			recordedLead: "15, 30, 45 דקות. לפי הקצב שלך.",
			recordedBody: "מאות שיעורים בכל רמה — מבוא, מתקדם, פתולוגיה ספציפית. עם גרפיקת פטולוגיה שמסבירה בדיוק איזה שריר מופעל ואיך זה עוזר לגוף שלך. אין לוח זמנים נוקשה. אין אשמה על פספוס.",
			liveTitle: "חיים",
			liveLead: "עד 12 משתתפות. תיקון אישי בזמן אמת.",
			liveBody: "שיעורים חיים בקבוצות קטנות בזום. המדריכה רואה את כולן, נותנת הוראות ספציפיות לכל אחת, ויוצרת תחושת סטודיו — רק מהספה. קהילה ישראלית אמיתית של נשים שמבינות מה כאבי גב אומרים.",
			privateTitle: "פרטי",
			privateLead: "אחד על אחד. התאמה מלאה.",
			privateBody: "שיעור פרטי אונליין עם התאמה מלאה לגוף שלך, לכאבים שלך, למטרות שלך. אבחון מקדים, שיעור מותאם, ותכנית עבודה אישית לשבוע הקרוב."
		},
		steps: {
			tag: "איך מתחילים",
			headline: "שלוש צעדים ואת בתוכנית",
			step1Title: "פותחים חשבון בחינם",
			step1Desc: "מלאי אימייל ותקבלי קוד כניסה במייל. בלי כרטיס אשראי, בלי התחייבות, בלי סיסמאות לזכור.",
			step2Title: "בוחרים שיעור ראשון",
			step2Desc: "לפי הרמה שלך, הכאבים או המטרות — או פשוט שואלים את המדריכה המלצה. יש שיעורי מבוא של 15 דקות לכל מי שמתחילה.",
			step3Title: "לוחצים play ומתחילות",
			step3Desc: "השיעור מתחיל מיד, מהספה, בקצב שלך. עם חצים על השרירים והסברים שאומרים בדיוק מה לעשות ולמה."
		},
		pricing: {
			tag: "מחירים",
			headline: "בלי הפתעות. בלי אותיות קטנות.",
			guarantee: "אפשר לבטל בכל רגע. אין חיובים נסתרים. אין התחייבות לתקופה קבועה.",
			ctaButton: "לשיעור הראשון",
			trial: {
				label: "שיעור ראשון",
				price: "חינם",
				note: "בלי כרטיס אשראי, בלי התחייבות"
			},
			recorded: {
				label: "מנוי שיעורים מוקלטים",
				price: "מ־[X] ₪/חודש",
				note: "גישה לכל הקטלוג"
			},
			live: {
				label: "מנוי לייב + מוקלטים",
				price: "מ־[Y] ₪/חודש",
				note: "שיעורים חיים בקבוצה + מאגר מוקלט"
			},
			private: {
				label: "שיעור פרטי",
				price: "[Z] ₪/שיעור",
				note: "אחד על אחד, התאמה מלאה"
			}
		},
		faq: {
			tag: "שאלות",
			headline: "מה עוד כדאי לדעת"
		},
		cta: {
			headlineLine1: "הגוף שלך כבר יודע איך לזוז.",
			headlineLine2: "צריך רק מישהי שתראה אותו.",
			subheadline: "השיעור הראשון בחינם. בלי כרטיס אשראי. בלי סיפורים.",
			button: "תני לי את השיעור הראשון",
			note: "HomeBody — פילאטיס שיקומי אונליין, בעברית, עם קהילה."
		},
		seo: {
			pageTitle: "פילאטיס שיקומי אונליין — שיעורים לגוף עם כאבים ומגבלות",
			pageDescription: "פילאטיס אונליין בעברית עם התמחות בכאבי גב, דיסק, כתף קפואה ומגבלות תנועה. שיעורים חיים, מוקלטים ופרטיים — עם גרפיקת פטולוגיה שמלמדת אותך בדיוק מה כל תרגיל עושה.",
			breadcrumbHome: "דף הבית"
		},
		schema: {
			howToTitle: "איך מתחילים עם HomeBody",
			howToDescription: "שלושה צעדים פשוטים להתחיל שיעורי פילאטיס שיקומי אונליין",
			step1Name: "פותחים חשבון בחינם",
			step1Text: "מלאי אימייל ותקבלי קוד כניסה במייל. בלי כרטיס אשראי, בלי התחייבות, בלי סיסמאות לזכור.",
			step2Name: "בוחרים שיעור ראשון",
			step2Text: "לפי הרמה שלך, הכאבים או המטרות — או פשוט שואלים את המדריכה המלצה. יש שיעורי מבוא של 15 דקות לכל מי שמתחילה.",
			step3Name: "לוחצים play ומתחילות",
			step3Text: "השיעור מתחיל מיד, מהספה, בקצב שלך. עם חצים על השרירים והסברים שאומרים בדיוק מה לעשות ולמה.",
			instructorMentor: "מרתה פילאטיס"
		}
	},
	auth: {
		title: "גישה לחברים",
		emailStepTitle: "כניסה או הרשמה",
		codeStepTitle: "בדקי את האימייל",
		emailLabel: "אימייל",
		codeLabel: "קוד חד־פעמי",
		submitSendCode: "שלחו לי קוד",
		submitSendLink: "שלחו לי לינק",
		submitEnter: "להיכנס",
		pending: "רגע...",
		pendingSendCode: "שולחים...",
		pendingSendLink: "שולחים...",
		pendingVerify: "בודקים...",
		statusCodeSent: "שלחנו קוד כניסה לאימייל שלך. בדקי גם בתיקיית הספאם.",
		statusLinkSent: "שלחנו לינק כניסה לאימייל שלך. בדקי גם בתיקיית הספאם.",
		statusError: "לא הצלחנו להתחבר כרגע. נסי שוב בעוד רגע.",
		statusSendError: "לא הצלחנו לשלוח כרגע. נסי שוב בעוד רגע.",
		statusCodeError: "הקוד שגוי או פג תוקף. נסי שוב.",
		switchEmail: "להשתמש באימייל אחר",
		intro: "מכניסים כתובת אימייל ומקבלים קוד חד־פעמי. אין צורך בסיסמה.",
		emailStepIntro: "מכניסים כתובת אימייל ובוחרים איך להיכנס. אין צורך בסיסמה.",
		codeStepIntro: "שלחנו קוד חד־פעמי לכתובת {email}",
		linkStepIntro: "שלחנו לינק כניסה לכתובת {email}",
		linkSentText: "לחצי על הלינק במייל כדי להתחבר ישירות — בלי להזין קוד.",
		openEmailApp: "פתיחת אפליקציית המייל",
		enterCodeManually: "הזנת קוד ידנית",
		validation: { emailRequired: "נא להזין כתובת אימייל" },
		loggedIn: {
			kicker: "מחוברת ✦",
			title: "החשבון פתוח",
			subtitle: "אפשר להמשיך לאזור האישי או לצאת.",
			cta: "לאזור האישי",
			signOut: "יציאה"
		},
		loading: "בודקים חשבון..."
	},
	onboarding: {
		step: "שלב",
		stepCount: "מתוך 4",
		stepLabels: {
			experience: "ניסיון",
			equipment: "ציוד",
			goals: "מטרות",
			notes: "סיום"
		},
		experience: {
			title: "כמה ניסיון יש לך?",
			subtitle: "אין תשובה לא נכונה. נתחיל ממשהו פשוט.",
			newTitle: "חדשה לגמרי",
			newDesc: "מעולם לא עשיתי פילאטיס, או שזה נשמע לי כמו שפה זרה",
			someTitle: "קצת ניסיון",
			someDesc: "עשיתי כמה שיעורים פה ושם, אני מכירה את הבסיס",
			steadyTitle: "מתרגלת קבועה",
			steadyDesc: "פילאטיס הוא חלק משגרת השבוע שלי"
		},
		equipment: {
			title: "מה יש לך בבית?",
			subtitle: "נתאים שיעורים לפי מה שיש לך זמין.",
			emptyWarning: "בחרי לפחות פריט אחד כדי שנוכל להתאים שיעורים."
		},
		goals: {
			title: "מה המטרות שלך?",
			subtitle: "אפשר לבחור כמה — זו לא התחייבות.",
			emptyWarning: "בחרי לפחות מטרה אחת כדי שנוכל להתאים שיעורים."
		},
		notes: {
			title: "משהו שחשוב שנדע?",
			subtitle: "אופציונלי. המדריכה תראה את זה לפני השיעור הראשון.",
			placeholder: "למשל: כאב גב תחתון, אחרי ניתוח קיסרי, מגבלות ברך..."
		},
		summary: {
			title: "סיכום ההתאמה",
			boxTitle: "סיכום",
			experience: "ניסיון",
			equipment: "ציוד",
			goals: "מטרות"
		},
		nav: {
			back: "← חזרה",
			next: "המשך →",
			submit: "לשמור ולהתחיל ✦",
			submitEdit: "שמור שינויים ✦",
			submitPending: "שומרים..."
		},
		success: {
			title: "ההתאמה נשמרה",
			subtitle: "מעבירים אותך לאזור האישי...",
			loading: "מעבירים אותך לאזור האישי...",
			editTitle: "הפרופיל עודכן",
			editSubtitle: "מעבירים אותך חזרה..."
		},
		locked: {
			title: "צריך להתחבר קודם",
			subtitle: "כדי להתחיל את ההתאמה האישית, נכנסים עם כתובת אימייל.",
			cta: "לעמוד הראשי"
		},
		saveError: "לא הצלחנו לשמור כרגע. נסי שוב.",
		error: "לא הצלחנו לטעון אונבורדינג."
	},
	dashboard: {
		title: "האזור האישי",
		titleStaff: "סטודיו",
		kicker: "HomeBody",
		description: {
			staff: "אזור הניהול שלך. כאן מופיעים הלייבים, הוידאו והסטטיסטיקות.",
			customer: "האזור האישי שלך מוכן. כאן יופיעו השיעורים, הלייבים והקרדיטים שלך."
		},
		nav: {
			overview: "סקירה",
			profile: "פרופיל פילאטיס",
			video: "וידאו",
			lives: "לייבים",
			subscription: "מנוי",
			comingSoon: "בקרוב"
		},
		welcome: {
			title: "ברוכה הבאה",
			subtitle: "האזור האישי שלך מוכן. כאן יופיעו השיעורים, הלייבים והקרדיטים שלך."
		},
		profile: {
			equipment: "ציוד",
			experience: "ניסיון",
			goals: "מטרות",
			notes: "הערות",
			notesEmpty: "אין",
			edit: "ערוך"
		},
		liveAlert: { title: "לייב פתוח עכשיו" },
		staffProfile: {
			title: "פרופיל מדריכה",
			name: "שם",
			credentials: "הכשרות וביטוח",
			certificate: "תעודת הכשרה",
			insurance: "ביטוח אחריות"
		},
		customerProfile: { title: "פרופיל פילאטיס" },
		actions: {
			studioLive: {
				title: "סטודיו לייב",
				desc: "תזמון שיעורים, פתיחת חדר, ניהול משתתפות"
			},
			videos: {
				title: "ניהול וידאו",
				desc: "העלאת שיעורים, פרסום, ארכיון"
			},
			calendar: {
				title: "לוח לייבים",
				desc: "צפייה בכל השיעורים הקרובים"
			}
		},
		empty: {
			title: "התוכן שלך",
			staff: "אין עדיין שיעורים פעילים. השתמשי בסטודיו כדי ליצור את הלייב הראשון.",
			customer: "אין עדיין שיעורים פעילים. ברגע שתרשמי למנוי או תשתמשי בקרדיט, הכל יופיע כאן."
		}
	},
	calendar: {
		title: "לוח לייבים",
		kicker: "HomeBody Live",
		description: "הרשמה לשיעור אפשרית רק כשיש קרדיטים פנויים בתוכנית. מקום נשמר ברגע שההרשמה מצליחה.",
		today: "היום",
		studio: "סטודיו לייב",
		daySelect: "בחירת יום",
		error: {
			reserve: "לא הצלחנו לשמור מקום.",
			cancel: "לא הצלחנו לבטל הרשמה."
		},
		empty: {
			kicker: "אין שיעורים ביום הזה",
			text: "נסי יום אחר בלוח. כשיעלו לייבים חדשים הם יופיעו כאן."
		},
		class: {
			join: "להיכנס ללייב",
			manage: "לניהול בסטודיו",
			cancel: "לבטל הרשמה",
			reserve: "לשמור מקום",
			seats: "{remaining} מקומות פנויים מתוך {capacity}",
			missingEquipment: "חסר בפרופיל שלך: {items}. אפשר לעדכן ציוד בפרופיל פילאטיס."
		},
		status: {
			upcoming: "בקרוב",
			live: "חי עכשיו",
			ended: "הסתיים",
			cancelled: "בוטל",
			reserved: "שמורה לך",
			manageLive: "ניהול לייב",
			studioClass: "שיעור סטודיו",
			nowLive: "עכשיו בלייב",
			full: "מלא",
			missingEquipmentShort: "חסר ציוד",
			notEnoughCredits: "אין מספיק קרדיטים",
			open: "פתוח להרשמה"
		}
	},
	live: {
		preConnect: {
			checking: "בודקים הרשאה ללייב...",
			lockedTitle: "צריך להתחבר כדי להיכנס ללייב",
			lockedCta: "כניסה",
			missingTitle: "לא נבחר שיעור לייב",
			missingCta: "חזרה ללוח",
			errorTitle: "הכניסה ללייב נחסמה",
			retry: "לנסות שוב",
			backCalendar: "חזרה ללוח",
			backStudio: "חזרה ללייב",
			title: "הכנה לשיעור",
			kicker: "HomeBody Live",
			requesting: "מבקשים גישה למכשירים...",
			enterNoDevices: "כניסה לשיעור",
			retryDevices: "לנסות שוב",
			cameraConnected: "המיקרופון מחובר",
			noCamera: "לא התקבלה מצלמה מהדפדפן.",
			retryCamera: "לנסות למצוא מצלמה",
			cameraLabel: "מצלמה",
			micLabel: "מיקרופון",
			audioLevel: "רמת שמע",
			enterRoom: "כניסה לשיעור",
			enterWithoutDevices: "כניסה בלי מצלמה ומיקרופון",
			startDevices: "הפעל מצלמה ומיקרופון",
			devicesHint: "מצלמה ומיקרופון אופציונליים — אפשר להיכנס גם בלי",
			refreshCamera: "רענון מצלמה",
			enterWithoutCamera: "היכנס ללייב ללא מכשירים",
			cameraNotAllowed: "הדפדפן חסם גישה למצלמה.",
			cameraNotFound: "לא זוהתה מצלמה.",
			cameraNotReadable: "המצלמה תפוסה או לא זמינה כרגע.",
			cameraAborted: "בקשת המצלמה בוטלה.",
			cameraGeneric: "לא הצלחנו לגשת למצלמה.",
			micNotAllowed: "הדפדפן חסם גישה למיקרופון.",
			micNotFound: "לא זוהה מיקרופון.",
			micNotReadable: "המיקרופון תפוס או לא זמין כרגע.",
			micAborted: "בקשת המיקרופון בוטלה.",
			micGeneric: "לא הצלחנו לגשת למיקרופון.",
			noCameraOrMic: "לא זוהתה מצלמה או מיקרופון. אפשר להיכנס ללייב ללא וידאו.",
			noDevicesAccess: "לא הצלחנו לגשת למכשירים."
		},
		room: {
			connected: "מחובר",
			reconnecting: "מתחבר מחדש",
			connecting: "מתחבר",
			disconnected: "מנותק",
			participants: "משתתפים",
			participantsTitle: "משתתפות",
			hideParticipants: "הסתר משתתפים",
			showParticipants: "הצג משתתפים",
			instructor: "מדריכה",
			you: "את",
			screenShare: "שיתוף מסך",
			noVideo: "אין וידאו",
			waitingForInstructor: "מחכים שהמדריכה תתחבר...",
			waitingForOthers: "מחכים למשתתפים נוספים...",
			waitingForCameras: "מחכים למצלמות...",
			fallbackName: "HomeBody",
			tokenError: "לא הצלחנו לפתוח את חדר הלייב.",
			screenShareError: "לא הצלחנו לשתף מסך.",
			back: "חזרה",
			close: "סגור",
			leave: "לצאת",
			micOn: "מיקרופון פעיל",
			micOff: "מיקרופון כבוי",
			cameraOn: "מצלמה פעילה",
			cameraOff: "מצלמה כבויה"
		},
		controls: {
			mic: "מיקרופון",
			camera: "מצלמה",
			screen: "שיתוף מסך",
			leave: "יציאה",
			quality: "איכות",
			muteMic: "לכבות מיקרופון",
			unmuteMic: "להדליק מיקרופון",
			stopCamera: "לכבות מצלמה",
			startCamera: "להדליק מצלמה",
			stopScreen: "לעצור שיתוף מסך",
			startScreen: "שיתוף מסך",
			micOnLabel: "מיקרופון",
			micOffLabel: "כבוי",
			cameraOnLabel: "מצלמה",
			cameraOffLabel: "כבויה",
			screenOnLabel: "שיתוף",
			screenOffLabel: "מסך"
		},
		stats: {
			title: "נתוני שידור",
			bitrate: "קצב",
			resolution: "רזולוציה",
			fps: "FPS",
			packetLoss: "אובדן",
			tracks: "מסלולים",
			participants: "משתתפות",
			video: "וידאו",
			audio: "אודיו",
			sourceScreen: "שיתוף",
			sourceCamera: "מצלמה",
			sourceUnknown: "?",
			videoSources: "מקורות וידאו"
		}
	},
	videos: {
		title: "שיעורים מוקלטים",
		empty: "אין סרטונים זמינים כרגע.",
		loading: "טוען סרטונים...",
		error: "לא הצלחנו לטעון את הסרטונים."
	},
	watch: {
		back: "חזרה לסרטונים",
		loading: "טוען נגן..."
	},
	profile: {
		title: "פרופיל פילאטיס",
		edit: "עריכה",
		save: "שמירה",
		cancel: "ביטול",
		loading: "טוען פרופיל...",
		error: "לא הצלחנו לטעון את הפרופיל."
	},
	app: {
		loading: "טוען אזור אישי...",
		error: "לא הצלחנו לטעון את החשבון.",
		errorRetry: "לנסות שוב",
		locked: {
			title: "צריך להתחבר",
			subtitle: "החשבון נעול. נכנסים מחדש דרך העמוד הראשי.",
			cta: "כניסה"
		},
		needsOnboarding: {
			title: "כמעט שם",
			subtitle: "צריך לסיים התאמה אישית קצרה לפני שמתחילים.",
			cta: "להמשיך בהתאמה"
		}
	},
	studio: {
		live: {
			title: "סטודיו לייב",
			create: "+ צור לייב"
		},
		videos: {
			title: "ניהול סרטונים",
			upload: "העלאת סרטון"
		}
	},
	misc: {
		close: "סגירה",
		and: "ו",
		or: "או",
		loading: "טוען...",
		charCount: "{count}/600"
	}
} };
var loadLocale = (locale) => {
	if (loadedLocales[locale]) return;
	loadedLocales[locale] = localeTranslations[locale];
	loadFormatters(locale);
};
var loadFormatters = (locale) => void (loadedFormatters[locale] = initFormatters(locale));
//#endregion
//#region src/lib/i18n/runes.svelte.ts
loadLocale("he");
var I18nRune = class {
	locale = "he";
	#_LL = derived(() => i18nObject$1(this.locale));
	get _LL() {
		return this.#_LL();
	}
	set _LL($$value) {
		return this.#_LL($$value);
	}
	get t() {
		return this._LL;
	}
	/** Switch locale at runtime */
	setLocale(locale) {
		loadLocale(locale);
		this.locale = locale;
	}
};
var globalI18n = new I18nRune();
/** Returns the global i18n rune instance. Safe to call anywhere in Svelte components. */
function useI18n() {
	return globalI18n;
}
//#endregion
export { useI18n as t };
