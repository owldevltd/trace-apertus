.PHONY: run test

# Starts the app in a Docker container. Not implemented yet: the web app and its container follow in later commits.
run:
	@echo "make run is not implemented yet — the app and its container follow"; exit 1

# Runs the geometry over the shipped forms and measures it against the text layer and the widgets of the PDFs.
# No model call, no network: the reference is in the data folder. Results and control images land in storage/tests/.
test:
	node src/cli.js analyze --out=storage/tests/pages data/forms/*/*.png
	node tests/sources.js --got=storage/tests/pages --out=storage/tests/sources.md data/forms/*
	node tests/marks.js --got=storage/tests/pages --out=storage/tests/marks.md data/forms/*
