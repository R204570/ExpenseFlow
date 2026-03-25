import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Brain,
  Camera,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Split,
  WalletCards,
} from 'lucide-react';

const features = [
  {
    icon: Camera,
    title: 'Receipt capture that feels instant',
    description: 'Snap a bill, upload a receipt, or start with manual entry from any device.',
    accent: 'bg-amber-100 text-amber-700',
  },
  {
    icon: Brain,
    title: 'AI-assisted extraction',
    description: 'Auto-fill merchant, amount, date, category, and line items with less busywork.',
    accent: 'bg-teal-100 text-teal-700',
  },
  {
    icon: BarChart3,
    title: 'Analytics you will actually read',
    description: 'Spot trends, category shifts, and spending habits with a cleaner dashboard.',
    accent: 'bg-sky-100 text-sky-700',
  },
  {
    icon: Split,
    title: 'Built-in bill splitting',
    description: 'Break shared purchases into named shares and keep the receipt attached.',
    accent: 'bg-rose-100 text-rose-700',
  },
];

const proof = [
  { value: '< 3 min', label: 'from receipt to saved expense' },
  { value: '10+', label: 'organized categories out of the box' },
  { value: '1 app', label: 'for capture, review, and history' },
];

const steps = [
  {
    title: 'Capture the receipt',
    description: 'Use the phone camera, drag in an image, or skip straight to manual entry.',
  },
  {
    title: 'Review the extracted details',
    description: 'Adjust categories, notes, or line items inside a clean review experience.',
  },
  {
    title: 'Track the bigger picture',
    description: 'See totals, category mix, and recent activity in one responsive workspace.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-mesh">
      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 lg:px-8">
        <div className="orb orb-warm left-0 top-10 h-52 w-52" />
        <div className="orb orb-cool right-12 top-40 h-56 w-56" />

        <nav className="card-flat sticky top-4 z-30 flex items-center justify-between rounded-[1.8rem] border-white/60 px-4 py-3 backdrop-blur-xl sm:px-5">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[1.3rem] bg-slate-900 text-white">
              <Sparkles size={19} />
            </div>
            <div>
              <p className="font-['Sora'] text-lg font-bold text-slate-900">ExpenseFlow</p>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Smarter expense tracking</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link to="/auth" className="btn-ghost px-4 py-2 text-sm">
              Sign in
            </Link>
            <Link to="/auth" className="btn-primary px-5 py-2.5 text-sm">
              Launch app
            </Link>
          </div>
        </nav>

        <section className="relative grid gap-10 pb-14 pt-14 lg:grid-cols-[1.1fr_0.95fr] lg:items-center lg:pt-20">
          <Motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="max-w-2xl"
          >
            <div className="eyebrow mb-6">
              <WalletCards size={15} />
              Built for faster personal finance routines
            </div>

            <h1 className="section-title max-w-xl text-slate-900">
              Track every expense in a UI that finally feels
              {' '}
              <span className="gradient-text">worth opening daily.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              ExpenseFlow combines receipt capture, smart extraction, spend insights, and searchable history in a polished responsive workspace that works on mobile and desktop.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/auth" className="btn-primary px-7 py-3.5 text-base">
                Start tracking
                <ArrowRight size={18} />
              </Link>
              <a href="#features" className="btn-secondary px-7 py-3.5 text-base">
                Explore features
                <ChevronRight size={18} />
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {proof.map((item) => (
                <div key={item.label} className="stat-tile p-4">
                  <p className="font-['Sora'] text-2xl font-bold text-slate-900">{item.value}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
          </Motion.div>

          <Motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="relative"
          >
            <div className="card relative overflow-hidden rounded-[2rem] border-white/60 p-4 sm:p-5">
              <div className="absolute inset-x-8 top-0 h-36 rounded-full bg-amber-200/30 blur-3xl" />
              <div className="relative rounded-[1.6rem] bg-slate-900 p-5 text-white">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/55">This month</p>
                    <p className="mt-2 font-['Sora'] text-4xl font-bold">$2,847</p>
                  </div>
                  <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/85">
                    18% better than last month
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.2rem] bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/55">Average</p>
                    <p className="mt-2 text-2xl font-bold">$94.90</p>
                  </div>
                  <div className="rounded-[1.2rem] bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/55">Transactions</p>
                    <p className="mt-2 text-2xl font-bold">34</p>
                  </div>
                  <div className="rounded-[1.2rem] bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/55">Top category</p>
                    <p className="mt-2 text-2xl font-bold">Food</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="card-flat rounded-[1.6rem] p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Spending trend</p>
                      <p className="mt-1 text-lg font-bold text-slate-900">Daily rhythm</p>
                    </div>
                    <div className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">Month</div>
                  </div>

                  <div className="flex h-48 items-end gap-2 rounded-[1.3rem] bg-[linear-gradient(180deg,rgba(247,244,237,0.85),rgba(255,255,255,0.6))] p-4">
                    {[28, 45, 36, 58, 44, 70, 62, 55, 72, 60, 80, 74].map((height, index) => (
                      <div key={index} className="flex flex-1 items-end">
                        <div
                          className="w-full rounded-t-[1rem] bg-[linear-gradient(180deg,#1e9b7e,#155e75)] opacity-90"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card-flat rounded-[1.6rem] p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Recent capture</p>
                  <div className="mt-4 space-y-3">
                    {[
                      { merchant: 'Corner House', amount: '$42.80', tag: 'Food' },
                      { merchant: 'Metro Fuel', amount: '$59.10', tag: 'Transport' },
                      { merchant: 'Market One', amount: '$78.26', tag: 'Groceries' },
                    ].map((entry) => (
                      <div key={entry.merchant} className="rounded-[1.2rem] border border-slate-200/80 bg-white/85 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-bold text-slate-900">{entry.merchant}</p>
                            <p className="text-sm text-slate-500">{entry.tag}</p>
                          </div>
                          <p className="font-['Sora'] text-lg font-bold text-slate-900">{entry.amount}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Motion.div>
        </section>
      </div>

      <section id="features" className="relative border-y border-white/50 bg-white/45 px-4 py-18 backdrop-blur-md sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-2xl">
            <div className="eyebrow mb-5">What makes it feel better</div>
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              A cleaner workflow from the moment you snap a receipt.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature, index) => (
              <Motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="card p-6"
              >
                <div className={`mb-5 flex h-13 w-13 items-center justify-center rounded-[1.3rem] ${feature.accent}`}>
                  <feature.icon size={22} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
              </Motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-18 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="card bg-slate-900 p-8 text-white">
            <div className="eyebrow mb-6 border-white/10 bg-white/10 text-white">How it works</div>
            <h2 className="text-3xl font-bold sm:text-4xl">Three steps. No clutter.</h2>
            <p className="mt-4 max-w-md text-base leading-7 text-slate-300">
              The app stays simple even when the workflow does a lot in the background.
            </p>
          </div>

          <div className="grid gap-4">
            {steps.map((step, index) => (
              <div key={step.title} className="card flex gap-4 p-6 sm:items-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.2rem] bg-primary-100 font-['Sora'] text-lg font-bold text-primary-700">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="card overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(17,24,39,0.92))] p-8 text-white sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="eyebrow mb-5 border-white/10 bg-white/10 text-white">
                  <ShieldCheck size={15} />
                  Ready when you are
                </div>
                <h2 className="text-3xl font-bold sm:text-4xl">Upgrade the money-tracking experience.</h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
                  Start capturing receipts, organize them automatically, and keep your expense story easy to read from anywhere.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  'Responsive dashboard for desktop and mobile',
                  'Manual entry, OCR flow, and searchable history',
                  'Designed to feel modern instead of spreadsheet-heavy',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-full bg-white/8 px-4 py-3 text-sm text-white/90">
                    <CheckCircle2 size={18} className="text-emerald-300" />
                    {item}
                  </div>
                ))}
                <Link to="/auth" className="btn-primary mt-2 w-full px-6 py-3.5 text-base">
                  Open ExpenseFlow
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
