ZIP_NAME ?= "CitizenArchives.zip"
PLUGIN_NAME = citizen-archives


help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'


all: build zip clean


build: clean build-web build-server
	cp translations.csv build/$(PLUGIN_NAME)/translations.csv
	cp manifest.master.yml build/$(PLUGIN_NAME)/manifest.yml


build-web:
	mkdir -p build/$(PLUGIN_NAME)/web
	cat web/src/*.js > build/$(PLUGIN_NAME)/web/web.js


build-server:
	mkdir -p build/$(PLUGIN_NAME)/server

	cp -rf server/data build/$(PLUGIN_NAME)/server/data
	cp -rf server/src-python build/$(PLUGIN_NAME)/server/src-python

	# Transpile and bundle server's Javascript
	cd server/src-node && npm ci && npm run bundle 
	cp server/src-node/bundle.js build/$(PLUGIN_NAME)/server/api.js


clean:
	rm -rf build
	rm -f server/src-node/bundle.js


zip: build
	cd build && zip ${ZIP_NAME} -r $(PLUGIN_NAME)/


install:
	pip install HanTa numpy nltk
	npm install --save detectlanguage dotenv hunspell-spellchecker node-fetch underscore
