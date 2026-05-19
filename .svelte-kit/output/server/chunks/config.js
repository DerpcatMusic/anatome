//#region src/lib/seo/config.ts
/**
* Site-wide SEO configuration.
* Update `domain` when deploying to production.
*/
var SITE = {
	domain: "https://homebody.fitness",
	name: "HomeBody",
	nameHebrew: "הומבודי",
	tagline: "פילאטיס שיקומי בבית",
	description: "פילאטיס אונליין בעברית — שיעורים חיים, מוקלטים ופרטיים. התמחות בפטולוגיות ופילאטיס שיקומי. למדתי אצל מרתה פילאטיס.",
	keywords: [
		"פילאטיס אונליין",
		"שיעורי פילאטיס אונליין",
		"פילאטיס שיקומי",
		"פילאטיס לכאבי גב",
		"פילאטיס בבית",
		"פילאטיס בעברית",
		"שיעורים חיים פילאטיס",
		"פילאטיס פרטי אונליין",
		"פילאטיס לדיסק",
		"פילאטיס לכתף קפואה",
		"פילאטיס לברכיים",
		"פילאטיס אחרי ניתוח",
		"פילאטיס רפואי",
		"פילאטיס קליני",
		"פילאטיס עם מגבלות",
		"פילאטיס לנשים",
		"שיעור פילאטיס בזום",
		"Pilates online Israel",
		"Online pilates Hebrew",
		"Rehabilitative pilates online",
		"מרתה פילאטיס",
		"פילאטיס קלאסי"
	].join(", "),
	locale: "he_IL",
	lang: "he",
	dir: "rtl",
	themeColor: "#faf8f3",
	ogImage: "/og-image.jpg",
	twitterHandle: "@homebodypilates",
	founded: "2024",
	phone: "+972-50-000-0000",
	email: "hello@homebody.fitness",
	address: {
		street: "",
		city: "תל אביב",
		region: "IL",
		postalCode: "",
		country: "IL"
	},
	geo: {
		latitude: "32.0853",
		longitude: "34.7818"
	},
	social: {
		instagram: "https://instagram.com/homebodypilates",
		facebook: "https://facebook.com/homebodypilates",
		youtube: "https://youtube.com/@homebodypilates",
		whatsapp: "https://wa.me/972500000000"
	},
	priceRange: "₪₪",
	openingHours: [{
		dayOfWeek: [
			"Sunday",
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday"
		],
		opens: "06:00",
		closes: "22:00"
	}, {
		dayOfWeek: ["Friday"],
		opens: "06:00",
		closes: "14:00"
	}]
};
//#endregion
export { SITE as t };
