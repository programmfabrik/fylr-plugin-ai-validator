const dotenv = require('dotenv')
const fs = require('fs')
const _ = require('underscore')
const {promisify} = require('util')
const {exec} = require('child_process')


const promisifiedExec = promisify(exec)




dotenv.config()



const URL_REGEX = /(https?:\/\/[^\s]+)/g



function stripUrls(text) {
	const urlMatches = text.match(URL_REGEX)
	if ( ! urlMatches) {
		return text
	}
	const urlCount = urlMatches.length
	return text.replace(URL_REGEX, '')
}




function splitChars(text) {
	return [...text]  // this is the best way to split a string into its characters, it preserves emojis as well, see https://stackoverflow.com/questions/35223206/how-to-split-unicode-string-to-characters-in-javascript
}




const TEST_CONTEXT = {
	serverPath: '..',
}




// by ChatGPT
function escapeShellArg(arg) {
	// If the string contains spaces, double quotes, parentheses, or backslashes,
	// then we enclose the string in single quotes and escape any contained double quotes and backslashes.
	if (/[ "'()\\]/.test(arg)) {
	    return `'${arg.replace(/(['"\\])/g, '\\$1')}'`;
	}
	// Otherwise, we return the string as is.
	return arg;
}


/*
	@returns a number between 0 and 1.

	Der Text wird untersucht auf positive und negative Konnotationen. Dabei werden die Sentimente jedes einzelnen Wortes anhand einer Wort-Sentiment-Tabelle bestimmt und dann zu einem Gesamtwert addiert.
*/
async function stemmify(context, text) {
	const pythonExecPath = 'python3'
	try {
		const {stdout, stderr} = await promisifiedExec(pythonExecPath+' '+context.serverPath+'/src-python/stem.py '+escapeShellArg(text))
		let words = JSON.parse(stdout)
		words = words.filter(word => word.match(/[a-züöäß]/i))  // Only include parts that contain at least one German character, otherwise it will also contains commas etc as single words.
		return words
	}
	catch (err) {
		throw new Error("Error when stemming: "+(err.stderr ?? err.message))
	}
}





module.exports = {
	stripUrls,
	splitChars,
	stemmify,
	TEST_CONTEXT,
}
