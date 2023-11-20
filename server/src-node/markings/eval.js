const _ = require('underscore')
const {stripUrls, splitChars} = require('../helpers.js')




/*
	@returns a number between 0 and 1.

	"Ein exzessiver Gebrauch von Ausrufezeichen, Sonderzeichen, Smilies, Emojis, Großschreibung, Kapitälchen usw. kann ein starker Indiz für problematischen Inhalt sein. Hierbei wird das Verhältnis von diesen Zeichen zu “normalen” Textzeichen untersucht und mit Normwerten verglichen."

	Scoring here works in that we look at different classes of characters for which we defined thresholds of what is normal. Also, first we filter out URLs because they can contain weird characters and don't really count as text.
*/
async function evalExcessiveMarkings(context, text, {stems}) {
	const start = new Date().getTime()

	const metrics = evalExcessiveMarkingsMetrics(text)
	const allEvaluations = {
		'Excessive uppercase': evalExcessiveMarkingsUppercase(metrics),
		'Excessive markings': evalExcessiveMarkingsExclamationQuestionMarks(metrics),
		'Excessive emojis': evalExcessiveMarkingsEmojis(text),
		'Lack of normal characters': evalExcessiveMarkingsNormals(text),
	}
	let allDetails = {}
	let maxRating = 0.0
	for (const key in allEvaluations) {
		allDetails = {
			...allDetails,
			...allEvaluations[key].details,
		}
		maxRating = Math.max(maxRating, allEvaluations[key].rating)
	}
	return {
		rating: maxRating,
		details: allDetails,
		time: (new Date().getTime() - start) / 1000,
	}
}




function evalExcessiveMarkingsMetrics(text) {
	const metrics = {
		text,
		textClean: stripUrls(text),
		characters: 0,
		lowercase: 0,
		uppercase: 0,
		urls: 0,
		digits: 0,
		emojis: 0,
		punctuation: 0,
		other: 0,
	}

	const chars = [...metrics.textClean]  // this is the best way to split a string into its characters, it preserves emojis as well, see https://stackoverflow.com/questions/35223206/how-to-split-unicode-string-to-characters-in-javascript
	for (const ch of chars) {
		metrics.characters += 1
		if ('abcdefghijklmnopqrstuvwxyzäüöß'.indexOf(ch) !== -1) {
			metrics.lowercase += 1
		}
		else if ('ABCDEFGHIJKLMNOPQRSTUVWXYZÄÜÖ'.indexOf(ch) !== -1) {
			metrics.uppercase += 1
		}
		else if ('0123456789'.indexOf(ch) !== -1) {
			metrics.digits += 1
		}
		else if (' ,.-!?-/":;()„“\'\n'.indexOf(ch) !== -1) {
			metrics.punctuation += 1
		}
		// detect emojis, see https://stackoverflow.com/questions/18862256/how-to-detect-emoji-using-javascript
		else if (/\p{Extended_Pictographic}/u.test(ch)) {
			metrics.emojis += 1
		}
		else {
			metrics.other += 1
		}
	}

	return metrics
}




function evalExcessiveMarkingsUppercase(metrics) {
	if (metrics.lowercase + metrics.uppercase === 0) {
		return {
			rating: 0.0,
			details: {}
		}
	}

	// Rate amount of uppercase characters
	// In the test dataset it was  bottom 10% = 0.06,  median = 0.08,  top 10% = 0.11
	// <0.1 => 0
	// 0.12 => 0.1 (roughly)
	// 0.40 => 0.8 (roughly)
	// 1.00 => 1.0
	let rating = 0
	const ratioUppercase = metrics.uppercase / (metrics.lowercase + metrics.uppercase)
	if (metrics.uppercase>0 && (metrics.uppercase + metrics.lowercase)>5) {
		const threshold_0 = 0.20
		const threshold_1 = 0.5
		rating = Math.max(0, Math.min(1.0, (ratioUppercase - threshold_0) / (threshold_1 - threshold_0)))  // linear interpoleration
	}
	return {
		rating,
		details: {
			uppercase: metrics.uppercase,
			lowercase: metrics.lowercase,
			ratio: ratioUppercase,
		}
	}
}




function evalExcessiveMarkingsExclamationQuestionMarks(metrics) {
	// two consecutive question marks or exclamation marks => 0.3 more than two consecutive => 0.6

	const matches = metrics.textClean.match(/([\!\?]+)/g) ?? []
	const longestMatch = matches.reduce((a, b) => a.length>b.length? a : b, '')
	const len = longestMatch.length

	if (len <= 1) {
		return {
			rating: 0.0,
			details: {
			}
		}
	}
	else {
		const rating = Math.min(1, len / 4)
		return {
			rating,
			details: {
				excessiveMarks: longestMatch,
			}
		}
	}
}




function evalExcessiveMarkingsEmojis(text) {
	const cleanText = stripUrls(text)
	const chars = splitChars(cleanText)
	const matches = cleanText.match(/\p{Extended_Pictographic}/ug)
	const emojiCount = matches? matches.length : 0

	let rating
	if (emojiCount === 0) {
		rating = 0
	}
	else if (emojiCount / chars.length < 0.15) {
		rating = 0.3
	}
	else if (emojiCount / chars.length < 0.3) {
		rating = 0.6
	}
	else {
		rating = 1
	}

	return {
		rating,
		details: {
			emojiCount: emojiCount,
			emojiRatio: emojiCount / chars.length,
		}
	}
}




function evalExcessiveMarkingsNormals(text) {
	const cleanText = stripUrls(text)
	const chars = splitChars(cleanText)
	const matches = cleanText.match(/[a-zA-ZäÄüÜöÖß]/ug)
	const normalCharacterCount = matches? matches.length : 0
	const totalCharacterCount = chars.length
	const normalRatio = normalCharacterCount / totalCharacterCount

	let rating
	if (normalRatio > 0.6) {
		rating = 0.0
	}
	else if (normalRatio > 0.4) {
		rating = 0.3
	}
	else {
		rating = 0.8
	}

	return {
		rating,
		details: {
			totalCharacterCount,
			normalCharacterCount,
			normalRatio,
		}
	}
}





module.exports = {
	evalExcessiveMarkings,
	evalExcessiveMarkingsUppercase,
	evalExcessiveMarkingsExclamationQuestionMarks,
	evalExcessiveMarkingsEmojis,
	evalExcessiveMarkingsNormals,
}
