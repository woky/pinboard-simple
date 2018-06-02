SOURCES := \
	generated/background.js \
	manifest.json

pinboard-simple.zip: $(SOURCES)
	apack $@ $?

generated/%:
	yarn run build
