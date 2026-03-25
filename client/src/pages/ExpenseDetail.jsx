import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Check,
  Edit3,
  Image as ImageIcon,
  Loader2,
  Receipt,
  StickyNote,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { expensesApi } from '../lib/api';
import { EXPENSE_CATEGORIES, formatCurrency, formatDate, getCategoryMeta } from '../lib/expenseMeta';

const uiImages = {
  noReceipt: 'https://images.unsplash.com/photo-1554224154-26032fced8bd?auto=format&fit=crop&w=1200&q=80'
};

export default function ExpenseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [editData, setEditData] = useState({
    merchant: '',
    amount: '',
    tax: '',
    discount: '',
    date: '',
    category: 'Other',
    notes: '',
  });

  useEffect(() => {
    const loadExpense = async () => {
      setLoading(true);

      try {
        const data = await expensesApi.get(id);
        setExpense(data);
        setEditData({
          merchant: data.merchant,
          amount: String(data.amount),
          tax: data.tax !== null && data.tax !== undefined ? String(data.tax) : '',
          discount: data.discount !== null && data.discount !== undefined ? String(data.discount) : '',
          date: new Date(data.date).toISOString().split('T')[0],
          category: data.category,
          notes: data.notes || '',
        });
      } catch (error) {
        console.error('Failed to load expense:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExpense();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);

    try {
      const updatedExpense = await expensesApi.update(id, {
        merchant: editData.merchant,
        amount: Number.parseFloat(editData.amount),
        tax: editData.tax ? Number.parseFloat(editData.tax) : null,
        discount: editData.discount ? Number.parseFloat(editData.discount) : null,
        date: editData.date,
        category: editData.category,
        notes: editData.notes || null,
      });

      setExpense(updatedExpense);
      setEditing(false);
    } catch (error) {
      console.error('Failed to update expense:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await expensesApi.delete(id);
      navigate('/expenses');
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="card rounded-[1.8rem] p-8 text-center">
          <div className="mx-auto h-12 w-12 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin" />
          <p className="mt-4 text-sm font-semibold text-slate-500">Loading expense details...</p>
        </div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="card rounded-[2rem] px-6 py-14 text-center">
        <Receipt size={36} className="mx-auto text-slate-300" />
        <p className="mt-4 text-lg font-bold text-slate-700">Expense not found</p>
        <Link to="/expenses" className="btn-secondary mt-5 px-5 py-3 text-sm sm:w-auto">
          <ArrowLeft size={16} />
          Back to history
        </Link>
      </div>
    );
  }

  const meta = getCategoryMeta(expense.category);
  const lineItemsTotal = expense.items?.reduce((sum, item) => sum + Number(item.price || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/expenses" className="btn-secondary px-5 py-3 text-sm sm:w-auto">
          <ArrowLeft size={16} />
          Back to history
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row">
          {!editing ? (
            <>
              <button type="button" onClick={() => setEditing(true)} className="btn-secondary px-5 py-3 text-sm sm:w-auto">
                <Edit3 size={16} />
                Edit
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="btn-secondary border-rose-200 text-rose-700 hover:border-rose-300 hover:bg-rose-50 sm:w-auto"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </>
          ) : null}
        </div>
      </section>

      <Motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className={`card rounded-[2rem] bg-gradient-to-br p-6 sm:p-7 ${meta.soft}`}
      >
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="mb-4 flex items-center gap-4">
              <div className={`flex h-16 w-16 items-center justify-center rounded-[1.5rem] ${meta.iconWrap}`}>
                <meta.icon size={28} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Expense detail</p>
                {editing ? (
                  <input
                    type="text"
                    value={editData.merchant}
                    onChange={(event) => setEditData((current) => ({ ...current, merchant: event.target.value }))}
                    className="input-field mt-2 max-w-md text-lg font-bold"
                  />
                ) : (
                  <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">{expense.merchant}</h2>
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/70 bg-white/70 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Amount</p>
                {editing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={editData.amount}
                    onChange={(event) => setEditData((current) => ({ ...current, amount: event.target.value }))}
                    className="input-field mt-3"
                  />
                ) : (
                  <p className="mt-3 font-['Sora'] text-3xl font-bold text-slate-900">{formatCurrency(expense.amount)}</p>
                )}
              </div>

              <div className="rounded-[1.5rem] border border-white/70 bg-white/70 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Date</p>
                {editing ? (
                  <input
                    type="date"
                    value={editData.date}
                    onChange={(event) => setEditData((current) => ({ ...current, date: event.target.value }))}
                    className="input-field mt-3"
                  />
                ) : (
                  <p className="mt-3 text-sm font-semibold text-slate-700">{formatDate(expense.date, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                )}
              </div>

              <div className="rounded-[1.5rem] border border-white/70 bg-white/70 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Category</p>
                {editing ? (
                  <select
                    value={editData.category}
                    onChange={(event) => setEditData((current) => ({ ...current, category: event.target.value }))}
                    className="input-field mt-3"
                  >
                    {EXPENSE_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="mt-3">
                    <span className={`badge ${meta.chip}`}>{expense.category}</span>
                  </div>
                )}
              </div>

              <div className="rounded-[1.5rem] border border-white/70 bg-white/70 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Tax</p>
                {editing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={editData.tax}
                    onChange={(event) => setEditData((current) => ({ ...current, tax: event.target.value }))}
                    className="input-field mt-3"
                    placeholder="0.00"
                  />
                ) : (
                  <p className="mt-3 text-sm font-semibold text-slate-700">{formatCurrency(expense.tax || 0)}</p>
                )}
              </div>

              <div className="rounded-[1.5rem] border border-white/70 bg-white/70 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Discount</p>
                {editing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={editData.discount}
                    onChange={(event) => setEditData((current) => ({ ...current, discount: event.target.value }))}
                    className="input-field mt-3"
                    placeholder="0.00"
                  />
                ) : (
                  <p className="mt-3 text-sm font-semibold text-slate-700">{formatCurrency(expense.discount || 0)}</p>
                )}
              </div>
            </div>
          </div>

          <div className="card-flat rounded-[1.8rem] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Quick stats</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-[1.3rem] border border-slate-200/80 bg-white/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-600">Recorded on</span>
                  <span className="text-sm font-bold text-slate-900">{formatDate(expense.date)}</span>
                </div>
              </div>
              <div className="rounded-[1.3rem] border border-slate-200/80 bg-white/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-600">Line items total</span>
                  <span className="text-sm font-bold text-slate-900">{formatCurrency(lineItemsTotal)}</span>
                </div>
              </div>
              <div className="rounded-[1.3rem] border border-slate-200/80 bg-white/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-600">Tax</span>
                  <span className="text-sm font-bold text-slate-900">{formatCurrency(expense.tax || 0)}</span>
                </div>
              </div>
              <div className="rounded-[1.3rem] border border-slate-200/80 bg-white/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-600">Discount</span>
                  <span className="text-sm font-bold text-slate-900">{formatCurrency(expense.discount || 0)}</span>
                </div>
              </div>
              <div className="rounded-[1.3rem] border border-slate-200/80 bg-white/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-600">Receipt attached</span>
                  <span className="text-sm font-bold text-slate-900">{expense.imageUrl ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Motion.section>

      <section className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
        <Motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="card rounded-[2rem] p-6 sm:p-7"
        >
          <div className="space-y-6">
            <div>
              <div className="mb-3 flex items-center gap-2 text-slate-700">
                <Tag size={17} />
                <h3 className="text-xl font-bold">Category and notes</h3>
              </div>
              {!editing ? (
                <div className="space-y-4">
                  <div className="rounded-[1.4rem] border border-slate-200/80 bg-white/60 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Category</p>
                    <p className="mt-2 text-base font-semibold text-slate-800">{expense.category}</p>
                  </div>
                  <div className="rounded-[1.4rem] border border-slate-200/80 bg-white/60 p-4">
                    <div className="mb-2 flex items-center gap-2 text-slate-700">
                      <StickyNote size={16} />
                      <span className="text-sm font-bold">Notes</span>
                    </div>
                    <p className="text-sm leading-7 text-slate-600">
                      {expense.notes || 'No notes were saved for this expense.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                      <Tag size={16} />
                      Category
                    </label>
                    <select
                      value={editData.category}
                      onChange={(event) => setEditData((current) => ({ ...current, category: event.target.value }))}
                      className="input-field"
                    >
                      {EXPENSE_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                      <StickyNote size={16} />
                      Notes
                    </label>
                    <textarea
                      rows={4}
                      value={editData.notes}
                      onChange={(event) => setEditData((current) => ({ ...current, notes: event.target.value }))}
                      className="input-field resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {expense.items?.length ? (
              <div>
                <div className="mb-3 flex items-center gap-2 text-slate-700">
                  <Calendar size={17} />
                  <h3 className="text-xl font-bold">Line items</h3>
                </div>
                <div className="space-y-3">
                  {expense.items.map((item, index) => (
                    <div key={`${item.name}-${index}`} className="flex items-center justify-between gap-4 rounded-[1.3rem] border border-slate-200/80 bg-white/60 px-4 py-3">
                      <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                      <span className="text-sm font-bold text-slate-900">{formatCurrency(item.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {editing ? (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setEditData({
                    merchant: expense.merchant,
                    amount: String(expense.amount),
                    tax: expense.tax !== null && expense.tax !== undefined ? String(expense.tax) : '',
                    discount: expense.discount !== null && expense.discount !== undefined ? String(expense.discount) : '',
                    date: new Date(expense.date).toISOString().split('T')[0],
                    category: expense.category,
                    notes: expense.notes || '',
                  });
                }}
                className="btn-secondary px-5 py-3 text-sm sm:w-auto"
              >
                <X size={16} />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="btn-primary px-5 py-3 text-sm sm:w-auto"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Save changes
                  </>
                )}
              </button>
            </div>
          ) : null}
        </Motion.div>

        <Motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="card overflow-hidden rounded-[2rem] p-6 sm:p-7"
        >
          <div className="mb-4 flex items-center gap-2 text-slate-700">
            <ImageIcon size={17} />
            <h3 className="text-xl font-bold">Receipt image</h3>
          </div>

          {expense.imageUrl ? (
            <>
              <button type="button" onClick={() => setShowImage(true)} className="block w-full">
                <img
                  src={expense.imageUrl}
                  alt="Receipt"
                  className="max-h-[420px] w-full rounded-[1.6rem] border border-slate-200/80 bg-white object-contain"
                />
              </button>
              <p className="mt-3 text-sm text-slate-500">Tap the image to view it larger.</p>
            </>
          ) : (
            <div className="rounded-[1.6rem] border border-dashed border-slate-300 bg-white/45 px-5 py-7 text-center text-sm text-slate-500">
              <img
                src={uiImages.noReceipt}
                alt="Receipt and calculator on table"
                loading="lazy"
                className="mx-auto h-40 w-full rounded-[1.1rem] object-cover"
              />
              <p className="mt-4">This expense was saved without a receipt image.</p>
            </div>
          )}
        </Motion.div>
      </section>

      {showImage && expense.imageUrl ? (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowImage(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
        >
          <Motion.div
            initial={{ scale: 0.94 }}
            animate={{ scale: 1 }}
            onClick={(event) => event.stopPropagation()}
            className="relative w-full max-w-4xl rounded-[2rem] bg-white p-4 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setShowImage(false)}
              className="absolute right-6 top-6 z-10 rounded-full border border-slate-200 bg-white p-2 text-slate-600"
            >
              <X size={18} />
            </button>
            <img src={expense.imageUrl} alt="Receipt full view" className="max-h-[80vh] w-full rounded-[1.5rem] object-contain" />
          </Motion.div>
        </Motion.div>
      ) : null}
    </div>
  );
}
