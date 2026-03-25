import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ScanLine,
  Sparkles,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const valuePoints = [
  'Responsive workspace designed for desktop and mobile',
  'Receipt capture, OCR review, and manual entry in one flow',
  'Visual dashboard with spending trends and category insights',
];

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, name);
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card relative hidden overflow-hidden rounded-[2rem] bg-[linear-gradient(145deg,rgba(15,23,42,0.98),rgba(15,23,42,0.88))] p-8 text-white lg:flex lg:flex-col"
        >
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-amber-300/15 blur-3xl" />
          <div className="absolute bottom-0 left-10 h-48 w-48 rounded-full bg-teal-400/15 blur-3xl" />

          <Link to="/" className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[1.3rem] bg-white/10 text-white">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="font-['Sora'] text-lg font-bold">ExpenseFlow</p>
              <p className="text-xs uppercase tracking-[0.24em] text-white/45">Smart capture workspace</p>
            </div>
          </Link>

          <div className="relative z-10 mt-16 max-w-xl">
            <div className="eyebrow border-white/10 bg-white/10 text-white">Designed for frictionless tracking</div>
            <h1 className="mt-6 text-4xl font-bold leading-tight">
              Sign in to your polished expense dashboard.
            </h1>
            <p className="mt-5 text-base leading-8 text-slate-300">
              Capture receipts, review extracted details, and manage your full expense history inside a calmer interface.
            </p>
          </div>

          <div className="relative z-10 mt-10 grid gap-4">
            {valuePoints.map((item) => (
              <div key={item} className="rounded-[1.4rem] border border-white/10 bg-white/8 p-4 text-sm text-slate-100">
                {item}
              </div>
            ))}
          </div>

          <div className="relative z-10 mt-6 overflow-hidden rounded-[1.5rem] border border-white/15">
            <img
              src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80"
              alt="Workspace with notebook and spending notes"
              className="h-48 w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-900/45 to-transparent px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-200">Stay in control</p>
              <p className="mt-1 text-sm text-slate-100">See every transaction clearly and avoid end-of-month surprises.</p>
            </div>
          </div>

          <div className="relative z-10 mt-auto grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.4rem] border border-white/10 bg-white/8 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-white/45">Capture flow</p>
              <p className="mt-3 text-2xl font-bold">Fast</p>
              <p className="mt-1 text-sm text-slate-300">Camera, upload, or manual entry with the same refined UI.</p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/8 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-white/45">Insights</p>
              <p className="mt-3 text-2xl font-bold">Readable</p>
              <p className="mt-1 text-sm text-slate-300">Analytics, categories, and history that stay clear on smaller screens.</p>
            </div>
          </div>
        </Motion.section>

        <Motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center"
        >
          <div className="card mx-auto w-full max-w-[34rem] rounded-[2rem] p-6 sm:p-8">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <Link to="/" className="mb-5 inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 lg:hidden">
                  <Sparkles size={16} />
                  ExpenseFlow
                </Link>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                  {isLogin ? 'Welcome back' : 'Create account'}
                </p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  {isLogin ? 'Sign in and keep moving.' : 'Start tracking in style.'}
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  {isLogin ? 'Your dashboard, receipt capture, and history are waiting.' : 'Set up your workspace and begin organizing expenses.'}
                </p>
              </div>

              <div className="hidden h-16 w-16 items-center justify-center rounded-[1.5rem] bg-primary-100 text-primary-700 sm:flex">
                <ScanLine size={28} />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <Motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-5 flex items-start gap-3 rounded-[1.2rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                >
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </Motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence initial={false}>
                {!isLogin && (
                  <Motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <label className="mb-2 block text-sm font-bold text-slate-700">Full name</label>
                    <div className="field-shell">
                      <User size={18} className="field-icon" />
                      <input
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Your name"
                        className="input-field field-input"
                      />
                    </div>
                  </Motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Email address</label>
                <div className="field-shell">
                  <Mail size={18} className="field-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                    className="input-field field-input"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Password</label>
                <div className="field-shell">
                  <Lock size={18} className="field-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter at least 6 characters"
                    required
                    minLength={6}
                    className="input-field field-input field-input-with-action"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="field-action"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary mt-2 w-full px-5 py-3.5 text-base"
              >
                {loading ? (
                  <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Sign in to ExpenseFlow' : 'Create your account'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 rounded-[1.4rem] border border-slate-200/80 bg-white/55 px-4 py-4 text-sm text-slate-600">
              {isLogin ? "New to ExpenseFlow?" : 'Already have an account?'}
              {' '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin((current) => !current);
                  setError('');
                }}
                className="font-bold text-primary-700 hover:text-primary-800"
              >
                {isLogin ? 'Create one here.' : 'Sign in instead.'}
              </button>
            </div>
          </div>
        </Motion.section>
      </div>
    </div>
  );
}
