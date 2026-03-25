import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Filter,
  Receipt,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { expensesApi } from '../lib/api';
import { EXPENSE_CATEGORIES, formatCurrency, formatDate, getCategoryMeta } from '../lib/expenseMeta';

export default function ExpenseHistory() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  useEffect(() => {
    const loadExpenses = async () => {
      setLoading(true);

      try {
        const [sortField, sortOrder] = sortBy.split('-');
        const response = await expensesApi.list({
          page: pagination.page,
          limit: pagination.limit,
          sortBy: sortField,
          order: sortOrder,
          ...(filterCategory !== 'all' ? { category: filterCategory } : {}),
        });

        setExpenses(response.expenses || []);
        setPagination((current) => ({ ...current, total: response.total || 0 }));
      } catch (error) {
        console.error('Failed to load expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExpenses();
  }, [filterCategory, pagination.limit, pagination.page, sortBy]);

  const filteredExpenses = expenses.filter((expense) =>
    expense.merchant.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil((pagination.total || 0) / pagination.limit));
  const visibleTotal = filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1fr_auto] xl:items-end">
        <Motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="card rounded-[2rem] p-6 sm:p-7"
        >
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Expense archive</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Searchable history, finally easy to scan.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Filter by category, sort by date or amount, and jump into details without losing the clean overview.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="stat-tile p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Loaded</p>
              <p className="mt-2 font-['Sora'] text-3xl font-bold text-slate-900">{filteredExpenses.length}</p>
              <p className="mt-2 text-sm text-slate-500">Visible entries on this page</p>
            </div>
            <div className="stat-tile p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Visible total</p>
              <p className="mt-2 font-['Sora'] text-3xl font-bold text-slate-900">{formatCurrency(visibleTotal)}</p>
              <p className="mt-2 text-sm text-slate-500">Combined amount after local search</p>
            </div>
            <div className="stat-tile p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">All records</p>
              <p className="mt-2 font-['Sora'] text-3xl font-bold text-slate-900">{pagination.total || 0}</p>
              <p className="mt-2 text-sm text-slate-500">Tracked expenses in the archive</p>
            </div>
          </div>
        </Motion.div>
      </section>

      <Motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="card rounded-[2rem] p-5 sm:p-6"
      >
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.7fr_0.7fr]">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
              <Search size={16} />
              Search merchant
            </label>
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Coffee shop, grocery store, fuel..."
                className="input-field pl-11"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
              <Filter size={16} />
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(event) => {
                setFilterCategory(event.target.value);
                setPagination((current) => ({ ...current, page: 1 }));
              }}
              className="input-field"
            >
              <option value="all">All categories</option>
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
              <SlidersHorizontal size={16} />
              Sort
            </label>
            <select
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value);
                setPagination((current) => ({ ...current, page: 1 }));
              }}
              className="input-field"
            >
              <option value="date-desc">Newest first</option>
              <option value="date-asc">Oldest first</option>
              <option value="amount-desc">Highest amount</option>
              <option value="amount-asc">Lowest amount</option>
            </select>
          </div>
        </div>
      </Motion.section>

      <Motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="space-y-3"
      >
        {loading ? (
          <div className="card flex min-h-[320px] items-center justify-center rounded-[2rem] p-8">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin" />
              <p className="mt-4 text-sm font-semibold text-slate-500">Loading expense history...</p>
            </div>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="card rounded-[2rem] px-6 py-14 text-center">
            <Receipt size={36} className="mx-auto text-slate-300" />
            <p className="mt-4 text-lg font-bold text-slate-700">No expenses match this view.</p>
            <p className="mt-2 text-sm text-slate-500">Try a different search or clear the current filters.</p>
          </div>
        ) : (
          filteredExpenses.map((expense) => {
            const meta = getCategoryMeta(expense.category);

            return (
              <Link
                key={expense.id}
                to={`/expenses/${expense.id}`}
                className={`card block rounded-[1.8rem] bg-gradient-to-r p-5 transition ${meta.soft}`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-[1.3rem] ${meta.iconWrap}`}>
                      <meta.icon size={22} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-lg font-bold text-slate-900">{expense.merchant}</h3>
                        <span className={`badge ${meta.chip}`}>{expense.category}</span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                        <span>{formatDate(expense.date)}</span>
                        {expense.notes ? <span className="text-slate-300">/</span> : null}
                        {expense.notes ? <span className="truncate">{expense.notes}</span> : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 lg:min-w-[220px] lg:justify-end">
                    <div className="text-left lg:text-right">
                      <p className="font-['Sora'] text-2xl font-bold text-slate-900">{formatCurrency(expense.amount)}</p>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Open details</p>
                    </div>
                    <div className="hidden h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-white/70 text-slate-500 lg:flex">
                      <ArrowRight size={18} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </Motion.section>

      {!loading && totalPages > 1 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setPagination((current) => ({ ...current, page: Math.max(1, current.page - 1) }))}
            disabled={pagination.page === 1}
            className="btn-secondary px-5 py-3 disabled:cursor-not-allowed disabled:opacity-55 sm:w-auto"
          >
            <ArrowLeft size={16} />
            Previous
          </button>

          <div className="rounded-full border border-white/60 bg-white/75 px-5 py-3 text-sm font-semibold text-slate-600">
            Page {pagination.page} of {totalPages}
          </div>

          <button
            type="button"
            onClick={() => setPagination((current) => ({ ...current, page: Math.min(totalPages, current.page + 1) }))}
            disabled={pagination.page === totalPages}
            className="btn-secondary px-5 py-3 disabled:cursor-not-allowed disabled:opacity-55 sm:w-auto"
          >
            Next
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
