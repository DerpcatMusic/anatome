import { o as derived } from "./dev.js";
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
			eyebrow: "פילאטיס שיקומי — לא סרטוני יוטיוב גנריים",
			headline: "אם אתם מחפשים אימון גנרי — זה לא המקום.",
			lead: "אנחנו מתמחים בפטולוגיות. משתמשים בדרך של יוסף פילאטיס כדי לתקן. פילאטיס שיקומי עם המאפיינים ממרתה פילאטיס. לגוף אמיתי עם כאבים אמיתיים.",
			ctaPrimary: "השיעור הראשון בחינם — בלי סיפורים",
			ctaSecondary: "מי כאן מלמדת"
		},
		philosophy: {
			tag: "תקשיבו טוב",
			headline: "אנחנו לא מוכרים לכם סרטוני יוטיוב.",
			body: "אם אתם מחפשים אימון גנרי — זה פשוט לא המקום. אנחנו מתמחים בפטולוגיות. משתמשים בדרך של יוסף פילאטיס כדי לתקן. פילאטיס שיקומי עם המאפיינים ממרתה פילאטיס. זו שיטה קלאסית שלמה — לא קו ציור בקורס אונליין."
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
			tag: "מה יש לנו",
			headline: "שלוש דרכים לטפל בגוף שלך",
			macroTitle: "מקרופלואו",
			macroLead: "סרטוני פילאטיס של חצי שעה עד שעה. שלכם לתמיד.",
			macroBody: "כל סרטון עולה קרדיט אחד ונשאר אצלכם תמיד — גם אחרי שאתם כבר לא רשומים. כל עוד שילמתם עליו, הוא שלכם. זה פילאטיס פלואו שלם, לא קטעים פרודים.",
			microTitle: "מיקרופלואו",
			microLead: "סרטונים קצרים של תרגיל או שניים. לכל הרשומים.",
			microBody: "כל סרטון מתמקד על שריר או גיד או פטולוגיה אחת. זמין לכל מי שמשלם מנוי. כשמפסיקים להיות רשומים — אין גישה אליהם יותר. רק לסרטונים ששילמתם עליהם בקרדיטים.",
			liveTitle: "לייב אמיתי",
			liveLead: "אחד על אחד. קבוצתי. תיקונים בלייב.",
			liveBody: "יחס אישי אמיתי. שיעורים קבוצתיים בלייב — אנחנו רואים אותם, הם רואים אותנו. תיקונים בזמן אמת. בלי קישורים לזום או גוגל מיט. הכל בפלטפורמה שלנו. נרשמתם? אתם כבר בפנים."
		},
		steps: {
			tag: "איך זה עובד",
			headline: "בלי אימיילים. בלי קישורים. בלי בלאגן.",
			step1Title: "נרשמים",
			step1Desc: "נכנסים לפלטפורמה. בלי קישורים לזום, בלי גוגל מיט, בלי בלאגן. נרשמתם? אתם כבר בפנים.",
			step2Title: "מתאימים אישית",
			step2Desc: "אונבורדינג שמתאים את הצרכים שלכם עם דגשים אישיים. אנחנו לומדים את הגוף שלכם לפני שמתחילים.",
			step3Title: "מתחילים לזוז",
			step3Desc: "בוחרים בין מקרופלואו, מיקרופלואו, או שיעור לייב אחד על אחד. ומתחילים."
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
				label: "מנוי וידאו + לייב קבוצתי",
				price: "מ־[X] ₪/חודש",
				note: "מקרופלואו, מיקרופלואו, ולייבים קבוצתיים"
			},
			live: {
				label: "מנוי מלא + אחד על אחד",
				price: "מ־[Y] ₪/חודש",
				note: "הכל כלול: אחד על אחד, קבוצתי, מקרו ומיקרו"
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
			headlineLine2: "צריך רק מישהי שתראה אותו — באמת.",
			subheadline: "השיעור הראשון בחינם. בלי כרטיס אשראי. בלי סיפורים.",
			button: "תנו לי את השיעור הראשון",
			note: "HomeBody — פילאטיס שיקומי אונליין. לא סרטוני יוטיוב."
		},
		seo: {
			pageTitle: "פילאטיס שיקומי אונליין — לא סרטוני יוטיוב גנריים",
			pageDescription: "פילאטיס שיקומי אונליין בעברית עם התמחות בפתולוגיות. שיטת יוסף פילאטיס עם המאפיינים ממרתה פילאטיס. מקרופלואו, מיקרופלואו, לייב אחד על אחד וקבוצתי — הכל בפלטפורמה אחת.",
			breadcrumbHome: "דף הבית"
		},
		schema: {
			howToTitle: "איך מתחילים עם HomeBody",
			howToDescription: "שלושה צעדים פשוטים להתחיל שיעורי פילאטיס שיקומי אונליין",
			step1Name: "נרשמים",
			step1Text: "נכנסים לפלטפורמה. בלי קישורים לזום, בלי גוגל מיט, בלי בלאגן. נרשמתם? אתם כבר בפנים.",
			step2Name: "מתאימים אישית",
			step2Text: "אונבורדינג שמתאים את הצרכים שלכם עם דגשים אישיים. אנחנו לומדים את הגוף שלכם לפני שמתחילים.",
			step3Name: "מתחילים לזוז",
			step3Text: "בוחרים בין מקרופלואו, מיקרופלואו, או שיעור לייב אחד על אחד. ומתחילים.",
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
			joinWalkIn: "להיכנס ללייב (צריכה נקודה)",
			walkInWarning: "הצטרפות ללא הזמנה מראש תצרוך נקודה אחת מידית.",
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
			noDevicesAccess: "לא הצלחנו לגשת למכשירים.",
			prepNotice: "השיעור עדיין לא התחיל. אפשר להכין את המכשירים ולהתחיל את הלייב כשתהיי מוכנה.",
			startLive: "התחלת לייב",
			resolutionLabel: "רזולוציה",
			codecLabel: "קודק",
			bitrateLabel: "ביטרייט",
			framerateLabel: "פריימים",
			audioLabel: "אודיו",
			priorityLabel: "עדיפות",
			simulcastLabel: "איכות אדפטיבית לצופות",
			stereoLabel: "אודיו סטריאו",
			qualityTitle: "איכות שידור",
			devicesCheckTitle: "בדיקת מכשירים"
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
			startLiveError: "לא הצלחנו להתחיל את הלייב.",
			screenShareError: "לא הצלחנו לשתף מסך.",
			back: "חזרה",
			close: "סגור",
			leave: "לצאת",
			chatTitle: "צ'אט",
			chatPlaceholder: "הודעה",
			chatSend: "שלחי",
			chatEmpty: "אין הודעות עדיין",
			newMessages: "הודעות חדשות",
			hideChat: "הסתר צ'אט",
			showChat: "הצג צ'אט",
			settingsTitle: "הגדרות חדר",
			echoCancel: "ביטול הד ורעש",
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
