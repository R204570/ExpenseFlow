import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { createWorker } from 'tesseract.js';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Camera,
  Check,
  DollarSign,
  FileText,
  Image as ImageIcon,
  Loader2,
  Plus,
  ScanLine,
  Sparkles,
  StickyNote,
  Store,
  Tag,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { aiApi, expensesApi, splitsApi, uploadApi } from '../lib/api';
import { EXPENSE_CATEGORIES, formatCurrency, getCategoryMeta } from '../lib/expenseMeta';

const stages = [
  { id: 'upload', label: 'Capture' },
  { id: 'processing', label: 'Process' },
  { id: 'preview', label: 'Review' },
];

export default function AddExpense() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [step, setStep] = useState('upload');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [ocrProgress, setOcrProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showSplit, setShowSplit] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    merchant: '',
    amount: '',
    tax: '',
    discount: '',
    category: 'Other',
    notes: '',
    items: [],
  });

  const [splitData, setSplitData] = useState({
    totalPeople: 2,
    participants: [
      { name: '', amount: '' },
      { name: '', amount: '' },
    ],
  });

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setStep('processing');
    setImageFile(file);

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview(URL.createObjectURL(file));

    try {
      setProcessingStep('Running OCR on your receipt');
      setOcrProgress(0);

      const worker = await createWorker('eng', 1, {
        logger: (message) => {
          if (message.status === 'recognizing text') {
            setOcrProgress(Math.round(message.progress * 50));
          }
        },
      });

      const {
        data: { text },
      } = await worker.recognize(file);

      await worker.terminate();
      setOcrText(text);
      setOcrProgress(52);
      setProcessingStep('Structuring expense details with AI');

      try {
        const aiResult = await aiApi.processReceipt(text);

        setFormData((current) => ({
          ...current,
          date: aiResult.date || current.date,
          merchant: aiResult.merchant || '',
          amount: aiResult.amount !== null ? String(aiResult.amount) : '',
          tax: aiResult.tax !== null ? String(aiResult.tax) : '',
          discount: aiResult.discount !== null ? String(aiResult.discount) : '',
          category: aiResult.category || 'Other',
          items: aiResult.items?.length
            ? aiResult.items.map((item) => ({ name: item.name, price: String(item.price) }))
            : [],
        }));

        setOcrProgress(100);
      } catch (aiError) {
        console.error('AI processing failed:', aiError);
        setError('AI could not finish processing the receipt. You can still review and complete it manually.');
      }

      setStep('preview');
    } catch (processingError) {
      console.error('Processing error:', processingError);
      setError('The image could not be processed. You can continue with manual entry.');
      setStep('preview');
    }
  };

  const updateFormField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const addItem = () => {
    setFormData((current) => ({
      ...current,
      items: [...current.items, { name: '', price: '' }],
    }));
  };

  const updateItem = (index, field, value) => {
    setFormData((current) => ({
      ...current,
      items: current.items.map((item, currentIndex) =>
        currentIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeItem = (index) => {
    setFormData((current) => ({
      ...current,
      items: current.items.filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  const handleSplitChange = (value) => {
    const count = Math.max(2, Number.parseInt(value, 10) || 2);
    const amountPerPerson = formData.amount ? (Number.parseFloat(formData.amount) / count).toFixed(2) : '';

    setSplitData((current) => ({
      totalPeople: count,
      participants: Array.from({ length: count }, (_, index) => ({
        name: current.participants[index]?.name || '',
        amount: amountPerPerson,
      })),
    }));
  };

  const updateParticipant = (index, field, value) => {
    setSplitData((current) => ({
      ...current,
      participants: current.participants.map((participant, currentIndex) =>
        currentIndex === index ? { ...participant, [field]: value } : participant
      ),
    }));
  };

  const autoSplitEvenly = () => {
    if (!formData.amount) return;

    const amountPerPerson = (Number.parseFloat(formData.amount) / splitData.totalPeople).toFixed(2);

    setSplitData((current) => ({
      ...current,
      participants: current.participants.map((participant) => ({
        ...participant,
        amount: amountPerPerson,
      })),
    }));
  };

  const handleSave = async () => {
    if (!formData.amount || !formData.merchant || !formData.date || !formData.category) {
      setError('Please complete the merchant, amount, date, and category before saving.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      let imageUrl = null;

      if (imageFile) {
        const uploadResult = await uploadApi.uploadReceipt(imageFile);
        imageUrl = uploadResult.url;
      }

      const expense = await expensesApi.create({
        amount: Number.parseFloat(formData.amount),
        tax: formData.tax ? Number.parseFloat(formData.tax) : null,
        discount: formData.discount ? Number.parseFloat(formData.discount) : null,
        date: formData.date,
        merchant: formData.merchant,
        category: formData.category,
        notes: formData.notes || null,
        imageUrl,
        items: formData.items
          .filter((item) => item.name && item.price)
          .map((item) => ({ name: item.name, price: Number.parseFloat(item.price) })),
      });

      if (showSplit && splitData.participants.some((participant) => participant.name && participant.amount)) {
        try {
          await splitsApi.create(expense.id, {
            totalPeople: splitData.totalPeople,
            participants: splitData.participants
              .filter((participant) => participant.name && participant.amount)
              .map((participant) => ({
                name: participant.name,
                amount: Number.parseFloat(participant.amount),
              })),
          });
        } catch (splitError) {
          console.warn('Split creation failed:', splitError);
        }
      }

      navigate('/dashboard');
    } catch (saveError) {
      setError(saveError.message || 'Failed to save expense.');
    } finally {
      setSaving(false);
    }
  };

  const currentCategoryMeta = getCategoryMeta(formData.category);
  const lineItemsTotal = formData.items.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const splitAssignedTotal = splitData.participants.reduce((sum, participant) => sum + Number(participant.amount || 0), 0);

  return (
    <div className="space-y-6">
      <section className="card rounded-[2rem] p-6 sm:p-7">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <div className="eyebrow mb-4">
              <ScanLine size={15} />
              Receipt capture flow
            </div>
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Add a new expense without the usual friction.</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Upload a receipt, let OCR and AI help with the boring parts, then polish the details before saving.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {stages.map((stage) => {
              const active = step === stage.id || (step === 'preview' && stage.id === 'processing');

              return (
                <div
                  key={stage.id}
                  className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] ${
                    active ? 'bg-slate-900 text-white' : 'bg-white/70 text-slate-500'
                  }`}
                >
                  {stage.label}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {error && (
          <Motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 rounded-[1.4rem] border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span className="flex-1">{error}</span>
            <button type="button" onClick={() => setError('')} className="text-rose-500 hover:text-rose-700">
              <X size={16} />
            </button>
          </Motion.div>
        )}
      </AnimatePresence>

      {step === 'upload' && (
        <Motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]"
        >
          <div className="card rounded-[2rem] p-6 sm:p-7">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Choose your input</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">Scan a receipt or start manually.</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="group rounded-[1.8rem] border border-slate-200/80 bg-white/65 p-6 text-left transition hover:border-primary-300 hover:shadow-lg"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[1.3rem] bg-primary-100 text-primary-700">
                  <Camera size={24} />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Use camera</h4>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  Capture a receipt directly from your phone for the quickest flow.
                </p>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group rounded-[1.8rem] border border-slate-200/80 bg-white/65 p-6 text-left transition hover:border-sky-300 hover:shadow-lg"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[1.3rem] bg-sky-100 text-sky-700">
                  <Upload size={24} />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Upload image</h4>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  Select a JPEG, PNG, or WebP receipt from your device and let OCR do the prep work.
                </p>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setStep('preview')}
              className="mt-4 flex w-full items-center justify-between rounded-[1.6rem] border border-dashed border-slate-300 bg-white/40 px-5 py-4 text-left transition hover:border-slate-400"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[1.2rem] bg-slate-100 text-slate-700">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Skip straight to manual entry</p>
                  <p className="text-sm text-slate-500">Perfect if you already know the expense details.</p>
                </div>
              </div>
              <ArrowRight size={18} className="text-slate-400" />
            </button>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageSelect}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          <div className="card rounded-[2rem] bg-slate-900 p-6 text-white sm:p-7">
            <div className="eyebrow border-white/10 bg-white/10 text-white">Why this flow works</div>
            <div className="mt-6 space-y-4">
              {[
                'OCR pre-fills the basics so you edit less.',
                'AI suggests structure, category, and line items.',
                'The review step keeps manual control before save.',
              ].map((item) => (
                <div key={item} className="rounded-[1.4rem] border border-white/10 bg-white/8 p-4 text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </Motion.section>
      )}

      {step === 'processing' && (
        <Motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card rounded-[2rem] p-8 sm:p-10"
        >
          <div className="mx-auto max-w-lg text-center">
            <div className="relative mx-auto mb-6 h-24 w-24">
              <div className="h-full w-full rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-primary-700">
                <Sparkles size={28} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Processing your receipt</h3>
            <p className="mt-3 text-sm leading-7 text-slate-500">{processingStep || 'Preparing expense details...'}</p>

            <div className="mt-6 overflow-hidden rounded-full bg-slate-100">
              <Motion.div
                className="h-3 rounded-full bg-[linear-gradient(90deg,#155e75,#1e9b7e,#cb7e37)]"
                initial={{ width: 0 }}
                animate={{ width: `${ocrProgress}%` }}
              />
            </div>
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{ocrProgress}% complete</p>
          </div>
        </Motion.section>
      )}

      {step === 'preview' && (
        <Motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]"
        >
          <div className="space-y-5">
            <div className="card rounded-[2rem] p-6 sm:p-7">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Expense details</p>
                  <h3 className="mt-1 text-2xl font-bold text-slate-900">Review and refine the entry</h3>
                </div>
                <span className={`badge ${currentCategoryMeta.chip}`}>{formData.category}</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                    <Store size={16} />
                    Merchant
                  </label>
                  <input
                    type="text"
                    value={formData.merchant}
                    onChange={(event) => updateFormField('merchant', event.target.value)}
                    placeholder="Store or restaurant name"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                    <DollarSign size={16} />
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(event) => updateFormField('amount', event.target.value)}
                    placeholder="0.00"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                    <DollarSign size={16} />
                    Tax
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.tax}
                    onChange={(event) => updateFormField('tax', event.target.value)}
                    placeholder="0.00"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                    <DollarSign size={16} />
                    Discount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discount}
                    onChange={(event) => updateFormField('discount', event.target.value)}
                    placeholder="0.00"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                    <Calendar size={16} />
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(event) => updateFormField('date', event.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                    <Tag size={16} />
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(event) => updateFormField('category', event.target.value)}
                    className="input-field"
                  >
                    {EXPENSE_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <StickyNote size={16} />
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(event) => updateFormField('notes', event.target.value)}
                  rows={3}
                  placeholder="Add context, reminders, or any useful note..."
                  className="input-field resize-none"
                />
              </div>
            </div>

            <div className="card rounded-[2rem] p-6 sm:p-7">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Line items</p>
                  <h3 className="mt-1 text-xl font-bold text-slate-900">Break the receipt down</h3>
                </div>
                <button type="button" onClick={addItem} className="btn-secondary px-4 py-2 text-sm sm:w-auto">
                  <Plus size={16} />
                  Add item
                </button>
              </div>

              <div className="space-y-3">
                {formData.items.length === 0 ? (
                  <div className="rounded-[1.4rem] border border-dashed border-slate-300 bg-white/45 px-5 py-8 text-center text-sm text-slate-500">
                    No line items yet. Add them manually if you want a more detailed record.
                  </div>
                ) : (
                  formData.items.map((item, index) => (
                    <div key={`${item.name}-${index}`} className="grid gap-3 rounded-[1.4rem] border border-slate-200/80 bg-white/60 p-4 sm:grid-cols-[1fr_160px_auto]">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(event) => updateItem(index, 'name', event.target.value)}
                        placeholder="Item name"
                        className="input-field"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(event) => updateItem(index, 'price', event.target.value)}
                        placeholder="Price"
                        className="input-field"
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="btn-ghost justify-center rounded-[1rem] border border-transparent px-4 py-3 text-rose-600 hover:border-rose-200 hover:bg-rose-50 sm:w-auto"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="card rounded-[2rem] p-6 sm:p-7">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Bill splitting</p>
                  <h3 className="mt-1 text-xl font-bold text-slate-900">Optional shared expense setup</h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextValue = !showSplit;
                    setShowSplit(nextValue);
                    if (nextValue && formData.amount) {
                      autoSplitEvenly();
                    }
                  }}
                  className={`relative h-8 w-15 rounded-full transition ${showSplit ? 'bg-primary-600' : 'bg-slate-300'}`}
                >
                  <span
                    className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${
                      showSplit ? 'left-8' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <AnimatePresence initial={false}>
                {showSplit && (
                  <Motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-4 sm:grid-cols-[180px_auto] sm:items-end">
                      <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">People</label>
                        <input
                          type="number"
                          min="2"
                          value={splitData.totalPeople}
                          onChange={(event) => handleSplitChange(event.target.value)}
                          className="input-field"
                        />
                      </div>
                      <button type="button" onClick={autoSplitEvenly} className="btn-secondary px-5 py-3 text-sm sm:w-auto">
                        <Users size={16} />
                        Split evenly
                      </button>
                    </div>

                    <div className="mt-4 space-y-3">
                      {splitData.participants.map((participant, index) => (
                        <div key={index} className="grid gap-3 rounded-[1.4rem] border border-slate-200/80 bg-white/60 p-4 sm:grid-cols-[1fr_170px]">
                          <input
                            type="text"
                            value={participant.name}
                            onChange={(event) => updateParticipant(index, 'name', event.target.value)}
                            placeholder={`Person ${index + 1}`}
                            className="input-field"
                          />
                          <input
                            type="number"
                            step="0.01"
                            value={participant.amount}
                            onChange={(event) => updateParticipant(index, 'amount', event.target.value)}
                            placeholder="0.00"
                            className="input-field"
                          />
                        </div>
                      ))}
                    </div>
                  </Motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="space-y-5 xl:sticky xl:top-28 xl:self-start">
            <div className={`card rounded-[2rem] bg-gradient-to-br p-6 sm:p-7 ${currentCategoryMeta.soft}`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-13 w-13 items-center justify-center rounded-[1.3rem] ${currentCategoryMeta.iconWrap}`}>
                  <currentCategoryMeta.icon size={22} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Summary</p>
                  <h3 className="text-xl font-bold text-slate-900">{formData.merchant || 'Untitled expense'}</h3>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-[1.4rem] border border-white/70 bg-white/70 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Amount</p>
                  <p className="mt-2 font-['Sora'] text-3xl font-bold text-slate-900">
                    {formData.amount ? formatCurrency(formData.amount) : '$0.00'}
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-white/70 bg-white/70 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Line items total</p>
                  <p className="mt-2 font-['Sora'] text-3xl font-bold text-slate-900">{formatCurrency(lineItemsTotal)}</p>
                </div>
                <div className="rounded-[1.4rem] border border-white/70 bg-white/70 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Tax</p>
                  <p className="mt-2 font-['Sora'] text-3xl font-bold text-slate-900">{formatCurrency(formData.tax || 0)}</p>
                </div>
                <div className="rounded-[1.4rem] border border-white/70 bg-white/70 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Discount</p>
                  <p className="mt-2 font-['Sora'] text-3xl font-bold text-slate-900">{formatCurrency(formData.discount || 0)}</p>
                </div>
                {showSplit ? (
                  <div className="rounded-[1.4rem] border border-white/70 bg-white/70 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Assigned split</p>
                    <p className="mt-2 font-['Sora'] text-3xl font-bold text-slate-900">{formatCurrency(splitAssignedTotal)}</p>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="card rounded-[2rem] p-6">
              <div className="mb-4 flex items-center gap-2">
                <ImageIcon size={17} className="text-slate-400" />
                <p className="text-sm font-bold text-slate-700">Receipt preview</p>
              </div>

              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Receipt preview"
                  className="max-h-72 w-full rounded-[1.5rem] border border-slate-200/80 bg-white object-contain"
                />
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white/45 px-5 py-12 text-center text-sm text-slate-500">
                  No image attached. You can still save a clean manual expense entry.
                </div>
              )}

              {ocrText ? (
                <div className="mt-4 rounded-[1.4rem] border border-slate-200/80 bg-white/65 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">OCR preview</p>
                  <p className="mt-2 max-h-36 overflow-hidden text-sm leading-6 text-slate-600">{ocrText}</p>
                </div>
              ) : null}
            </div>

            <div className="card rounded-[2rem] p-4">
              <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
                <button type="button" onClick={() => setStep('upload')} className="btn-secondary px-5 py-3 text-sm sm:flex-1 xl:w-full">
                  Back to capture
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary px-5 py-3 text-sm sm:flex-1 xl:w-full"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Save expense
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </Motion.section>
      )}
    </div>
  );
}
