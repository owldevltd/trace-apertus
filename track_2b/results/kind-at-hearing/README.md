# Run: the kind of the field named at transcription

The run behind the entry "Does the model transcribe better when it is told the kind of the field?" in
`docs/tests.md`.

- `answers.json` – 19 made-up single answers: the form and the label of the field each one answers, the kind of
  that field, the text that is spoken and the value that has to come out of it. Written before the recordings
  were made.
- `audio/voice-a-<id>.mp3`, `audio/voice-b-<id>.mp3` – every answer spoken by two synthetic voices, the two of
  `results/dictation/`, in the format the app records (MP3, 16 kHz, mono) with 0.3 seconds of silence before and
  after; 1.7 to 8.2 seconds each.
- `calls/<group>/call-<k>.json` – every call to the model as the client logged it: the prompt, the model, the
  temperature, the duration, the status and the raw answer. The recording itself is not in the log, only its size.
  In the tag of a call the name of the synthetic voice is replaced by `voice-a` or `voice-b`; nothing else in a
  call is changed. The groups:
  - `voice-a-as-is/`, `voice-b-as-is/` – the 19 recordings of a voice with the transcription prompt as it is;
  - `voice-a-kind-named/`, `voice-b-kind-named/` – the same recordings with the kind named behind the prompt; in
    all four, call k is answer k of `answers.json`;
- `result.md` – every recording with both transcripts beside its value, and the counts.

How it was made: a recording is sent whole with the transcription prompt of the app as it was when the run was
made, the language stated and the labels of the form as a dictionary, and once more with one sentence behind that
prompt. For a single answer the sentence names the kind of the field: "In der Aufnahme wird eine Telefonnummer
genannt." For a dictation it names the kinds the model had returned for the form in the second wording of
`results/field-kinds/`: "In der Aufnahme können genannt werden: …". The 19 answers were sent one after the other, each
with voice-b as is and with the kind named, then with voice-a.

Eight more calls of the run, on two dictations and two single answers of a tester, are not kept here: their answers
are what a person said. `result.md` gives what was counted on them.
