.PHONY: run test bench forms capture required dialogue walkthrough

# The pages the model run reads: one page of the Betreibungsbegehren and two of the Suva form, 152 elements.
BENCH_PAGES = data/forms/betreibungsbegehren/betreibungsbegehren-form-1-s1.png \
	data/forms/suva-bagatellunfall/suva-bagatellunfall-uvg-s1.png \
	data/forms/suva-bagatellunfall/suva-bagatellunfall-uvg-s3.png

# Builds the image and starts the app on http://localhost:8080. The model key comes from .env (copy .env.example);
# without it the app runs, but the reading step is skipped. The walk-through with made-up values is the demo
# under http://localhost:8080/?demo.
run:
	docker compose up --build

# Runs the geometry over the shipped forms and measures it against the text layer and the widgets of the PDFs;
# builds the units of the dialogue and holds its rule against a stand-in for the model.
# No model call, no network: the reference is in the data folder. Results and control images land in storage/tests/.
test:
	node src/cli.js analyze --out=storage/tests/pages data/forms/*/*.png
	node tests/sources.js --got=storage/tests/pages --out=storage/tests/sources.md data/forms/*
	node tests/marks.js --got=storage/tests/pages --out=storage/tests/marks.md data/forms/*
	node tests/fields.js --got=storage/tests/pages --out=storage/tests/fields.md data/forms/*
	node tests/dialogue.js --got=storage/tests/pages --out=storage/tests/dialogue.md data/forms/*
	node tests/numbers.js
	node tests/output.js
	node tests/server.js

# Rebuilds the two rebuilt forms from their definitions in tools/forms/: the fillable PDF, the page images and the
# reference JSON. A preparation step, its results are committed; needs poppler (pdftoppm, pdftotext).
forms:
	node tools/forms/build.js

# Captures the four shipped forms: runs the pipeline over each once and keeps the result beside it as
# data/forms/<form>/captured.json, so the app opens a shipped form without recognizing anything. The text comes
# from the text layer of the PDFs, the questions from the model. A preparation step, its results are committed.
# The questions at which a form requires an entry are marked from its catalogue. Needs API_KEY in .env. 47 calls
# for the questions and 29 for the required ones, about 6 minutes.
capture:
	@test -f .env || { echo "copy .env.example to .env and set API_KEY"; exit 1; }
	node --env-file=.env tools/capture.js

# Binds the required entries of the catalogues to the questions of the captured forms anew, without touching the
# questions, and writes how every entry was bound. Needs API_KEY in .env. 29 calls, 14 of them to the large model.
# The report lands in storage/bench/; the committed run is in results/required.md.
required:
	@test -f .env || { echo "copy .env.example to .env and set API_KEY"; exit 1; }
	node --env-file=.env tools/capture.js --required --out=storage/bench/required.md

# Reads the unknown elements of three shipped pages with the model and holds the text against the text layer of the
# PDFs; then fills the walk-through's form from its made-up dictation, said at once and question by question.
# Needs API_KEY in .env (copy .env.example). 152 calls for the reading and about 25 for the filling, one after
# the other, about 8 minutes. Results and the raw exchange land in storage/bench/; the committed run of the same
# target is in results/.
bench:
	@test -f .env || { echo "copy .env.example to .env and set API_KEY"; exit 1; }
	node --env-file=.env src/cli.js analyze --out=storage/bench/pages $(BENCH_PAGES)
	node --env-file=.env src/cli.js read --out=storage/bench/pages $(BENCH_PAGES)
	node tests/read.js --got=storage/bench/pages --out=storage/bench/read.md data/forms/*
	node --env-file=.env tests/fill.js --out=storage/bench/fill.md
	node --env-file=.env tests/answers.js --out=storage/bench/answers.md

# Writes and checks the questions of the four shipped forms with the model, as the pipeline does for a captured
# form, and measures the check with errors put in on purpose; judges whether answers are enough for their place,
# on cases built from the walk-through; and measures a form filled in in another language than its own: the
# dialogue translated and checked, the values there and back. Needs API_KEY in .env. 47, 129 and about 100
# calls, one after the other, about 25 minutes. Results and the raw exchange land in storage/bench/; the
# committed run is in results/.
dialogue:
	@test -f .env || { echo "copy .env.example to .env and set API_KEY"; exit 1; }
	node src/cli.js analyze --out=storage/bench/forms data/forms/*/*.png
	node --env-file=.env tests/questions.js --got=storage/bench/forms --out=storage/bench/dialogue.md data/forms/*
	node --env-file=.env tests/enough.js --out=storage/bench/enough.md
	node --env-file=.env tests/translate.js --out=storage/bench/translate.md

# Writes the dialogues of the click-through's two forms with the model into src/app/js/mock/dialogues.js.
# A preparation step, its result is committed. Needs API_KEY in .env. 12 calls.
walkthrough:
	@test -f .env || { echo "copy .env.example to .env and set API_KEY"; exit 1; }
	node --env-file=.env tools/dialogue.js
