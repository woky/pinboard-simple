FILES := \
	generated/*.js \
	manifest.json

generated/%:
	yarn run build

.PHONY: sign
.ONESHELL:
sign: SHELL := /bin/zsh
sign: $(FILES)
	mkdir -p output/{tree,archives}
	rsync -aR $(FILES) output/tree
	pass addons.mozilla.org/api@woky | { read WEB_EXT_API_KEY; read WEB_EXT_API_SECRET }
	export WEB_EXT_API_KEY WEB_EXT_API_SECRET
	web-ext sign -s output/tree -a output/archives
