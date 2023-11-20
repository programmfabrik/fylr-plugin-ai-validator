const axios = require('axios')
const {stripUrls} = require('../helpers.js')




const INSTRUCTIONS_PREFIX = `
Ich möchte, dass du für mich einen Nutzerbeitrag prüfst. Er sollte eine sachliche Bildbeschreibung beinhalten, aber ein Nutzer kann natürlich auch böswillige, beleidigende, umstrittene oder potentiell problematische Beiträge schreiben. Bitte schreibe zuerst deine Beurteilung und dann in einer neuen Zeile eine Zahl zwischen 0.0 (überhaupt nicht problematisch) bis 1.0 (sollte redaktionell geprüft werden).

Der Kommentar:\n\n`




function dissectChatGPTResponse(text) {
	const lastLine = text.split('\n').pop()
	const possibleRatingNumbers = lastLine.match(/[-+]?[0-9]*\.?[0-9]+/g) ?? []
	if (possibleRatingNumbers.length !== 1) {
		// throw new Error("Couldn't extract rating number from last line \""+lastLine+"\"")
		return {
			rating: 1.0,
			reasoning: "ChatGPT can't even give a rating to this text."
		}
	}
	const rating = parseFloat(possibleRatingNumbers[0])
	if (rating<0.0 || rating>1.0) {
		throw new Error("Couldn't extract rating number from last line \""+lastLine+"\"")
	}

	const reasoning = text.substr(0, text.length - lastLine.length).trim()

	return {rating, reasoning}
}



async function evalChatGPT(context, text, {stems}) {
	const start = new Date().getTime()

	// for parameters see https://platform.openai.com/docs/api-reference/chat/create
	const post = {
		model: 'gpt-3.5-turbo',
		messages: [{
			role: 'system',
			content: "Du bist ein hilfreicher Assistent."
		}, {
			role: 'user',
			content: INSTRUCTIONS_PREFIX + text,
		}],
	}
	const res = await axios.post('https://api.openai.com/v1/chat/completions', post, {
		headers: {
			'Authorization': 'Bearer '+context.config.apikeyOpenAI,
			'Content-Type': 'application/json',
		}
	})
	const reply = res.data.choices[0].message.content

	// Reply will look like this:
	// "Die gegebene Bildbeschreibung scheint sachlich und informativ zu sein. Es werden keine beleidigenden oder böswilligen Aussagen gemacht, und es gibt keine historische Brisanz, die problematisch wäre. Die Beschreibung bietet lediglich Informationen über den Ort und die Sehenswürdigkeiten in Magdeburg.\n\nBewertung: 0.0 (überhaupt nicht problematisch)"

	const {rating, reasoning} = dissectChatGPTResponse(reply)
	return {
		rating,
		details: {
			reasoning: reasoning,
		},
		time: (new Date().getTime() - start) / 1000,
	}
}




module.exports = {
	dissectChatGPTResponse,
	evalChatGPT,
}