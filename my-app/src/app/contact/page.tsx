"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      return setError("Please fill in all fields.");
    }

    // basic email validation
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return setError("Please provide a valid email address.");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error || "Failed to send message");
      }
      setSuccess("Message sent — we'll get back to you shortly.");
      setName("");
      setEmail("");
      setMessage("");
    } catch (e: any) {
      setError(e?.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl py-12 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg text-slate-700 mb-6 leading-relaxed">Have a question, want to partner, or need support with the platform? We’d love to hear from you.
            Fill out the form and our team will respond as soon as possible — typically within 48 hours.</p>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-2">Need faster help?</h2>
            <p className="text-sm text-slate-600 mb-4">For urgent inquiries about patient data or critical issues, please include "URGENT" in your message subject line and provide relevant details so we can prioritize.</p>
            <p className="text-sm text-slate-600">You can also visit our <Link href="/about" className="text-[var(--accent)] underline">About</Link> page to learn more about Healthcare Eclipse.</p>
          </div>
        </div>

        <div>
          <form onSubmit={submit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
            {success && <div className="rounded-md bg-green-50 p-3 text-green-800">{success}</div>}
            {error && <div className="rounded-md bg-red-50 p-3 text-red-800">{error}</div>}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full name</label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" placeholder="Jane Doe" />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" placeholder="your@email.com" />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-700">Message</label>
              <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2 h-40 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" placeholder="How can we help?" />
            </div>

            <div className="flex items-center justify-between">
              <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-[var(--accent)] text-white px-4 py-2 hover:bg-[var(--accent-hover)] transition-colors" disabled={loading}>
                {loading ? 'Sending...' : 'Send Message'}
              </button>
              <div className="text-xs text-slate-500">We respect your privacy — your message is confidential.</div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
