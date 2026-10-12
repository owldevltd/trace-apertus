# Result: how long capturing and filling take

Measured on 12 October 2026 on a server of its own with swiss-ai/Apertus-v1.5-8B (the catalogue: swiss-ai/Apertus-v1.5-70B) at the CSCS endpoint, the pace of the queue as built: ten calls one after the other, then half a second. 463 calls, all answered. One run each. Machine: 8 cores (Intel i5-1135G7), 6.9 GB of memory.

## Capturing one page from an image

The first page of each shipped form as an image, chosen in the upload dialogue of the app in a browser; from choosing the file to the finished dialogue.

| page | fields built | total | in the browser, until the server has the page | geometry | reading (calls) | building fields | catalogue (one call, large model) | questions, checks, kinds (calls) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| austrittsmeldung-s1 | 20 | 51.0 s | 5.6 s | 1.5 s | 12.3 s (30) | 0.8 s | 21.0 s | 8.7 s (6) |
| betreibungsbegehren-form-1-s1 | 27 | 53.1 s | 7.4 s | 1.3 s | 16.1 s (42) | 1.0 s | 15.9 s | 10.2 s (6) |
| arbeitsfaehigkeitszeugnis-s1 | 97 | 84.5 s | 5.8 s | 1.3 s | 31.4 s (81) | 0.8 s | 25.9 s | 18.0 s (10) |
| schadenmeldung-uvg-s1 | 60 | 65.5 s | 7.1 s | 1.3 s | 23.4 s (68) | 1.0 s | 10.0 s | 20.8 s (10) |
| suva-bagatellunfall-uvg-s1 | 35 | 87.9 s | 9.5 s | 3.7 s | 37.7 s (73) | 2.3 s | 17.3 s | 15.4 s (8) |

The steps are taken from the state the app polls; the time at the model within them is in `calls.csv`. A reading call is answered in 0.3 s on average. The one call for the catalogue takes 10 to 26 s, 15 to 41 % of the capture.

## Filling a shipped form, up to the sent PDF

Dictation: one made-up dictation spoken by a synthetic voice, uploaded, transcribed, filled. Typed and clicked: every question answered in its order by typing, by tapping a box or a choice, or skipped. Then the review is closed, the PDF written and the form marked sent.

| run | fields | total | transcribing (1 call) | filling or answering (calls) | closing the review, writing the PDF, sending | calls | at the model |
|---|---:|---:|---:|---:|---:|---:|---:|
| austrittsmeldung, dictation, voice-a (30.6 s of recording) | 19 | 5.8 s | 2.6 s | 2.0 s (4) | 0.1 s | 5 | 4.1 s |
| austrittsmeldung, dictation, voice-b (29.6 s of recording) | 19 | 4.8 s | 2.5 s | 2.0 s (4) | 0.0 s | 5 | 3.9 s |
| austrittsmeldung, typed and clicked | 19 | 3.2 s | – | 3.1 s (11) | 0.0 s | 11 | 2.4 s |
| betreibungsbegehren, dictation, voice-a (39.7 s of recording) | 51 | 12.4 s | 3.5 s | 8.6 s (10) | 0.0 s | 11 | 10.8 s |
| betreibungsbegehren, dictation, voice-b (36.0 s of recording) | 51 | 11.5 s | 3.1 s | 8.1 s (10) | 0.0 s | 11 | 10.0 s |
| betreibungsbegehren, typed and clicked | 51 | 8.1 s | – | 7.9 s (14) | 0.0 s | 14 | 6.7 s |
| suva-bagatellunfall, dictation, voice-a (37.0 s of recording) | 37 | 16.8 s | 3.1 s | 12.8 s (18) | 0.0 s | 19 | 14.3 s |
| suva-bagatellunfall, dictation, voice-b (33.3 s of recording) | 37 | 16.8 s | 3.1 s | 13.3 s (17) | 0.0 s | 18 | 15.3 s |
| suva-bagatellunfall, typed and clicked | 37 | 13.7 s | – | 13.5 s (30) | 0.0 s | 30 | 11.4 s |

In a dictation run 5 to 10 of the calls are the judgements against the catalogue and the proposals, not the filling itself.
