const fs = require('fs')
const _ = require('underscore')
const {promisify} = require('util')
const {exec} = require('child_process')
const {stemmify} = require('../helpers.js')




function loadTextFileLines(path) {
	const content = fs.readFileSync(path, 'utf8')
	let lines = content.split("\n")
	lines = lines.map(line => line.trim())
	lines = lines.filter(line => line.length>0)
	return lines
}


/*
	@returns a number between 0 and 1.

	Der Text wird untersucht auf positive und negative Konnotationen. Dabei werden die Sentimente jedes einzelnen Wortes anhand einer Wort-Sentiment-Tabelle bestimmt und dann zu einem Gesamtwert addiert.
*/
async function evalSentiment(context, text, {stems}) {
	const start = new Date().getTime()

	// load sentiment words
	const allPositiveWords = [
		...loadTextFileLines(context.serverPath+'/data/positive-adjectives-de.txt'),
		...loadTextFileLines(context.serverPath+'/data/positive-verbs-de.txt'),
	].map(w => w.toLowerCase())

	const allNegativeWords = [
		...loadTextFileLines(context.serverPath+'/data/negative-adjectives-de.txt'),
		...loadTextFileLines(context.serverPath+'/data/negative-verbs-de.txt'),
		...loadTextFileLines(context.serverPath+'/data/negative-nouns-de.txt'),
	].map(w => w.toLowerCase())

	const allTerribleWords = [
		...loadTextFileLines(context.serverPath+'/data/bad-words-de.txt'),
	].map(w => w.toLowerCase())

	const negationWords = ['nicht', 'kein', 'kaum']

	// judge things
	const positives = []
	const negatives = []
	const terribles = []
	let negativeCount = 0
	let positiveCount = 0
	let prevNegates = false
	let prevWord = null
	for (const word of stems) {
		if (_.contains(allTerribleWords, word.toLowerCase())) {
			negativeCount += 5
			terribles.push(word)
		}
		else {
			const isPositive = _.contains(allPositiveWords, word.toLowerCase())
			const isNegative = _.contains(allNegativeWords, word.toLowerCase())
			if (isPositive || isNegative) {
				if ((isPositive && !prevNegates) || (isNegative && prevNegates)) {
					positiveCount += 1
					positives.push(prevNegates? prevWord+' '+word : word)
				} else {
					negativeCount += 1
					negatives.push(prevNegates? prevWord+' '+word : word)
				}
			}
		}
		prevNegates = _.contains(negationWords, word.toLowerCase())
		prevWord = word
	}

	const WORD_FACTOR = 0.2  // each word with a sentiment counts that much to the end result
	const r = positiveCount - negativeCount
	return {
		rating: Math.max(0, Math.min(1.0, - r * WORD_FACTOR)),
		details: {
			stems: stems,
			positives: positives,
			negatives: negatives,
			terribles: terribles,
		},
		time: (new Date().getTime() - start) / 1000,
	}
}




module.exports = {
	evalSentiment,
}