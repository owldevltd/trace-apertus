// The languages the app speaks, by the names the prompts use (German, like the prompts), and the one rule
// behind a form that is filled in in another language than it is printed in: the person is asked and answers in
// their language, and the values are translated into the language of the form before it is sent.

export const LANGUAGE = { de: 'Deutsch', fr: 'Französisch', it: 'Italienisch', en: 'Englisch' };

// The language of the person, when it is not the language of the form; null when they are the same.
export function foreign( job ) {
    return job.language && job.language !== job.form.language && LANGUAGE[ job.language ] ? job.language : null;
}
