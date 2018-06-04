FILES := \
	manifest.json \
	background.html \
	options.html \
	generated/background.js \
	generated/options.js \
	generated/content.js \
	generated/Pinboard.js \
	generated/icon-16.png \
	generated/icon-24.png \
	generated/icon-32.png \
	generated/icon-48.png \
	generated/icon-64.png \
	generated/icon-96.png \
	generated/icon-128.png

.PHONY: all
all: $(FILES)

generated/%.js:
	yarn run build

generated/icon-%.png: pinboard.svg
	inkscape -z -e $@ -w $* -h $* $<

.PHONY: zip
zip: $(FILES)
	mkdir -p output/archives
	apack output/archives/upload.zip $(FILES)

.PHONY: sign
.ONESHELL:
sign: SHELL := /bin/zsh
sign: $(FILES)
	mkdir -p output/{tree,archives}
	rsync -aR $(FILES) output/tree
	pass addons.mozilla.org/api@woky | { read WEB_EXT_API_KEY; read WEB_EXT_API_SECRET }
	export WEB_EXT_API_KEY WEB_EXT_API_SECRET
	web-ext sign -s output/tree -a output/archives
