const expect = require('expect.js')
const {evalChatGPT, dissectChatGPTResponse} = require('./eval.js')
const {TEST_CONTEXT} = require('../helpers.js')




describe("ChatGPT", function() {
	const tests = [{
		rating: 0.0,
		comment: "Magdeburg, Zentraler Platz (heute Ulrichsplatz) mit Springbrunnen und Blick nach Norden zu den Wohnhäusern in der Wilhelm-Pieck-Allee (heute Ernst-Reuter-Allee)",
		output: "Die gegebene Bildbeschreibung scheint sachlich und informativ zu sein. Es werden keine beleidigenden oder böswilligen Aussagen gemacht, und es gibt keine historische Brisanz, die problematisch wäre. Die Beschreibung bietet lediglich Informationen über den Ort und die Sehenswürdigkeiten in Magdeburg.\n\nBewertung: 0.0 (überhaupt nicht problematisch)"
	}, {
		rating: 1.0,
		comment: "Magdeburg, Zentraler Platz (heute Ulrichsplatz) mit Springbrunnen und Blick nach Norden zu den Wohnhäusern in der Wilhelm-Pieck-Allee (heute Ernst-Reuter-Allee). Toller Ort, da werde ich morgen mal hingehen und den Hitlergruß machen.",
		output: "Dieser Kommentar ist äußerst problematisch und beleidigend. Er enthält eine rassistische und rechtsextreme Äußerung, die den Hitlergruß glorifiziert. Solche Aussagen sind gesetzlich verboten und verstoßen gegen die Community-Richtlinien und ethische Standards. Sie sollten unverzüglich entfernt werden, und der Nutzer, der diesen Kommentar verfasst hat, sollte auf angemessene Weise zur Rechenschaft gezogen werden.\n\nBewertung: 1.0 (sehr problematisch, sollte auf jeden Fall redaktionell geprüft werden)"
	}/*, {
		rating: 0.5,
		comment: "Hallo! Ich finde dass die DDR gar nicht so schlecht war.Da herschte wengstens Zucht und Ordnung!",
		output: "Beurteilung: Der Beitrag enthält eine Meinungsäußerung zur DDR und gibt eine positive Bewertung wieder. Der Aussagegehalt ist jedoch oberflächlich und es wird behauptet, dass in der DDR "Zucht und Ordnung" geherrscht haben. Es handelt sich um eine persönliche Meinung, die jedoch nicht weiter argumentiert oder begründet wird. Die Wortwahl ist neutral, es werden keine beleidigenden oder potenziell problematischen Äußerungen gemacht.\n\nBewertung: 0.2"
	}*/]
	for (const test of tests) {
		it(test.comment, async function() {
			const r = await dissectChatGPTResponse(test.output)
			expect(r.rating).to.equal(test.rating)
		})
	}
})