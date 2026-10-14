# Trace — capture, structure, verify.

Hack Apertus 2026 · Track 2B (Own Project) · built on [Apertus](https://huggingface.co/swiss-ai)

Trace takes a photographed or scanned form, finds its fields, fills them from what a person says, shows every value next to the words it came from, and hands the result over for signature. The form stays what it is: a document someone else designed, printed in its own layout. Nothing is rewritten and nothing is guessed silently; what could not be read or derived is marked for a person to look at.

The work is split in two. Geometry runs without a model: lines, tinted areas, tick marks, empty cells and text blocks come from the image alone, and they are measured against the text layer and the form widgets of the original PDFs. Apertus 8B does what needs language: it reads the blocks one at a time, transcribes the voice recording, and turns the transcript into field values, each with the quoted source it came from.

Every reading is checked against the image by the shape of its glyphs, every value carries the words it was taken from, and whatever fails either check is flagged for confirmation. The thresholds behind these flags were measured, not chosen; the measurements and the decisions they led to are in the evidence document, including the attempts that did not work.

Everything runs in one Node process in a container, with the model behind an OpenAI-compatible endpoint (run at CSCS, in Switzerland). Two libraries do what would be unreasonable to rewrite: pdf-lib writes the filled PDF, lamejs encodes the recording as MP3 in the browser; everything else, from the page geometry to the templates, is in the repository. The shipped forms, their reference data and the test harnesses reproduce the numbers: `make test` for the geometry without a model, `make bench` for the reading with one.

```
cd track_2b
cp .env.example .env    # put your key after LLM_API_KEY=
make run                # Docker; then open http://localhost:8080 (or http://localhost:8080/?demo)
```

What you need, how to fill a first form, input and output, the results and the tests: [`track_2b/README.md`](track_2b/README.md). The project root is [`track_2b/`](track_2b/): source in `src/`, forms and schema in `data/`, concept and evidence in `docs/`, harnesses in `tests/`, the committed model runs in `results/`, and the technical report. Licensed under Apache 2.0, see [LICENSE](LICENSE).
