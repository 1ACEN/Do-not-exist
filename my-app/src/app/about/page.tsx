"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">🌘 About Us — Healthcare Eclipse</h1>

      <p className="text-lg text-slate-700 mb-6 leading-relaxed">
        In a world where health challenges often remain hidden until it’s too late, Healthcare Eclipse was
        born with one mission — to bring the unseen to light. Many life-altering conditions like diabetes,
        hypertension, thyroid disorders, and mental health issues quietly develop beneath the surface,
        showing no early warning signs. Much like an eclipse that hides part of the sun, these “silent
        diseases” obscure vital health truths until they emerge as crises.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-3">🌿 Our Vision</h2>
      <p className="text-slate-700 mb-4">To create a world where no disease remains invisible — where every
      individual has the tools, insights, and support to understand and act on their health before it’s
      too late.</p>

      <h2 className="text-xl font-semibold mt-6 mb-3">💡 Our Mission</h2>
      <p className="text-slate-700 mb-4">To empower people, doctors, and researchers with an intelligent,
      unified platform that transforms everyday health data into early-warning signals and actionable
      insights.</p>

      <h2 className="text-xl font-semibold mt-6 mb-3">🔍 What We Do</h2>
      <p className="text-slate-700 mb-4">Healthcare Eclipse integrates three core components into one
      intelligent ecosystem:</p>

      <ul className="list-disc pl-6 text-slate-700 space-y-3">
        <li>
          <strong>🧠 The Client — Health Logger App</strong>
          <div className="text-sm text-slate-600">A personal health companion that lets users log daily
          vitals, track mood and stress, and complete self-assessments — building a detailed picture of
          their well-being.</div>
        </li>

        <li>
          <strong>🤖 The Detective — AI Early Warning Core</strong>
          <div className="text-sm text-slate-600">Our AI engine acts as a digital health detective,
          analyzing data to uncover subtle trends and early indicators of health risks. Using advanced
          machine learning and predictive analytics, it forecasts potential threats and recommends
          preventive actions.</div>
        </li>

        <li>
          <strong>👩‍⚕️ The Analyst — Doctor Dashboard</strong>
          <div className="text-sm text-slate-600">An interactive and secure interface where healthcare
          professionals can visualize patient data, review AI insights, and make informed decisions with
          greater clarity and confidence.</div>
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-3">📊 Why It Matters</h2>
      <p className="text-slate-700 mb-4">Every year, millions of people suffer because diseases go
      unnoticed until advanced stages. Healthcare Eclipse changes this narrative by:</p>

      <ul className="list-disc pl-6 text-slate-700 mb-4">
        <li>Detecting risks early through intelligent data analysis</li>
        <li>Enabling proactive lifestyle and medical interventions</li>
        <li>Strengthening communication between patients and doctors</li>
        <li>Promoting awareness and consistency in self-care</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-3">⚙️ Our Technology</h2>
      <p className="text-slate-700 mb-4">We combine data analytics, machine learning, and real-time
      monitoring to build a system that not only tracks health but understands it. From anomaly detection
      to personalized preventive recommendations, our AI learns and evolves with every data point,
      ensuring smarter and more accurate predictions over time.</p>

      <h2 className="text-xl font-semibold mt-6 mb-3">🌍 Our Impact</h2>
      <p className="text-slate-700 mb-4">Healthcare Eclipse isn’t just an app — it’s a movement towards a
      healthier, more informed world. By bridging the gap between human intuition and artificial
      intelligence, we’re creating a future where healthcare is predictive, not reactive.</p>

      <h2 className="text-xl font-semibold mt-6 mb-3">💬 Our Motto</h2>
      <p className="text-slate-700 mb-6 italic">“Because what you can’t see can still change your life —
      let’s bring it to light.”</p>

      <div className="mt-6">
        <Link href="/contact" className="inline-block rounded-md bg-[var(--accent)] text-white px-4 py-2 hover:bg-[var(--accent-hover)] transition-colors">Get in touch</Link>
      </div>
    </div>
  );
}
