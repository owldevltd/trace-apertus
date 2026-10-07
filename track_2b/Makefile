.PHONY: run test bench

# The pages the model run reads: one page of the Betreibungsbegehren and two of the Suva form, 152 elements.
BENCH_PAGES = data/forms/betreibungsbegehren/betreibungsbegehren-form-1-s1.png \
	data/forms/suva-bagatellunfall/suva-bagatellunfall-uvg-s1.png \
	data/forms/suva-bagatellunfall/suva-bagatellunfall-uvg-s3.png

# Starts the app in a Docker container. Not implemented yet: the web app and its container follow in later commits.
run:
	@echo "make run is not implemented yet — the app and its container follow"; exit 1

# Runs the geometry over the shipped forms and measures it against the text layer and the widgets of the PDFs.
# No model call, no network: the reference is in the data folder. Results and control images land in storage/tests/.
test:
	node src/cli.js analyze --out=storage/tests/pages data/forms/*/*.png
	node tests/sources.js --got=storage/tests/pages --out=storage/tests/sources.md data/forms/*
	node tests/marks.js --got=storage/tests/pages --out=storage/tests/marks.md data/forms/*
	node tests/fields.js --got=storage/tests/pages --out=storage/tests/fields.md data/forms/*

# Reads the unknown elements of three shipped pages with the model and holds the text against the text layer of the
# PDFs. Needs API_KEY in .env (copy .env.example). 152 calls, one after the other, about 7 minutes. Results and the
# raw exchange land in storage/bench/; the committed run of the same target is in results/.
bench:
	@test -f .env || { echo "copy .env.example to .env and set API_KEY"; exit 1; }
	node --env-file=.env src/cli.js analyze --out=storage/bench/pages $(BENCH_PAGES)
	node --env-file=.env src/cli.js read --out=storage/bench/pages $(BENCH_PAGES)
	node tests/read.js --got=storage/bench/pages --out=storage/bench/read.md data/forms/*
