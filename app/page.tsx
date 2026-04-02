// app/page.tsx
import Link from "next/link";
import { Zap, CheckCircle2, Sparkles, Star } from "lucide-react";
import {
  Eye, FlaskConical, Brush, Radio,
  Mail, Calendar, RefreshCw,
} from "lucide-react";

const AGENTS = [
  { name: "ORACLE",    role: "Research & Intelligence", icon: Eye,         color: "#6366f1", desc: "Deep market intelligence, competitor monitoring, ICP refinement, and intent signal aggregation across 40+ data sources." },
  { name: "ARCHITECT", role: "Experiment Design",       icon: FlaskConical,color: "#8b5cf6", desc: "Statistical experiment design, hypothesis generation, variable isolation, and significance testing for all campaign elements." },
  { name: "CREATOR",   role: "Creative Generation",     icon: Brush,       color: "#ec4899", desc: "Multi-modal creative generation for ads, landing pages, emails, and video scripts with vertical-specific compliance guardrails." },
  { name: "SIGNAL",    role: "Audience Intelligence",   icon: Radio,       color: "#f59e0b", desc: "Real-time audience segmentation, lookalike modeling, intent scoring, and suppression list management across all ad platforms." },
  { name: "REACH",     role: "Multi-Channel Outreach",  icon: Mail,        color: "#10b981", desc: "Automated multi-channel sequences across email, SMS, LinkedIn, and direct mail with dynamic personalization at scale." },
  { name: "CONVERT",   role: "Appointment Booking",     icon: Calendar,    color: "#3b82f6", desc: "AI-driven appointment setting with objection handling, qualification scoring, and calendar orchestration across team members." },
  { name: "LOOP",      role: "Continuous Learning",     icon: RefreshCw,   color: "#06b6d4", desc: "Closed-loop learning that continuously refines all other agents based on conversion outcomes, revenue attribution, and market shifts." },
];

const PLANS = [
  {
    name: "Starter", price: "$1,500", period: "/mo",
    desc: "For growing teams ready to automate revenue ops",
    features: ["3 Active Agents","1 Vertical","Up to 500 leads/mo","Basic compliance rules","Email + SMS outreach","Standard analytics"],
    highlight: false,
  },
  {
    name: "Growth", price: "$4,500", period: "/mo",
    desc: "Full agent suite for scaling revenue teams",
    features: ["All 7 Agents active","3 Verticals","Up to 5,000 leads/mo","Advanced compliance engine","Multi-channel outreach","Creative Studio","A/B experiment framework","Decision Audit log"],
    highlight: true,
  },
  {
    name: "Enterprise", price: "Custom", period: "",
    desc: "Unlimited scale with dedicated AI infrastructure",
    features: ["Unlimited agents & verticals","Unlimited leads","Custom compliance rules","Dedicated GPU inference","White-label options","SLA + dedicated CSM","Custom integrations","On-premise available"],
    highlight: false,
  },
];

const TESTIMONIALS = [
  { name: "Sarah Mitchell", role: "VP Marketing, CareFirst Insurance", avatar: "SM", quote: "APEX cut our cost-per-appointment from $680 to $290 in 6 weeks. The compliance engine alone saved us from three potential TCPA violations." },
  { name: "Daniel Reyes",   role: "CEO, Apex Legal Group",             avatar: "DR", quote: "We went from 12 qualified appointments per month to 61. The ORACLE agent identified a competitor gap we'd completely missed." },
  { name: "Karen Thompson", role: "Growth Director, SeniorCare Solutions", avatar: "KT", quote: "The Decision Audit feature gives us confidence the AI is making the right calls. Our compliance team loves the transparency." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 lg:px-8 py-4 border-b border-slate-800/50 bg-slate-950/90 backdrop-blur sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">APEX</span>
          <span className="hidden sm:inline text-slate-500 text-xs ml-1 bg-slate-800 px-2 py-0.5 rounded-full">AI Revenue OS</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
          {["Platform","Agents","Verticals","Pricing","Docs"].map(l => (
            <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
          ))}
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/dashboard" className="text-sm text-slate-300 hover:text-white px-3 py-1.5 transition-colors">Sign In</Link>
          <Link href="/dashboard" className="text-sm bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-1.5 rounded-lg font-medium transition-colors">Get Demo →</Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative px-6 lg:px-8 pt-20 pb-16 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-purple-500/5 pointer-events-none" />
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-3 py-1.5 rounded-full mb-6">
            <Sparkles size={12} />
            <span>New: LOOP Agent v2.0 — 40% faster model adaptation</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
            AI Agents That Actually<br />
            <span className="text-emerald-400">Generate Revenue</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            7 specialized AI agents working 24/7 to research, create, reach, qualify, and convert your ideal customers — with full compliance and explainability built in.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Link href="/dashboard" className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-8 py-3.5 rounded-xl text-base transition-colors text-center">
              Launch Dashboard →
            </Link>
            <button className="border border-slate-700 hover:border-slate-500 text-slate-300 font-medium px-8 py-3.5 rounded-xl text-base transition-colors">
              Watch 3-min Demo
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm text-slate-500">
            {["No long-term contracts","TCPA & HIPAA compliant","Live in 48 hours"].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-500" />{t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-y border-slate-800 bg-slate-900/50 py-6 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[["$2.4B+","Revenue Generated"],["94%","Avg. Show Rate"],["340%","Average ROAS Lift"],["48hrs","Time to First Lead"]].map(([v,l]) => (
            <div key={l}><div className="text-2xl font-bold text-white">{v}</div><div className="text-xs text-slate-500 mt-1">{l}</div></div>
          ))}
        </div>
      </div>

      {/* Agents */}
      <div className="px-6 lg:px-8 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">7 Specialized AI Revenue Agents</h2>
          <p className="text-slate-400">Each agent masters a specific part of your revenue engine, then coordinates with the others.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {AGENTS.map(agent => (
            <div key={agent.name} className="bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl p-5 transition-all hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: agent.color + "20" }}>
                <agent.icon size={18} style={{ color: agent.color }} />
              </div>
              <div className="font-bold text-white text-sm mb-0.5">{agent.name}</div>
              <div className="text-xs text-slate-500 mb-3">{agent.role}</div>
              <p className="text-xs text-slate-400 leading-relaxed">{agent.desc.slice(0, 90)}...</p>
            </div>
          ))}
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30 rounded-xl p-5 flex flex-col justify-center items-center text-center">
            <div className="text-2xl font-bold text-emerald-400 mb-1">+1</div>
            <div className="text-sm font-semibold text-white mb-1">Your Custom Agent</div>
            <div className="text-xs text-slate-400">Enterprise plans include custom agent development</div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="px-6 lg:px-8 py-16 bg-slate-900/30 border-y border-slate-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Simple, Outcome-Based Pricing</h2>
            <p className="text-slate-400">Pay for performance. Cancel anytime.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map(p => (
              <div key={p.name} className={`relative rounded-2xl p-6 border ${p.highlight ? "bg-emerald-500/10 border-emerald-500/40" : "bg-slate-900 border-slate-800"}`}>
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap">
                    Most Popular
                  </div>
                )}
                <div className="mb-4">
                  <div className="text-slate-300 font-semibold mb-1">{p.name}</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">{p.price}</span>
                    <span className="text-slate-400 text-sm">{p.period}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{p.desc}</div>
                </div>
                <ul className="space-y-2 mb-6">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Link href="/dashboard" className={`block w-full py-2.5 rounded-xl text-sm font-semibold text-center transition-colors ${p.highlight ? "bg-emerald-500 hover:bg-emerald-400 text-white" : "border border-slate-700 hover:border-slate-500 text-slate-300"}`}>
                  {p.name === "Enterprise" ? "Contact Sales" : p.name === "Growth" ? "Get Started" : "Start Free Trial"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="px-6 lg:px-8 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">Revenue Teams Love APEX</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex mb-3">
                {[...Array(5)].map((_,i) => <Star key={i} size={12} className="text-amber-400 fill-amber-400" />)}
              </div>
              <p className="text-sm text-slate-300 mb-4 leading-relaxed">"{t.quote}"</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-xs font-bold text-white">{t.avatar}</div>
                <div>
                  <div className="text-xs font-medium text-white">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="px-6 lg:px-8 py-16 text-center bg-gradient-to-t from-emerald-950/20 to-transparent border-t border-slate-800">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to Automate Your Revenue Engine?</h2>
        <p className="text-slate-400 mb-8">Join 200+ revenue teams using APEX to hit their number every quarter.</p>
        <Link href="/dashboard" className="inline-block bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-10 py-4 rounded-xl text-base transition-colors">
          Start Free Trial — No Credit Card Required →
        </Link>
        <div className="mt-8 text-xs text-slate-600">
          © 2025 APEX AI, Inc. · Privacy · Terms · Security
        </div>
      </div>
    </div>
  );
}
