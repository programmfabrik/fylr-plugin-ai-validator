const expect = require('expect.js')
const {evalSentiment} = require('./eval.js')
const {TEST_CONTEXT} = require('../helpers.js')




describe("evalSentiment", async function() {
	const tests = [[
		0.0, 0.0,
		"Hallo! Hier sollte alles okay sein."
	], [
		0.0, 0.3,
		"Einmal Scheiße sagen wird man wohl dürfen."
	], [
		0.1, 0.5,
		"Eine schöne Stadt, aber ein hässliches Haus in einer dummen Gegend.",
	], [
		0.8, 1.0,
		"Fickt euch ihr Hurensöhne",
	], [
		0.0, 0.0, 
		"Die Sonne scheint, der Himmel ist blau.",
	], [
		0.0, 0.0,
		"Ich liebe dieses Wetter!",
	], [
		0.0, 0.0,
		"Ein perfekter Tag für einen Spaziergang.",
	], [
		0.0, 0.1,
		"Leider regnet es heute.",
	], [
		0.2, 0.2,
		"Der Verkehr ist schrecklich, ich komme zu spät zur Arbeit.",
	], [
		0.0, 0.0,
		"Ich freue mich auf das Wochenende.",
	], [
		0.0, 0.0,
		"Das Essen in diesem Restaurant war köstlich.",
	], [
		0.2, 0.5,
		"Mein Auto ist kaputt, das ärgert mich.",
	], [
		0.0, 0.0,
		"Gute Nachrichten! Ich habe den Job bekommen.",
	], [
		0.2, 0.5,
		"Der Film gestern Abend war furchtbar.",
	], [
		0.1, 0.5,
		"Ich vermisse meine Familie.",
	], [
		0.0, 0.0,
		"Das Konzert gestern war großartig.",
	], [
		0.2, 0.5,
		"Ich bin müde und gestresst.",
	], [
		0.0, 0.0,
		"Der Geburtstag meiner Tochter war ein Erfolg.",
	], [
		0.1, 0.5,
		"Ich habe meine Brieftasche verloren.",
	], [
		0.0, 0.0,
		"Der Urlaub war entspannend.",
	], [
		0.2, 0.5,
		"Der Urlaub war stressig.",
	], [
		0.1, 0.3,
		"Der Arzttermin war unangenehm.",
	], [
		0.0, 0.0,
		"Mein Lieblingsbuch ist endlich erschienen!",
	], [
		0.1, 0.3,
		"Ich fühle mich einsam.",
	], [
		0.0, 0.0,
		"Der Kaffee am Morgen weckt mich auf."
	]]
	for (const test of tests) {
		const [min, max, text] = test
		it(text+' (>='+min+' and <='+max+')', async function() {
			const v = await evalSentiment(TEST_CONTEXT, text)
			expect(v).to.not.be.lessThan(min)
			expect(v).to.not.be.greaterThan(max)
		})
	}
})