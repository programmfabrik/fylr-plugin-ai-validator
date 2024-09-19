ZIP_NAME ?= "ai-validator.zip"
PLUGIN_NAME = ai-validator

# Verzeichnis für die heruntergeladenen .whl-Dateien
LIBRARY_DIR = server/src-python/hanta_numpy_nltk
# Verzeichnis für die entpackten Bibliotheken
UNPACKED_DIR = $(LIBRARY_DIR)/unpacked

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

	pip download HanTa numpy nltk -d server/src-python/hanta_numpy_nltk

	# unpack the .whl-files
	mkdir -p $(UNPACKED_DIR)
	for whl_file in $(LIBRARY_DIR)/*.whl; do \
		echo "Unpacking $$whl_file to $(UNPACKED_DIR)"; \
		unzip -q $$whl_file -d $(UNPACKED_DIR); \
	done

	# overwrite unpacked regex library folder
	cp -rf server/src-python/hanta_numpy_nltk/regex $(UNPACKED_DIR)

	cp -rf server/data build/$(PLUGIN_NAME)/server/data
	cp -rf server/src-python build/$(PLUGIN_NAME)/server/src-python

	# Transpile and bundle server's Javascript
	cd server/src-node && npm ci && npm run bundle 
	cp server/src-node/bundle.js build/$(PLUGIN_NAME)/server/api.js

clean:
	rm -rf build
	rm -f server/src-node/bundle.js
	rm -f server/src-python/hanta_numpy_nltk/*.whl
	rm -rf server/src-python/hanta_numpy_nltk/unpacked

zip: build
	cd build && zip ${ZIP_NAME} -r $(PLUGIN_NAME)/

install:
