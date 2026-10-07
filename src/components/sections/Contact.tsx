"use client";

import type { CSSProperties, FormEvent, ReactNode } from "react";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CONTACT_DETAILS, OPERATING_DIVISIONS } from "@/lib/constants";
import { useRevealOnce } from "@/lib/hooks";

const HEADING_LINES = [
  { text: "Get In", outlined: false },
  { text: "Touch", outlined: true },
] as const;

// Reveal choreography reuses the `.about-*` classes in globals.css; each
// element reads its stagger position from `--i`.
const slot = (index: number) => ({ "--i": index }) as CSSProperties;

// Mono label used above every value and field.
const LABEL =
  "font-mono text-[11px] font-medium uppercase tracking-[0.18em]";

/**
 * One ruled-line field. The label sits above (never a placeholder), and a
 * copper rule draws left to right under the input while it has focus: slow in
 * (deliberate), quick out. Focus is shown by that rule and the label turning
 * copper, both well past 3:1 on the ink sheet.
 */
function Field({
  id,
  label,
  optional,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="group">
      <label
        htmlFor={id}
        className={`${LABEL} block text-paper-100 transition-colors duration-200 ease-engineered group-focus-within:text-copper-300`}
      >
        {label}
        {optional && (
          <span className="ml-2 font-body text-xs font-normal normal-case tracking-normal text-paper-100/70">
            (optional)
          </span>
        )}
      </label>
      <div className="relative mt-1">
        {children}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-copper-300 transition-transform duration-[140ms] ease-engineered group-focus-within:scale-x-100 group-focus-within:duration-500"
        />
      </div>
      {error && (
        <p role="alert" className="mt-2 hidden font-body text-sm text-copper-300 group-has-[:user-invalid]:block">
          {error}
        </p>
      )}
    </div>
  );
}

const INPUT =
  "block w-full appearance-none rounded-none border-0 border-b border-paper-100/40 bg-transparent px-0 py-3 font-body text-lg text-paper-50 placeholder:text-paper-100/60 focus:outline-none [&:-webkit-autofill]:[-webkit-text-fill-color:rgb(var(--paper-50))] [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_rgb(var(--ink-950))]";

export function Contact() {
  const [headerRef, headerRevealed] = useRevealOnce<HTMLDivElement>();
  const [detailsRef, detailsRevealed] = useRevealOnce<HTMLDivElement>();
  const [formRef, formRevealed] = useRevealOnce<HTMLDivElement>();

  // TODO: enquiries are not wired up yet, so submitting does nothing. Native
  // validation still runs first, so required fields are still enforced.
  const onSubmit = (event: FormEvent<HTMLFormElement>) => event.preventDefault();

  return (
    <section
      aria-labelledby="contact-heading"
      className="relative pb-24 pt-24 lg:pb-32 lg:pt-36"
    >
      <div className="site-container">
        <div ref={headerRef} data-revealed={headerRevealed}>
          <h2
            id="contact-heading"
            className="font-display font-extrabold uppercase leading-[0.92] tracking-tight"
            style={{ fontSize: "clamp(3.5rem, 0.5rem + 11vw, 9.5rem)" }}
          >
            {HEADING_LINES.map((line, index) => (
              <span key={line.text} className="block overflow-hidden pb-2">
                <span
                  style={slot(index)}
                  className={
                    line.outlined
                      ? "about-line block text-transparent [-webkit-text-stroke:2px_rgb(var(--ink-950))]"
                      : "about-line block text-ink-950"
                  }
                >
                  {line.text}
                </span>
              </span>
            ))}
          </h2>

          <p
            style={slot(2)}
            className="about-item mt-8 max-w-[44ch] font-body text-lg font-semibold leading-relaxed text-ink-950 sm:text-xl"
          >
            Connect with APM Groups of Company corporate management and subsidiary divisions.
          </p>
        </div>

        <div className="mt-16 grid items-start gap-12 lg:mt-24 lg:grid-cols-12 lg:gap-16">
          {/* Registered office, set as the title block of a drawing sheet:
              ruled cells, a mono label in each, the values in display type.
              The two live rows fill with ink from the left on hover. */}
          <div className="lg:col-span-5">
            <div
              ref={detailsRef}
              data-revealed={detailsRevealed}
              className="border border-ink-950"
            >
              <div style={slot(0)} className="about-item border-b border-ink-950 p-5 lg:p-6">
                <h3 className={LABEL}>Registered Corporate Office</h3>
                <p className="mt-3 font-display text-2xl font-extrabold uppercase leading-[1.05] tracking-tight sm:text-3xl">
                  {CONTACT_DETAILS.entity}
                </p>
              </div>

              <div style={slot(1)} className="about-item border-b border-ink-950 p-5 lg:p-6">
                <p className={LABEL}>Official Address</p>
                <address className="mt-3 font-body text-lg not-italic font-semibold leading-snug">
                  {CONTACT_DETAILS.address}
                </address>
              </div>

              <div style={slot(2)} className="about-item border-b border-ink-950">
                <a
                  href={CONTACT_DETAILS.website.href}
                  className="group relative isolate flex items-center justify-between gap-4 overflow-hidden p-5 transition-colors duration-300 ease-engineered hover:text-paper-50 focus-visible:text-paper-50 lg:p-6"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 origin-right scale-x-0 bg-ink-950 transition-transform duration-[280ms] ease-engineered group-hover:origin-left group-hover:scale-x-100 group-focus-visible:origin-left group-focus-visible:scale-x-100"
                  />
                  <span className="min-w-0">
                    <span className={`${LABEL} block`}>Website</span>
                    <span className="mt-3 block font-display text-2xl font-bold uppercase leading-tight tracking-tight lg:text-xl xl:text-3xl">
                      {CONTACT_DETAILS.website.label}
                    </span>
                  </span>
                  <ArrowUpRight
                    size={28}
                    strokeWidth={1.5}
                    aria-hidden="true"
                    className="shrink-0 transition-transform duration-300 ease-engineered group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </a>
              </div>

              <div style={slot(3)} className="about-item">
                <a
                  href={`mailto:${CONTACT_DETAILS.email}`}
                  className="group relative isolate flex items-center justify-between gap-4 overflow-hidden p-5 transition-colors duration-300 ease-engineered hover:text-paper-50 focus-visible:text-paper-50 lg:p-6"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 origin-right scale-x-0 bg-ink-950 transition-transform duration-[280ms] ease-engineered group-hover:origin-left group-hover:scale-x-100 group-focus-visible:origin-left group-focus-visible:scale-x-100"
                  />
                  <span className="min-w-0">
                    <span className={`${LABEL} block`}>Email Enquiry</span>
                    <span className="mt-3 block break-words font-display text-xl font-bold leading-tight tracking-tight sm:text-2xl [overflow-wrap:anywhere]">
                      {CONTACT_DETAILS.email}
                    </span>
                  </span>
                  <ArrowUpRight
                    size={28}
                    strokeWidth={1.5}
                    aria-hidden="true"
                    className="shrink-0 transition-transform duration-300 ease-engineered group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </a>
              </div>
            </div>
          </div>

          {/* The enquiry sheet: the one ink surface on the copper panel, so
              the form is where the eye lands. Registration marks at two
              corners echo the logomark. */}
          <div className="lg:col-span-7">
            <div
              ref={formRef}
              data-revealed={formRevealed}
              className="on-ink relative"
            >
              <div style={slot(0)} className="about-item relative bg-ink-950 p-6 text-paper-50 sm:p-10 lg:p-12">
                <span
                  aria-hidden="true"
                  className="absolute -left-px -top-px h-5 w-5 border-l-2 border-t-2 border-copper-300"
                />
                <span
                  aria-hidden="true"
                  className="absolute -bottom-px -right-px h-5 w-5 border-b-2 border-r-2 border-copper-300"
                />

                <h3 className="font-display text-3xl font-extrabold uppercase leading-none tracking-tight sm:text-4xl">
                  Corporate Enquiry
                </h3>
                <p className="mt-4 max-w-[48ch] font-body text-base leading-relaxed text-paper-100">
                  Complete the enquiry form below to connect directly with APM Groups executive
                  management.
                </p>

                <form onSubmit={onSubmit} className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <Field id="enquiry-name" label="Your Name" error="Enter your full name.">
                    <input
                      id="enquiry-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      placeholder="Full name"
                      className={INPUT}
                    />
                  </Field>

                  <Field id="enquiry-email" label="Business Email" error="Enter a valid email address.">
                    <input
                      id="enquiry-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="name@company.com"
                      className={INPUT}
                    />
                  </Field>

                  <Field id="enquiry-phone" label="Contact Phone" optional>
                    <input
                      id="enquiry-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="Contact number"
                      className={INPUT}
                    />
                  </Field>

                  <Field id="enquiry-division" label="Operating Division" error="Choose a division.">
                    <select
                      id="enquiry-division"
                      name="division"
                      required
                      defaultValue="corporate"
                      className={`${INPUT} cursor-pointer pr-8`}
                    >
                      <option value="corporate" className="bg-ink-950 text-paper-50">
                        APM Groups (Corporate)
                      </option>
                      {OPERATING_DIVISIONS.map((division) => (
                        <option key={division.name} value={division.name} className="bg-ink-950 text-paper-50">
                          {division.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={20}
                      strokeWidth={1.5}
                      aria-hidden="true"
                      className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-copper-300"
                    />
                  </Field>

                  <div className="sm:col-span-2 lg:col-span-1 xl:col-span-2">
                    <Field
                      id="enquiry-message"
                      label="Message / Scope of Interest"
                      error="Tell us what you are enquiring about."
                    >
                      <textarea
                        id="enquiry-message"
                        name="message"
                        rows={5}
                        required
                        placeholder="Please outline your partnership requirements or inquiry"
                        className={`${INPUT} resize-none`}
                      />
                    </Field>
                  </div>

                  <div className="flex flex-col gap-5 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between lg:col-span-1 xl:col-span-2">
                    <p className="font-body text-sm text-paper-100">
                      All inquiries are processed promptly.
                    </p>
                    <Button type="submit" variant="light" size="md" className="group w-full sm:w-auto">
                      Send Corporate Enquiry
                      <span aria-hidden="true" className="cta-arrow inline-block">
                        →
                      </span>
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
