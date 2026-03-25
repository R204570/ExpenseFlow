import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import {
  ArrowRight,
  DollarSign,
  PlusCircle,
  Receipt,
  ShoppingBag,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { expensesApi } from '../lib/api';
import { formatCurrency, formatDate, getCategoryMeta } from '../lib/expenseMeta';

const chartColors = ['#155e75', '#1e9b7e', '#c67833', '#7c3aed', '#ef4444', '#0ea5e9'];
const uiImages = {
  categories: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
  trend: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&w=1200&q=80',
  activity: 'https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&w=1200&q=80'
};

const periodOptions = ['day', 'week', 'month', 'year'];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-[1.1rem] border border-slate-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-xl">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
        {formatDate(label, { month: 'short', day: 'numeric' })}
      </p>
      <p className="mt-1 font-['Sora'] text-lg font-bold text-slate-900">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setLoadError('');

      try {
        const [statsData, expensesData] = await Promise.all([
          expensesApi.stats(period),
          expensesApi.list({ limit: 5, sortBy: 'createdAt', order: 'desc' }),
        ]);

        setStats(statsData);
        setRecentExpenses(expensesData.expenses || []);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setLoadError(error.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [period]);

  const greetingName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';
  const totalAmount = stats?.totalAmount || 0;
  const categoryBreakdown = stats?.categoryBreakdown || [];
  const dailyTrend = stats?.dailyTrend || [];
  const topCategory = categoryBreakdown[0];
  const topCategoryMeta = getCategoryMeta(topCategory?.name);
  const topCategoryShare = totalAmount > 0 && topCategory ? Math.round((topCategory.value / totalAmount) * 100) : 0;

  const metricCards = [
    {
      label: 'Total spent',
      value: formatCurrency(totalAmount),
      caption: 'All expenses in the selected period',
      icon: DollarSign,
      accent: 'bg-teal-100 text-teal-700',
    },
    {
      label: 'Transactions',
      value: stats?.count || 0,
      caption: 'Recorded purchases and receipts',
      icon: Receipt,
      accent: 'bg-sky-100 text-sky-700',
    },
    {
      label: 'Average',
      value: formatCurrency(stats?.avgAmount || 0),
      caption: 'Mean spend per entry',
      icon: TrendingUp,
      accent: 'bg-amber-100 text-amber-700',
    },
    {
      label: 'Categories',
      value: categoryBreakdown.length,
      caption: 'Buckets actively used',
      icon: ShoppingBag,
      accent: 'bg-violet-100 text-violet-700',
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="card w-full max-w-sm rounded-[1.8rem] p-8 text-center">
          <div className="mx-auto h-12 w-12 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin" />
          <p className="mt-4 text-sm font-semibold text-slate-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {loadError ? (
        <div className="rounded-[1.4rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {loadError}
        </div>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="card min-w-0 overflow-hidden rounded-[2rem] p-6 sm:p-7"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="eyebrow mb-4">
                <Sparkles size={15} />
                Smart snapshot for {period}
              </div>
              <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                Welcome back, {greetingName}.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                Your workspace is organized around quick capture, readable trends, and a history view that stays easy to scan on smaller screens.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex flex-wrap rounded-full border border-white/70 bg-white/80 p-1">
                {periodOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setPeriod(option)}
                    className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition ${
                      period === option ? 'bg-slate-900 text-white' : 'text-slate-500'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <Link to="/add-expense" className="btn-primary px-5 py-3 text-sm">
                <PlusCircle size={17} />
                Add expense
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metricCards.map((card, index) => (
              <Motion.div
                key={card.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="stat-tile min-w-0 p-5"
              >
                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-[1.2rem] ${card.accent}`}>
                  <card.icon size={20} />
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
                <p className="mt-2 break-words font-['Sora'] text-2xl font-bold text-slate-900 sm:text-3xl">{card.value}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">{card.caption}</p>
              </Motion.div>
            ))}
          </div>
        </Motion.div>

        <Motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="card min-w-0 overflow-hidden rounded-[2rem] p-6 sm:p-7"
        >
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Lead category</p>
          {topCategory ? (
            <>
              <div className="mt-5 flex items-start justify-between gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-[1.4rem] ${topCategoryMeta.iconWrap}`}>
                  <topCategoryMeta.icon size={24} />
                </div>
                <span className={`badge ${topCategoryMeta.chip}`}>{topCategoryShare}% of spend</span>
              </div>
              <h3 className="mt-5 text-2xl font-bold text-slate-900">{topCategory.name}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                This is where the biggest share of your money went during the selected period.
              </p>
              <img
                src={uiImages.categories}
                alt="Budget planning notebook"
                loading="lazy"
                className="mt-5 h-28 w-full rounded-[1.2rem] border border-slate-200/70 object-cover"
              />
              <div className="mt-6 rounded-[1.5rem] border border-slate-200/80 bg-white/70 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Amount</p>
                <p className="mt-2 font-['Sora'] text-3xl font-bold text-slate-900">{formatCurrency(topCategory.value)}</p>
              </div>
            </>
          ) : (
            <div className="mt-6 rounded-[1.5rem] border border-dashed border-slate-300 bg-white/50 p-5 text-center text-sm text-slate-500">
              <img
                src={uiImages.categories}
                alt="Organized receipts on desk"
                loading="lazy"
                className="mx-auto h-36 w-full max-w-sm rounded-[1.2rem] object-cover"
              />
              <p className="mt-4">Add a few expenses and your category story will show up here.</p>
            </div>
          )}
        </Motion.div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <Motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="card min-w-0 overflow-hidden rounded-[2rem] p-6 sm:p-7"
        >
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Spending trend</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">How spending moved</h3>
            </div>
            <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">
              {dailyTrend.length} points
            </span>
          </div>

          {dailyTrend.length > 0 ? (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrend}>
                  <defs>
                    <linearGradient id="dashboardArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1e9b7e" stopOpacity={0.34} />
                      <stop offset="95%" stopColor="#1e9b7e" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="rgba(100,116,139,0.18)" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickFormatter={(value) => formatDate(value, { month: 'short', day: 'numeric' })}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="amount" stroke="#155e75" strokeWidth={3} fill="url(#dashboardArea)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[320px] flex-col items-center justify-center rounded-[1.6rem] border border-dashed border-slate-300 bg-white/45 px-5 text-center text-sm text-slate-500">
              <img
                src={uiImages.trend}
                alt="Line graph on laptop screen"
                loading="lazy"
                className="mb-4 h-28 w-full max-w-xs rounded-[1rem] object-cover"
              />
              No trend data yet for this period.
            </div>
          )}
        </Motion.div>

        <Motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="card min-w-0 overflow-hidden rounded-[2rem] p-6 sm:p-7"
        >
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Category mix</p>
            <h3 className="mt-1 text-2xl font-bold text-slate-900">Where money went</h3>
          </div>

          {categoryBreakdown.length > 0 ? (
            <>
              <div className="mx-auto h-[210px] max-w-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      dataKey="value"
                      innerRadius={58}
                      outerRadius={84}
                      paddingAngle={3}
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatCurrency(value), 'Spent']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 space-y-3">
                {categoryBreakdown.slice(0, 5).map((category, index) => {
                  const meta = getCategoryMeta(category.name);
                  return (
                    <div key={category.name} className="flex items-center justify-between gap-3 rounded-[1.1rem] border border-slate-200/80 bg-white/60 px-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: chartColors[index % chartColors.length] }}
                        />
                        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${meta.iconWrap}`}>
                          <meta.icon size={18} />
                        </div>
                        <span className="truncate text-sm font-semibold text-slate-700">{category.name}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{formatCurrency(category.value)}</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex h-[320px] flex-col items-center justify-center rounded-[1.6rem] border border-dashed border-slate-300 bg-white/45 px-5 text-center text-sm text-slate-500">
              <img
                src={uiImages.categories}
                alt="Paper chart and calculator"
                loading="lazy"
                className="mb-4 h-28 w-full max-w-xs rounded-[1rem] object-cover"
              />
              No category data available yet.
            </div>
          )}
        </Motion.div>
      </section>

      <Motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22 }}
        className="card min-w-0 overflow-hidden rounded-[2rem] p-6 sm:p-7"
      >
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Recent activity</p>
            <h3 className="mt-1 text-2xl font-bold text-slate-900">Latest expenses</h3>
          </div>
          <Link to="/expenses" className="btn-secondary px-5 py-3 text-sm sm:w-auto">
            View full history
            <ArrowRight size={16} />
          </Link>
        </div>

        {recentExpenses.length > 0 ? (
          <div className="grid gap-3">
            {recentExpenses.map((expense) => {
              const meta = getCategoryMeta(expense.category);
              return (
                <Link
                  key={expense.id}
                  to={`/expenses/${expense.id}`}
                  className={`rounded-[1.5rem] border border-slate-200/80 bg-gradient-to-r p-4 transition hover:border-slate-300 hover:shadow-lg ${meta.soft}`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-[1.2rem] ${meta.iconWrap}`}>
                        <meta.icon size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-base font-bold text-slate-900">{expense.merchant}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                          <span>{expense.category}</span>
                          <span className="text-slate-300">/</span>
                          <span>{formatDate(expense.date, { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-['Sora'] text-xl font-bold text-slate-900">{formatCurrency(expense.amount)}</p>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Tap for detail</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[1.6rem] border border-dashed border-slate-300 bg-white/45 px-6 py-12 text-center">
            <img
              src={uiImages.activity}
              alt="Person reviewing expenses"
              loading="lazy"
              className="mx-auto h-32 w-full max-w-sm rounded-[1rem] object-cover"
            />
            <Receipt size={28} className="mx-auto mt-4 text-slate-300" />
            <p className="mt-4 text-base font-semibold text-slate-600">No expenses yet</p>
            <p className="mt-2 text-sm text-slate-500">Add your first receipt to bring this dashboard to life.</p>
          </div>
        )}
      </Motion.section>
    </div>
  );
}
