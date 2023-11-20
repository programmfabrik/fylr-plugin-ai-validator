const Spellchecker = require('./hunspell-spellchecker')
const fs = require('fs')
const {FastJson} = require('fast-json')
const simdjson = require('simdjson')
const sjson = require('secure-json-parse')




function test() {
	const spellchecker = new Spellchecker()
	const fullFilePath = '../server/data/hunspell_dict_de_DE.json'
	return new Promise((resolve, reject) => {

const start1 = new Date().getTime()
		fs.readFile(fullFilePath, (err, dictDERaw) => {
console.log((new Date().getTime() - start1) / 1000, 's reading file')

			if (err) return reject(err)
			try {
const start2 = new Date().getTime()
				const dictDE = JSON.parse(dictDERaw)
console.log((new Date().getTime() - start2) / 1000, 's parsing json')

const start3 = new Date().getTime()
				spellchecker.use(dictDE)
console.log((new Date().getTime() - start3) / 1000, 's for `use`')

				const checkFunc = (text) => spellchecker.check(text)
				resolve(checkFunc)
			}
			catch (err) {
				reject(err)
			}
		})
	})
}



;(async () => {
	try {
		const text = fs.readFileSync('../server/data/hunspell_dict_de_DE.json', {encoding: 'utf8'})

		const start2 = new Date().getTime()
		JSON.parse(text)
		console.log((new Date().getTime() - start2) / 1000, 's JSON.parse')

		// const start3 = new Date().getTime()
		// const fastJson = new FastJson()
		// fastJson.write(text)
		// console.log((new Date().getTime() - start3) / 1000, 's fastJson')

		const start4 = new Date().getTime()
		simdjson.parse(text)
		console.log((new Date().getTime() - start4) / 1000, 's simdjson')

		const start5 = new Date().getTime()
		sjson.parse(text, undefined, { protoAction: 'remove', constructorAction: 'remove' })
		console.log((new Date().getTime() - start5) / 1000, 's sjson')


		// const checker = await test()
		// checker('abc')
	}
	catch (err) {
		console.log('ERROR', err.message)
	}
})()