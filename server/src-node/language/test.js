const expect = require('expect.js')
const {evalIsGerman} = require('./eval.js')
const {TEST_CONTEXT} = require('../helpers.js')




describe("Is German", function() {
	const tests = [{
		rating: true,
		text: "Das ist in Köln.. :-)",
	}, {
		rating: false,
		text: "This is Sparta!",
	}]
	for (const test of tests) {
		it(test.text, async function() {
			const r = await evalIsGerman({}, test.text)
			expect(r.rating).to.equal(test.rating)
		})
	}
})