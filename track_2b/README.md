# Trace — capture, structure, verify

**Photograph a paper form, say what belongs in it, and get the original back filled in – with Apertus.**
Hack Apertus 2026 · Track 2B · Own Project. Demo video (2 minutes): https://youtu.be/6Vq8VxiFxUQ

Trace takes a photographed or scanned form, finds its fields, asks for them as a conversation – by voice or by
typing, in the person's own language – and fills the original. Every value stands next to the words it came from;
what could not be read or derived is marked for a person to look at, never guessed silently. A person checks and
sends the form for signature. The form stays what it is: a document someone else designed, filled in its own fields.

## Results

- A test sheet dictated in one go is filled with 20 of 20 fields right (three runs with one synthetic voice; 19 of 20
  with another).
- A captured form is filled in 3 to 17 seconds from the answers to the sent PDF; capturing a new form costs 51 to 88
  seconds a page, once.
- The geometry, without a model, finds 91 % of the text fields a hand can fill in (1 538 of 1 688; of all 1 871 text
  fields 71 %), 81 % of the tick boxes and 71 % of the radio buttons (`docs/evidence.md`); asked alone, the model found
  4 of 31 tick boxes.
- Reading cut into pieces: 1.0 % character errors, against 4.9 % for the whole page; one element per call on the shipped
  forms 1.1 %.

The technical report (`technical_report.md`) gives the design and the evaluation; `docs/tests.md` and
`docs/evidence.md` the tests and measurements behind every step.

## What you need

- **Runtime:** Docker with Compose 2.24 or newer (Docker Desktop, or Docker Engine with the compose plugin), and a
  current browser. Nothing else: the image brings Node and the one library. The first build needs the network.
- **Hardware:** no GPU. Tested on a laptop with four cores (eight threads) and 8 GB of memory (6.9 GB usable). Port 8080
  must be free. A microphone for speaking; a phone for photographing (see below).
- **API key:** a key for an OpenAI-compatible endpoint that serves Apertus v1.5 8B, and the 70B for capturing a new form
  (it writes the catalogue of required entries once per form). The defaults point at the CSCS endpoint of Hack Apertus,
  which serves both; `LLM_BASE_URL` and `LLM_NAME` point it at another one (the 70B is set in the code).
- **Model weights:** none to download; the model is reached over the endpoint.

## Run it

From the folder `track_2b/`:

1. `cp .env.example .env` and put your key after `LLM_API_KEY=`.
2. `make run` (on Linux possibly `sudo make run`). The first build takes a few minutes; the log stays in the terminal
   and ends with `Trace listening on http://localhost:8080`.
3. Open **http://localhost:8080**. The app starts in German; the steps below give the labels in English and German.
   Under **Mehr** → **Sprache** it switches to English, French or Italian, and that is the language you speak or type
   in.
4. To see the flow first, without a model: **http://localhost:8080/?demo**, a walk-through with made-up values.
5. Fill a shipped form: press **+** (New / Neu), **Open form** (Formular öffnen), and pick one – *Austrittsmeldung* is
   the one-page test sheet. Press **Start listening** (Zuhören beginnen) and say what belongs in the form, all at once
   or question by question, or type the answer and press **Send** (Senden).
6. Check: every question shows the value taken and a state – ok, unclear or missing; tapping a value shows the words it
   came from, **Change** (Ändern) corrects it, and required entries the form's catalogue names are pointed out. Where
   you spoke another language than the form's, **Continue** (Weiter) translates the answers and you check them once
   more.
7. Send: the signature screen shows the filled original under **Open the PDF** (PDF öffnen); **Send** (Senden) hands it
   on for signature (the signature service is a mock).
8. Your own form: press **+** (Neu) and **Upload an image** (Bild hochladen) – a photo or a scan of each page – or, on a
   phone, **Photograph form** (Formular fotografieren). To try it with the test sheet, print
   `data/forms/austrittsmeldung/form.pdf` and photograph it, or upload
   `data/forms/austrittsmeldung/austrittsmeldung-s1.png`; the upload takes images, not PDFs. Capturing takes about a
   minute a page; the fields can then be corrected on the page, and the form is filled like a shipped one. A captured
   form is kept and opens again without the model.

`Ctrl+C` stops the app; the captured forms stay under `track_2b/storage/`.

### On a phone

The camera and the microphone of a phone need HTTPS. For trying it, open the app through a tunnel, for example
`cloudflared tunnel --url http://localhost:8080`, and open the address it prints on the phone. A tunnel of this kind
passes the traffic through its provider; in operation the app runs behind the organisation's own HTTPS.

## Input and output

- **In:** the pages of a form as images – a photo or a scan, any format the browser opens (JPEG, PNG, …); the
  browser finds the sheet in a photo and straightens it before it is sent. Speech recorded in the browser, or typed
  text, in the language the app is set to. A PDF is not taken as an upload: its pages go in as images.
- **Out:** a filled PDF. A shipped original gets the values in its own form fields; a photographed form becomes a new
  PDF of its pages with the values written at the fields. Where the person's language is not the form's, the values
  are translated into the form's language. The captured form itself is JSON in the form schema of `data/schema/`.

## The shipped forms

Two originals, unchanged (a debt enforcement request as the Canton of Grisons offers it for download, and the Suva
minor accident report), and three rebuilt after public forms (a certificate of fitness for work, an accident report to
the insurer, a notice of leaving a group insurance – the test sheet). All five are German. The originals remain the
property of their publishers; `data/forms/README.md` says where each comes from.

## How it works

Once per form – **capture**: the page image goes through a geometry without a model (lines, tinted areas, tick boxes,
empty cells, text blocks); Apertus 8B reads every element the geometry could not name, one element per call, each
reading checked against the image by the shape of its glyphs; labels, boxes and cells become fields, which a person can
correct on the page; the 8B writes one plain question per unit and checks it; Apertus 70B writes, once, a catalogue of
the required entries and their legal sources; the catalogues of the shipped forms are checked by hand against Fedlex,
the catalogue of a newly captured form is shown as unchecked. The captured form is kept and opens without the model.

Every time it is filled – **conversation and filling**: question by question or one free dictation, spoken or typed,
in the person's language; the 8B transcribes and maps the transcript to field values, each with the quoted words it
came from; the review shows every question with what was said and a state (ok, unclear, missing) and the hints of
the catalogue; where the person's language is not the form's, the answers are translated and code flags a
translation whose digits or names changed; the values go into the original's own form fields (a photograph becomes a
new PDF), and the form goes to its recipient for signature.

## Where data goes

Trace sends cuts of the page image, the recordings, transcripts and the form's labels to the model endpoint, and
nothing anywhere else. The app loads no fonts or scripts from outside.

## If something does not work

- **Nothing is read, no values appear:** the key is missing or wrong. Without a key the log says `no LLM_API_KEY: the
  reading step is skipped`; after changing `.env`, stop and start `make run` again.
- **The microphone or camera does not start:** the page is not on HTTPS (on a phone) or the browser was not allowed
  to use them.
- **Compose rejects `env_file`:** it is older than 2.24; update Docker.
- **Port 8080 is taken:** stop what uses it, or change the left side of `"8080:8080"` in `compose.yaml`.

## Limits

The signature is a mock: the form is not sent anywhere. The geometry is measured on rendered forms; on scans it finds
fewer fields (44 % on ten scans never seen before), so a scanned form needs more correcting on the page. Dialect is
not understood reliably. The shipped forms are German; others are captured from an image.

## Tests

`make test` runs on the host, without Docker, without a model and without the network (Node 20.6 or newer; run
`npm ci` first): the geometry over the shipped forms, measured against the text layer and the widgets of their PDFs,
and 323 checks. `make bench` reads the shipped pages with the model; `make dialogue` writes and checks their
questions. The logged runs are under `results/`.

## In this folder

| Path | What it is |
|---|---|
| `src/` | the server, the pipeline and the browser app (Node, no framework) |
| `data/forms/` | the shipped forms with their reference; `data/catalogues/` the catalogues; `data/schema/` the form schema |
| `docs/` | concept, evidence, tests |
| `results/` | the logged runs behind the numbers |
| `tests/`, `tools/` | the checks and measurements; the tools that build and capture the forms |

Licensed under Apache 2.0 (`../LICENSE`).

---

*Below: the text of the challenge template, as the organisers wrote it.*

# Track 2 B: Own Project

Bring your own idea and build a working Apertus prototype that tackles a problem you care about — any domain, any use case. The project must be new, started within the hackathon period.

Submissions must use the Apertus model family.
For Track 2 this means that submitted solutions must be built with Apertus. Other open-weights models can be used to support development, e.g. as automatic judges during evaluation. Their role must be clearly described in the submission report.

💬 In case you have questions, join the conversation on [Discord](https://discord.gg/hack-apertus) or send an email to “hello@hackapertus.ch”

---

## 🔧 Resources & Tools

Check our resources & tools page for detailed information:
https://hackapertus.notion.site/resources-tools

| Models           | URL                                      |
|------------------|------------------------------------------|
| Apertus v1.5 8B  | [huggingface.co/swiss-ai/Apertus-v1.5-8B](https://huggingface.co/swiss-ai/Apertus-v1.5-8B)  |
| Apertus v1.5 70B | [huggingface.co/swiss-ai/Apertus-v1.5-70B](https://huggingface.co/swiss-ai/Apertus-v1.5-70B) |


## Target architecture (mandatory)

Whatever you build in Track 2B must be deployable in one of these three architectures:

- **a) On-premise** — on the organisation's own infrastructure, under its own administration.
- **b) Air-gapped** — with no external network connection at runtime.
- **c) Sovereign Swiss cloud** — on a cloud platform operated in Switzerland, under Swiss jurisdiction, with Swiss data residency.

---

## Data

The `data/` directory must not exceed 100 MB.

---

## 📦 Submission Requirements & Deliverables

❗️ Submissions are not handled on Devpost but via this URL only:
http://hackapertus.ch/online-hack/submissions

The submission must: 
1. follow the template repo and include all prerequisite files and definitions
2. follow the specified input/output formats
3. run in a Docker container, launched with `make run` from the root of the project
4. run end-to-end when judges try to run it

### Git repo (URL)
- Create your repo from this template (**Use this template**) and work in the `track_2b/` challenge directory. Delete the other track challenge directories.
- Keep `track_2b/` as it is: don't rename it or move its files.
- Set the repo to PUBLIC (Settings --> Collaborators --> Manage Visibility)
- Submit the URL of YOUR Git repo.

### Technical Report (pdf)
- Update [technical_report.md](technical_report.md) in this repository with all the details for your submission.
- Upload a pdf of your technical report to this directory, named as `TeamName_Report.pdf`.
- Format: pdf, max. 6 pages
- Submit the pdf of the technical report.

### Demo video (URL)
- Max. 2 min demo video of your prototype

### Dataset (URL) - optional, depending on your project
Submitted datasets must comply with our guidelines for responsibly sourced datasets.

- Create a user account on Hugging Face
- Clone our dataset template on Hugging Face: https://huggingface.co/datasets/HackApertus/online_hack_template
- Complete the dataset card with all required information
- Upload your dataset. It should consist of the following components:
    - evaluation dataset (i.e. individual test cases)
    - model response dataset (i.e. the model response to each test case)
    - metadata file (i.e. additional information about each test case; where relevant, this file must contain instance-level licensing information) 
- Make sure your dataset access control is set to PUBLIC
- Provide the URL of _your_ data set


---

## ⚖️ Judging Criteria

1. Purposeful use of AI
2. Technical rigour
3. Value, cost & scalability
4. Sovereign deployability
5. Implementation feasibility

Judges use a Scale 0–5 per dimension.

---

## Support

**Licensing requirements**
Please check our Terms & Conditions (6. What you build is open source):
https://hackapertus.ch/terms-and-conditions

## FAQ
💡 https://hackapertus.ch/faq

## Contact
💬 In case you have questions, join the conversation on Discord or send an email to “hello@hackapertus.ch”
