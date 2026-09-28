import React, { useState } from 'react';
import { ArrowUpRight, CheckCircle2, Send, Sparkles, AlertCircle } from 'lucide-react';
import { SoundEngine } from '../../lib/audio';
import confetti from 'canvas-confetti';

const PROJECT_TYPES = [
  'AI & Intelligent Agents',
  'WebGL & 3D Experience',
  'Digital Product & UI/UX',
  'Kinetic Brand System',
  'Full-Stack Architecture'
];

const BUDGET_RANGES = [
  '$25k — $50k',
  '$50k — $100k',
  '$100k — $250k',
  '$250k+'
];

export const ContactSection: React.FC = () => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([PROJECT_TYPES[0]]);
  const [selectedBudget, setSelectedBudget] = useState<string>(BUDGET_RANGES[1]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const toggleType = (type: string) => {
    SoundEngine.playTick(1500);
    if (selectedTypes.includes(type)) {
      if (selectedTypes.length > 1) {
        setSelectedTypes(selectedTypes.filter(t => t !== type));
      }
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleSelectBudget = (b: string) => {
    SoundEngine.playTick(1600);
    setSelectedBudget(b);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please provide a valid business email address.');
      return;
    }
    if (!message.trim()) {
      setErrorMessage('Please write a brief summary of your vision.');
      return;
    }

    setIsSubmitting(true);
    SoundEngine.playTick(1200);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      SoundEngine.playBlast();
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.7 },
        colors: ['#ff5500', '#111111', '#3388ff']
      });
    }, 1100);
  };

  return (
    <section
      id="contact"
      className="relative w-full bg-[#fbfbfd] text-neutral-900 py-24 md:py-36 px-5 sm:px-8 md:px-12 border-t border-neutral-200 select-none"
    >
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-200 pb-8 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-orange-600 mb-2 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>START A CONVERSATION</span>
            </div>
            <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tight text-neutral-900 leading-none">
              Ready to build<br />
              <span className="text-orange-600 font-sans italic font-normal tracking-normal lowercase">
                something bold?
              </span>
            </h2>
          </div>
          <div className="max-w-sm space-y-2">
            <p className="text-xs font-mono text-neutral-500 leading-relaxed uppercase font-semibold">
              // BUSINESS ENQUIRY // DIRECT LINE:
            </p>
            <p className="text-lg font-mono text-neutral-900 hover:text-orange-600 transition-colors font-bold">
              hello@kinetik-studios.com
            </p>
            <p className="text-xs font-mono text-neutral-400">
              AVERAGE RESPONSE TIME: &lt; 4 HOURS
            </p>
          </div>
        </div>

        {/* Contact Form & Inquiries Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Form */}
          <div className="lg:col-span-8">
            {isSuccess ? (
              <div className="p-10 rounded-2xl border border-emerald-500/40 bg-emerald-50 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-display text-3xl font-bold uppercase text-neutral-900">
                  Inquiry Transmitted.
                </h3>
                <p className="text-sm font-sans text-neutral-600 max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="text-neutral-900 font-semibold">{name}</span>. Our partners will review your brief and follow up within 4 hours.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsSuccess(false);
                    setMessage('');
                  }}
                  className="px-6 py-2.5 rounded-full border border-neutral-300 bg-white text-xs font-mono uppercase tracking-wider text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer shadow-sm font-semibold"
                >
                  SEND ANOTHER MESSAGE
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Project Type Pills */}
                <div className="space-y-3">
                  <label className="block text-xs font-mono uppercase tracking-widest text-neutral-500 font-bold">
                    01 // SELECT PROJECT ARCHETYPE (MULTIPLE ALLOWED)
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {PROJECT_TYPES.map((type) => {
                      const isSelected = selectedTypes.includes(type);
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => toggleType(type)}
                          className={`px-4 py-2.5 rounded-full text-xs font-mono tracking-wider uppercase transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-neutral-900 text-white font-semibold shadow-md'
                              : 'bg-white border border-neutral-300 text-neutral-600 hover:border-neutral-500 hover:text-neutral-900'
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Budget Range Pills */}
                <div className="space-y-3">
                  <label className="block text-xs font-mono uppercase tracking-widest text-neutral-500 font-bold">
                    02 // ESTIMATED INVESTMENT RANGE
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {BUDGET_RANGES.map((range) => {
                      const isSelected = selectedBudget === range;
                      return (
                        <button
                          key={range}
                          type="button"
                          onClick={() => handleSelectBudget(range)}
                          className={`px-4 py-2.5 rounded-full text-xs font-mono tracking-wider uppercase transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-orange-500 text-black font-bold shadow-md'
                              : 'bg-white border border-neutral-300 text-neutral-600 hover:border-neutral-500 hover:text-neutral-900'
                          }`}
                        >
                          {range}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Input Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="contact-name" className="block text-xs font-mono uppercase tracking-widest text-neutral-500 font-semibold">
                      YOUR NAME *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Elena Rostova"
                      className="w-full px-5 py-3.5 rounded-xl bg-white border border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors font-sans text-sm shadow-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="contact-email" className="block text-xs font-mono uppercase tracking-widest text-neutral-500 font-semibold">
                      BUSINESS EMAIL *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="elena@company.com"
                      className="w-full px-5 py-3.5 rounded-xl bg-white border border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors font-sans text-sm shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-company" className="block text-xs font-mono uppercase tracking-widest text-neutral-500 font-semibold">
                    COMPANY / VENTURE NAME
                  </label>
                  <input
                    id="contact-company"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Synapse Neurotech"
                    className="w-full px-5 py-3.5 rounded-xl bg-white border border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors font-sans text-sm shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-message" className="block text-xs font-mono uppercase tracking-widest text-neutral-500 font-semibold">
                    YOUR PROJECT VISION &amp; TIMELINE *
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about the challenge, target audience, and ideal launch timeline..."
                    className="w-full px-5 py-3.5 rounded-xl bg-white border border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors font-sans text-sm resize-none shadow-sm"
                  />
                </div>

                {errorMessage && (
                  <div className="flex items-center space-x-2 text-xs font-mono text-rose-600 bg-rose-50 border border-rose-200 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative flex items-center space-x-3 px-8 py-4 rounded-full bg-neutral-900 text-white font-semibold text-xs font-mono uppercase tracking-wider hover:bg-orange-500 hover:text-black transition-all cursor-pointer shadow-xl disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'TRANSMITTING BRIEF...' : 'TRANSMIT PROJECT BRIEF'}</span>
                  <Send className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            )}
          </div>

          {/* Right Info Column */}
          <div className="lg:col-span-4 p-8 rounded-2xl border border-neutral-200 bg-white shadow-lg space-y-8">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 font-bold">
                // BOOK INSTANT INTRO //
              </span>
              <h4 className="font-display text-xl font-bold uppercase text-neutral-900">
                30-Minute Architecture Call
              </h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Prefer an exploratory sync? Book a 30-minute introductory architecture session directly with our creative director.
              </p>
              <div className="pt-2">
                <a
                  href="#contact"
                  onClick={() => SoundEngine.playTick()}
                  className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-orange-600 hover:text-orange-500 font-bold"
                >
                  <span>SCHEDULE ON CALENDLY</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-200 space-y-4 text-xs font-mono text-neutral-600">
              <div>
                <span className="text-neutral-400 uppercase block font-semibold">DIRECT EMAIL:</span>
                <span className="text-neutral-900 font-bold">partners@kinetik-studios.com</span>
              </div>
              <div>
                <span className="text-neutral-400 uppercase block font-semibold">BERLIN LAB PHONE:</span>
                <span className="text-neutral-900 font-bold">+49 (0) 30 8920 4410</span>
              </div>
              <div>
                <span className="text-neutral-400 uppercase block font-semibold">PRESS &amp; HONORS:</span>
                <span className="text-neutral-900 font-bold">press@kinetik-studios.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
