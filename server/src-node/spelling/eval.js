const fs = require('fs')
const _ = require('underscore')
const Spellchecker = require('hunspell-spellchecker')  // see https://github.com/GitbookIO/hunspell-spellchecker
const {stripUrls} = require('../helpers.js')




async function loadSpellcheckerDE(context) {
	// Dictionary files are from https://www.freeoffice.com/en/download/dictionaries. There are sox files that you can rename to zip and unpack and you will find the aff and dic inside. I then re-encoded the dic file from Windows-1252 to UTF-8.
	// An alternative is https://github.com/wooorm/dictionaries/tree/main/dictionaries/de but I am not sure how recent this is.

	const allCityNames = fs.readFileSync(context.serverPath+'/data/city-names-germany.txt', 'utf8').split('\n').filter(line => line.length>0)

	// Some words are missing in the Hunspell dictionary.
	const additionalValidWords = [
		'Springbrunnen',
		'Wohnhaus', 'Wohnhauses', 'Wohnhäuser', 'Wohnhäusern',
		'Plattenbau', 'Plattenbaus', 'Plattenbauten',
		'Stadtmauer', 'Stadtmauern',
		'50er', '50ern', '1950er', '1950ern',
		'60er', '60ern', '1960er', '1960ern',
		'70er', '70ern', '1970er', '1970ern',
		'80er', '80ern', '1980er', '1980ern',
		'Innenhof', 'Innenhofs', 'Innenhöfe',
		'ca',
		'bzw',
		'ggf',
		'Str', 'Hauptstr',
		'Rückseite', 'Rückseiten',
		'Vordergrund', 'Vordergrunds',
		'Hintergrund', 'Hintergrunds',
		'Opernhaus', 'Opernhauses', 'Opernhäuser', 'Opernhäusern',
		'Bildmitte',
		'Bildhintergrund', 'Bildhintergrunds',
		'Stadtbad', 'Stadtbads', 'Stadtbäder', 'Stadtbädern',
		'Blickwinkel', 'Blickwinkels',
		'Kennzeichen', 'Kennzeichens',
		'Straßenname',
		'Eckkneipe',
		'Altstadt', 'Altstädte',
		'Innenstadt', 'Innenstädte',
		'Gaststätte', 'Gaststätten',
		'Neubau', 'Neubaus', 'Neubauten',
		'Neubaugebiet', 'Neubaugebiets', 'Neubaugebiete',
		'Nordwest',
		'Vorbau', 'Vorbaus',
		'Eingangsbereich', 'Eingangsbereichs', 'Eingangsbereiche',
		'Kaufhalle',
		'Wandgemälde', 'Wandgemäldes',
		'S-Bahnhof', 'S-Bahnhofs', 'S-Bahnhöfe',
		'U-Bahnhof', 'U-Bahnhofs', 'U-Bahnhöfe', 
		'Hochhaus', 'Hochhauses', 'Hochhäuser', 'Hochhäusern',
		'Ostbahnhof', 'Ostbahnhofs',
		'Hausnummer', 'Hausnummern',
		'Kindergarten', 'Kindergärten',
		'Dachterrasse', 'Dachterrassen',
		'Haupteingang', 'Haupteingangs', 'Haupteingänge',
		'Berlin-Mitte',
		'Grenzverlauf', 'Grenzverlaufs', 'Grenzverläufe', 'Grenzverläufen',
		'Wohnungsbaugesellschaft', 'Wohnungsbaugesellschaften',
		'Schlossbrücke', 'Schlossbrücken',
		'DDR-Außenministerium', 'DDR-Außenministeriums',
		'Tierpark', 'Tierparks',
		'Wiederaufbau', 'Wiederaufbaus',
		'Stadtteil', 'Stadtteils', 'Stadtteile',
		'Museumsinsel', 'Museumsinseln',
		'Jahrestag', 'Jahrestags', 'Jahrestage',
		'Spielplatzes', 'Spielplätze',
		'Kletterburg', 'Kletterburgen',
		'Hilferuf', 'Hilferufs', 'Hilferufe',
		'Nordseite',
		'Kreuzkirche',
		'Baustelleneinrichtung', 'Baustelleneinrichtungen',
		'Handelszentrum', 'Handelszentrums', 'Handelszentren',
		'Seminargebäude', 'Seminargebäudes',
		'Innenaufnahme', 'Innenaufnahmen',
		'Weihnachtsmarkt', 'Weihnachtsmärkte',
		'Lebensfreude',
		'Empfangsgebäude', 'Empfangsgebäudes',
		'Fernbahnhof', 'Fernbahnhofs', 'Fernbahnhöfe',
		'Wasserspiele',
		'Schalenbau', 'Schalenbaus',
		'Europahaus',
		'Zusammenhang', 'Zusammenhangs', 'Zusammenhänge',
		'Autokennzeichen',
		'Domplatz',
		'Hausbewohnerin', 'Hausbewohnerinnen',
		'Marktplatz', 'Marktplatzes', 'Marktplätze',
	]

	const spellchecker = new Spellchecker()
	const fullFilePath = context.serverPath+'/data/hunspell_dict_de_DE.json'
	if ( ! fs.existsSync(fullFilePath)) {
		const aff = fs.readFileSync(context.serverPath+'/data/hunspell_dict_de_DE_frami.aff')
		const dic = fs.readFileSync(context.serverPath+'/data/hunspell_dict_de_DE_frami.dic')
		const dictDE = spellchecker.parse({aff, dic})
		fs.writeFileSync(fullFilePath, JSON.stringify(dictDE))
	}

	return new Promise((resolve, reject) => {
		fs.readFile(fullFilePath, {encoding: 'utf8'}, (err, dictDERaw) => {
			if (err) return reject(err)
			try {
				const dictDE = JSON.parse(dictDERaw)
				spellchecker.use(dictDE)
				const checkFunc = (text) => {
					if (_.contains(additionalValidWords, text)) {
						return true
					}
					if (_.contains(allCityNames, text)) {
						return true
					}
					return spellchecker.check(text)
				}
				resolve(checkFunc)
			}
			catch (err) {
				reject(err)
			}
		})
	})
}



let spellcheckPromise




/*
	@returns a number between 0 and 1.

	Vermehrte Rechtschreibfehler in einem Text werden erkannt und fließen dann als Parameter in die Gesamtbeurteilung mit ein. Die Überprüfung ist dabei nicht vollumfänglich oder im Umfang von z.B. Microsoft Word, aber dient als grundsätzliche Basis.
*/
async function evalSpelling(context, text, {stems}) {
	const start = new Date().getTime()

	const cleanText = stripUrls(text)
	const words = (cleanText.match(/[\wßÄäÜüÖö\-]+/g) ?? [])
		.filter(w => w.length && w!=='-')
		.filter(w => ! /^\d+$/.test(w))
	if ( ! words.length) {
		return {
			rating: 0.0,
			details: {}
		}
	}

	if ( ! spellcheckPromise) {
		spellcheckPromise = loadSpellcheckerDE(context)
	}

	const spellcheck = await spellcheckPromise
	const unrecognizedWords = words.filter(w => ! spellcheck(w))
	const incorrectRatio = unrecognizedWords.length / words.length

	return {
		rating: incorrectRatio,
		details: {
			totalWords: words.length,
			unrecognizedWords,
		},
		time: (new Date().getTime() - start) / 1000,
	}
}




module.exports = {
	evalSpelling,
}