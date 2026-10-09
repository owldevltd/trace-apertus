# Concept

Trace — capture, structure, verify. Hack Apertus 2026, Track 2B.

## The problem

In Switzerland people speak dialect and write High German. Every piece of documentation is a translation, and today
a person does it by hand: a technician after a job, a nurse after a shift, an employer after an accident, a creditor
filing a claim. The forms are prescribed by someone else (an authority, a social insurance, an insurer); whoever has
to fill them cannot change them. The content is confidential and must not leave the company or the country.

## The idea

Photograph the paper form, put the phone down, say what happened while doing something else, pick the phone up:
every field is filled, with a note wherever a person should look again. Send it for signature. Done.

Trace reads the form into fields, listens to free speech, maps what was said onto the fields, and asks a person to
verify before anything leaves the device. It never says "this is not allowed"; it says "please look here".

## Why Apertus

- It can run inside the company, in Switzerland. A closed model cannot.
- It understands images and speech, so one model carries the whole flow.
- It was trained mainly on freely available Swiss documents (as stated by the organisers), including legislation.

## Theses

- **T1 Feasibility.** An open, locally deployable model can split a photographed form into fields and fill them from
  free speech well enough that a person checks instead of writes.
- **T2 Completeness.** Hints reduce incomplete documentation when the program reports empty fields and the model only
  judges whether an entry is sufficient.
- **T3 Hint flood.** A small network that learns from what a whole organisation dismisses lowers false alarms without
  evaluating individuals.
- **T4 Sovereignty.** Operation on the company's own hardware is possible when a large model delivers the references once
  and a small model works with them.

## Principles

- **The person decides.** Trace does not give legal advice; every hint is a request to look.
- **No evaluation of individuals.** Learning only from the sum.
- **Mandatory hints are never switched off by the network.** It asks the responsible person; the decision is recorded
  with name and date.
- **Local.** Data stays in the company.
- **Geometry first, the model only reads.** Everything that is position, line, box or field is found without a model;
  the model reads text and listens. Where the model guesses, the program marks it.
- **Every value carries its origin.** Which transcript piece it rests on, whether it stands there literally, and what
  the reviewer decided.

## Use case

Two fields were chosen from a survey of nine industries: forms prescribed by authorities, seen from the side of those
who must fill them, and health care (nursing and physicians), where a quarter of the working time goes into
documentation. The common denominator: forms someone else prescribes. The demo shows one of each.

## Flow

1. **Capture.** Photo of the paper form, or a PDF.
2. **Structure.** The page is split into elements by geometry; the model reads the text of each element (a form
   that ships with the app was captured beforehand, from the text of its PDF); labels and boxes become fields. The fields are grouped into units, and the model writes one plain question per unit and
   checks it twice, so the form can be asked as a conversation; where no question holds, the printed label stays.
   A form that is not one of the shipped ones also gets its catalogue of requirements here, from the large model
   and unchecked, so that its fields have hints; every hint from it says that nobody checked it.
3. **Verify the form.** The person sees the fields in a list and on the page. What the program itself doubts is
   marked red: a label the model read and the shape check does not believe, a field without any label. Every
   field can be corrected by hand, red or not: its label and kind, the question it is asked with, whether it is
   required; on the page it is moved, with a mouse also sized, a field that is none is unticked and a missing
   one is added. Saving puts the form together anew and keeps it as a form of its own, to be filled in again;
   the same mask opens later from any saved form.
4. **Dictate.** Free speech, recorded on the device, cut at silence, sent in pieces; or the questions one by one,
   typed or spoken. Spoken, it is a conversation: the microphone stays open at the question, an answer ends at a
   pause, and the next question is asked.
5. **Fill.** The model maps the transcript onto the fields; every value points at its words. An answer to one
   question goes into the fields of that question only, and the model says whether it covers what was asked.
6. **Review.** Each question with what was said, a status (ok, unclear, missing), hints from a catalogue of legal
   requirements built once per form by the large model. Nothing has to be answered: the person goes on when it is
   enough for them, and what was left open stays empty. What the form requires is marked at its question from the
   start; what of it is still empty is a warning before sending, not a lock.
7. **Translate**, only where the person's language is not the form's. The form is asked and answered in the
   person's language; its questions are translated once, when it is first opened in that language. Before
   sending, the answers are translated into the language of the form, each shown with what was said beside it,
   and code flags a translation whose digits or names no longer match.
8. **Send.** The filled PDF goes to the recipient for signature.

## Decision rule

An idea is right only when three gates are green: the hackathon likes it, the jury likes it, and a company observer
would hire the team for it.
