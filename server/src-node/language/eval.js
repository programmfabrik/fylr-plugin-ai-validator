const _ = require('underscore')
const DetectLanguage = require('detectlanguage')
const {stripUrls} = require('../helpers.js')




let detectLanguage = null




async function evalIsGermanSmart(context, text) {
	if ( ! detectLanguage) {
		detectLanguage = new DetectLanguage(context.config.apikeyDetectLanguage)
	}
	return new Promise((resolve, reject) => {
		const cleanText = stripUrls(text)
		detectLanguage.detect(text).then((result) => {
			const propablyIsGerman = result[0]?.language==='de' || result[1]?.language==='de'
			// console.log(JSON.stringify(result))
  			resolve(propablyIsGerman)
		})
		.catch(reject)
	})
}



async function evalIsGermanDumb(context, text) {
	const mostUsedGermanWords = [
		'und', 'oder', 'ja', 'nein', 'nicht', 'auch', 'so', 'etwa', 'doch',
		'ein', 'eine', 'eines',
		'der', 'die', 'das', 'dieser', 'diese', 'dieses',
		'ich', 'du', 'er', 'es', 'sie', 'wir', 'ihr',
		'mich', 'dich', 'sich',
		'mein', 'meine', 'meins', 'dein', 'deine', 'deins', 'sein', 'seine', 'seins', 'ihr', 'ihre', 'ihres', 'unser', 'unsere', 'unseres', 'euer', 'eure', 'eures',
		'ist', 'war', 'wird',
		'mehr', 'weniger',
		'man', 'kein', 'keine', 'keines', 'keiner', 'dran', 'daran', 'nichts',
		'ganz', 'neu', 'neue', 'neues', 'alt', 'alte', 'altes', 'klein', 'kleine', 'kleines', 'groß', 'große', 'großes', 'viel', 'vieles', 'wenig',
		'anderer', 'andere', 'anders',
		'wie', 'wo', 'was', 'wer',
		'vielleicht', 'wahrscheinlich', 'kaum', 'nur', 'immer', 'nie', 'vermutlich', 'eventuell',
		'hier', 'dort', 'da', 'unten', 'oben', 'links', 'rechts', 'gerade', 'geradeaus',
		'dann', 'wieder', 'noch', 'schon', 'jetzt', 'früher', 'damals',
		'mit', 'zu', 'zur', 'zum', 'in', 'im', 'unter', 'auf', 'für', 'von', 'an', 'bei', 'aus', 'nach', 'durch', 'über', 'vor', 'um', 'zwischen',
		'als', 'dass', 'aber', 'wenn', 'denn', 'weil', 'bis', 'sobald', 'während', 'mal',
		'circa', 'ca', 'den', 'dem', 'am', 'nahe', 'Nähe', 'Jahr', 'Jahre',
		'Platz', 'Straße', 'Weg', 'Norden', 'Osten', 'Süden', 'Westen', 'Turm', 'Kirche', 'Richtung', 'Altstadt', 'Blick', 'Markt', 'heute', 'Mitte', 'Tor', 'Berg', 'Park',
	].map(w => w.toLowerCase())

	let words = text.match(/[\wäüöß]+/gi) ?? []
	words = words.filter(w => !/^\d+$/.test(w))   // filter out pure numbers
	const totalWords = words.length
	const germanWords = words.filter(w => _.contains(mostUsedGermanWords, w.toLowerCase())).length
	const ratioOfDefiniteGermanWords = germanWords / totalWords
	return ratioOfDefiniteGermanWords > 0.12
}




/*
	@returns a number between 0 and 1.

	Der Text wird darauf untersucht, ob er deutsche Wörter enthält. So kann vom Moderationsteam z.B. eingestellt werden, dass nicht-deutsche Texte automatisch zur Überprüfung markiert werden.
*/

async function evalIsGerman(context, text) {
	const start = new Date().getTime()

	const cleanText = stripUrls(text)
	try {
		return {
			rating: await evalIsGermanSmart(context, cleanText),
			details: {
				smart: true,
			},
			time: (new Date().getTime() - start) / 1000,
		}
	}
	catch (err) {
		// we may have exhausted the free API tier budget, so fall back
		return {
			rating: await evalIsGermanDumb(context, cleanText),
			details: {
				smart: false,
			},
			time: (new Date().getTime() - start) / 1000,
		}
	}
}




module.exports = {
	evalIsGerman,
}