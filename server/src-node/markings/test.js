const expect = require('expect.js')
const {evalExcessiveMarkingsMetrics, evalExcessiveMarkingsUppercase, evalExcessiveMarkingsExclamationQuestionMarks, evalExcessiveMarkingsEmojis, evalExcessiveMarkingsNormals} = require('./eval.js')
const {TEST_CONTEXT} = require('../helpers.js')




describe("Excessive markings", function() {
	describe("Uppercase", function() {
		const tests = [[
			0.0, 0.1,
			"Hallo ich heiße Michel",
		], [
			0.5, 1.0,
			"ICH HASSE ES IM INTERNET ZU SCHREIBEN!!!! Ne Scherz, aber vlt schon..",
		]]
		for (const test of tests) {
			const [min, max, text] = test
			const metrics = evalExcessiveMarkingsMetrics(text)
			const v = evalExcessiveMarkingsUppercase(metrics)
			it(text+' ='+v+' (>='+min+' and <='+max+')', function() {
				expect(v).to.not.be.lessThan(min)
				expect(v).to.not.be.greaterThan(max)
			})
		}
	})

	describe("!! and ??", function() {
		const tests = [[
			0.0, 0.0,
			"Hallo, das hier ist ein sehr unschuldiger Text! Wirklich."
		], [
			0.0, 0.3,
			"Wieso! So viele Ausrufe! Zeichen!",
		], [
			0.2, 0.5,
			"Und vor Allem, sauer bin ich!!",
		], [
			0.5, 1.0,
			"Und vor Allem!!!! sauer bin ich!!",
		], [
			0.0, 0.0,
			"Hallo, das hier ist ein sehr unschuldiger Text? Wirklich."
		], [
			0.0, 0.3,
			"Wieso! So viele Frage? Zeichen?!",
		], [
			0.2, 0.5,
			"Und vor Allem, waruum??",
		], [
			0.5, 1.0,
			"Und vor Allem????? sauer bin ich???",
		]]
		for (const test of tests) {
			const [min, max, text] = test
			const metrics = evalExcessiveMarkingsMetrics(text)
			const v = evalExcessiveMarkingsExclamationQuestionMarks(metrics)
			it(text+' ='+v+' (>='+min+' and <='+max+')', function() {
				expect(v).to.not.be.lessThan(min)
				expect(v).to.not.be.greaterThan(max)
			})
		}
	})

	describe("Emojis 😋", function() {
		const tests = [[
			0.0, 0.0,
			"Hallo!! ich heiße Michel??????"
		], [
			0.0, 0.3,
			"Ein Emoji mal sollte ja ok sein 😚"
		], [
			0.1, 0.5,
			"Im längeren Text kann man auch mal ein 😗 oder sogar ein zweites unterbringen denke ich 😛",
		], [
			0.5, 1.0,
			"Aber nicht zu viele! 😗 😙 😚 😋 😛",
		], [
			0.8, 1.0,
			"😱",
		]]
		for (const test of tests) {
			const [min, max, text] = test
			const v = evalExcessiveMarkingsEmojis(text)
			it(text+' ='+v+' (>='+min+' and <='+max+')', function() {
				expect(v).to.not.be.lessThan(min)
				expect(v).to.not.be.greaterThan(max)
			})
		}
	})

	describe("Normal characters", function() {
		const tests = [[
			0.0, 0.1,
			"Hallo, hier sollte alles ok aussehen..."
		], [
			0.1, 0.4,
			"Weiß nicht.....",
		], [
			0.5, 1.0,
			"https://google.com/abc hä??"
		], [
			0.75, 1.0,
			"https://google.com/abc https://knjasdasd.com/kajnsd/as?a=b"
		]]
		for (const test of tests) {
			const [min, max, text] = test
			const v = evalExcessiveMarkingsNormals(text)
			it(text+' ='+v+' (>='+min+' and <='+max+')', function() {
				expect(v).to.not.be.lessThan(min)
				expect(v).to.not.be.greaterThan(max)
			})
		}
	})
})