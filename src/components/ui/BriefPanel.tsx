'use client';

import { useId, useState, type FormEvent } from 'react';
import { CONTACT } from '@/data/agency';
import { Arrow, Fade, Label, Line } from './Type';
import { useUI } from './UIProvider';

const field =
  'w-full border-b border-line bg-transparent py-3 font-sans text-base text-bone placeholder:text-smoke transition-colors duration-500 focus:border-signal focus:outline-none';

const chip = (selected: boolean) =>
  `label rounded-full border px-4 py-2.5 transition-colors duration-300 ${
    selected ? 'border-signal bg-signal font-bold text-void' : 'border-line text-bone/80 hover:border-bone/60'
  }`;

/**
 * The project brief. There is no server behind this site, so the brief is
 * composed into an email addressed to the studio and handed to the visitor's
 * mail client — nothing is pretended to have been sent.
 */
export function BriefPanel() {
  const { briefOpen, setBriefOpen } = useUI();
  const id = useId();
  const [types, setTypes] = useState<string[]>([CONTACT.projectTypes[0]]);
  const [budget, setBudget] = useState(CONTACT.budgets[1]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');

  const toggleType = (type: string) =>
    setTypes((current) =>
      current.includes(type)
        ? current.length > 1
          ? current.filter((item) => item !== type)
          : current
        : [...current, type],
    );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const subject = `Project brief — ${company.trim() || name.trim()}`;
    const body = [
      `Name: ${name.trim()}`,
      `Email: ${email.trim()}`,
      ...(company.trim() ? [`Company: ${company.trim()}`] : []),
      `Project type: ${types.join(', ')}`,
      `Investment range: ${budget}`,
      '',
      message.trim(),
    ].join('\n');
    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${id}-title`}
      data-active={briefOpen}
      inert={!briefOpen}
      className={`fixed inset-0 z-[140] transition-[visibility] duration-700 ${briefOpen ? 'visible' : 'invisible'}`}
    >
      <button
        type="button"
        aria-label="Close brief"
        onClick={() => setBriefOpen(false)}
        className={`absolute inset-0 h-full w-full cursor-default bg-void/70 backdrop-blur-sm transition-opacity duration-700 ${
          briefOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div
        data-lenis-prevent
        className={`absolute inset-y-0 right-0 w-full max-w-2xl overflow-y-auto border-l border-line bg-ink/95 backdrop-blur-2xl transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          briefOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="px-5 pb-12 pt-6 sm:px-12 sm:pt-8">
          <div className="flex items-center justify-between">
            <Label className="text-signal">{CONTACT.eyebrow}</Label>
            <button
              type="button"
              onClick={() => setBriefOpen(false)}
              className="label rounded-full border border-line px-5 py-3 transition-colors duration-500 hover:border-bone/60"
            >
              Close
            </button>
          </div>

          <h2 id={`${id}-title`} className="mt-10">
            <Line index={0}>
              <span className="display block text-4xl sm:text-6xl">{CONTACT.headlineOne}</span>
            </Line>
            <Line index={1}>
              <span className="accent block text-4xl text-signal sm:text-6xl">{CONTACT.headlineTwo}</span>
            </Line>
          </h2>

          <form onSubmit={submit} className="mt-10 space-y-9">
            <Fade index={3} className="space-y-3">
              <Label className="block text-ash">01 — Project type (select any)</Label>
              <div className="flex flex-wrap gap-2">
                {CONTACT.projectTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={types.includes(type)}
                    onClick={() => toggleType(type)}
                    className={chip(types.includes(type))}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </Fade>

            <Fade index={4} className="space-y-3">
              <Label className="block text-ash">02 — Estimated investment range</Label>
              <div className="flex flex-wrap gap-2">
                {CONTACT.budgets.map((range) => (
                  <button
                    key={range}
                    type="button"
                    aria-pressed={budget === range}
                    onClick={() => setBudget(range)}
                    className={chip(budget === range)}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </Fade>

            <Fade index={5} className="grid gap-7 sm:grid-cols-2">
              <label className="block">
                <Label className="text-ash">Your name *</Label>
                <input
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={field}
                />
              </label>
              <label className="block">
                <Label className="text-ash">Business email *</Label>
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={field}
                />
              </label>
              <label className="block sm:col-span-2">
                <Label className="text-ash">Company / venture name</Label>
                <input
                  autoComplete="organization"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  className={field}
                />
              </label>
              <label className="block sm:col-span-2">
                <Label className="text-ash">Your project vision &amp; timeline *</Label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Tell us about the challenge, target audience, and ideal launch timeline..."
                  className={`${field} resize-none`}
                />
              </label>
            </Fade>

            <Fade index={6} className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <button
                type="submit"
                className="label flex items-center gap-3 rounded-full bg-bone px-8 py-4 font-bold text-void transition-colors duration-500 hover:bg-signal"
              >
                Compose brief <Arrow />
              </button>
              <p className="max-w-xs text-xs leading-relaxed text-ash">
                Opens your email app with the brief addressed to {CONTACT.email}.
              </p>
            </Fade>
          </form>

          <Fade index={7} className="mt-14 grid gap-8 border-t border-line pt-8 sm:grid-cols-2">
            <div>
              <Label className="text-signal">{CONTACT.callTitle}</Label>
              <p className="mt-3 text-sm leading-relaxed text-bone/75">{CONTACT.callBody}</p>
              <a
                href={`mailto:${CONTACT.partnersEmail}?subject=${encodeURIComponent(CONTACT.callTitle)}`}
                className="label link mt-4 text-bone"
              >
                Request a call <Arrow diagonal />
              </a>
            </div>
            <dl className="space-y-4">
              {[
                ['Direct email', CONTACT.partnersEmail, `mailto:${CONTACT.partnersEmail}`],
                ['Berlin lab phone', CONTACT.phone, `tel:${CONTACT.phoneHref}`],
                ['Press & honors', CONTACT.pressEmail, `mailto:${CONTACT.pressEmail}`],
              ].map(([term, value, href]) => (
                <div key={term}>
                  <dt className="label text-smoke">{term}</dt>
                  <dd className="mt-1">
                    <a href={href} className="font-mono text-sm text-bone transition-colors hover:text-signal">
                      {value}
                    </a>
                  </dd>
                </div>
              ))}
            </dl>
          </Fade>
        </div>
      </div>
    </div>
  );
}
