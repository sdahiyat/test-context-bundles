'use client';

import { useState, useEffect, useRef } from 'react';
import { Food, CreateFoodInput, calculateNutrition } from '@/types/food';

interface CreateFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFoodCreated: (food: Food) => void;
  prefillName?: string;
}

type FormState = {
  name: string;
  brand: string;
  calories_per_100g: string;
  protein_per_100g: string;
  carbs_per_100g: string;
  fat_per_100g: string;
  fiber_per_100g: string;
  serving_size_g: string;
  serving_size_label: string;
};

const initialForm: FormState = {
  name: '',
  brand: '',
  calories_per_100g: '',
  protein_per_100g: '',
  carbs_per_100g: '',
  fat_per_100g: '',
  fiber_per_100g: '',
  serving_size_g: '100',
  serving_size_label: '100g',
};

export default function CreateFoodModal({
  isOpen,
  onClose,
  onFoodCreated,
  prefillName = '',
}: CreateFoodModalProps) {
  const [form, setForm] = useState<FormState>({ ...initialForm, name: prefillName });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const firstInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens/prefillName changes
  useEffect(() => {
    if (isOpen) {
      setForm({ ...initialForm, name: prefillName });
      setErrors({});
      setServerError(null);
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [isOpen, prefillName]);

  // Trap focus & handle Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const handleChange = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';

    const numFields: Array<[keyof FormState, string]> = [
      ['calories_per_100g', 'Calories'],
      ['protein_per_100g', 'Protein'],
      ['carbs_per_100g', 'Carbohydrates'],
      ['fat_per_100g', 'Fat'],
    ];

    for (const [field, label] of numFields) {
      const val = parseFloat(form[field]);
      if (form[field] === '') {
        errs[field] = `${label} is required`;
      } else if (isNaN(val) || val < 0) {
        errs[field] = `${label} must be a non-negative number`;
      }
    }

    if (form.fiber_per_100g !== '') {
      const val = parseFloat(form.fiber_per_100g);
      if (isNaN(val) || val < 0) errs.fiber_per_100g = 'Fiber must be a non-negative number';
    }

    if (form.serving_size_g !== '') {
      const val = parseFloat(form.serving_size_g);
      if (isNaN(val) || val <= 0) errs.serving_size_g = 'Serving size must be a positive number';
    }

    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    const payload: CreateFoodInput = {
      name: form.name.trim(),
      brand: form.brand.trim() || undefined,
      calories_per_100g: parseFloat(form.calories_per_100g),
      protein_per_100g: parseFloat(form.protein_per_100g),
      carbs_per_100g: parseFloat(form.carbs_per_100g),
      fat_per_100g: parseFloat(form.fat_per_100g),
      fiber_per_100g: form.fiber_per_100g !== '' ? parseFloat(form.fiber_per_100g) : undefined,
      serving_size_g: form.serving_size_g !== '' ? parseFloat(form.serving_size_g) : 100,
      serving_size_label: form.serving_size_label.trim() || '100g',
    };

    try {
      const res = await fetch('/api/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const body = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setServerError('A custom food with this name already exists.');
        } else if (body.errors) {
          setErrors(body.errors);
        } else {
          setServerError(body.error ?? 'Failed to create food');
        }
        return;
      }

      onFoodCreated(body as Food);
      onClose();
    } catch {
      setServerError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Live preview nutrition
  const previewFood = {
    calories_per_100g: parseFloat(form.calories_per_100g) || 0,
    protein_per_100g: parseFloat(form.protein_per_100g) || 0,
    carbs_per_100g: parseFloat(form.carbs_per_100g) || 0,
    fat_per_100g: parseFloat(form.fat_per_100g) || 0,
    fiber_per_100g: parseFloat(form.fiber_per_100g) || null,
    serving_size_g: parseFloat(form.serving_size_g) || 100,
  } as Food;

  const preview = calculateNutrition(previewFood, previewFood.serving_size_g);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-food-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 id="create-food-title" className="text-lg font-bold text-gray-900">
            Create Custom Food
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-5">
          {serverError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {serverError}
            </div>
          )}

          {/* Name & Brand */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Food Name <span className="text-red-500">*</span>
              </label>
              <input
                ref={firstInputRef}
                type="text"
                value={form.name}
                onChange={handleChange('name')}
                placeholder="e.g. Homemade Granola"
                className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={form.brand}
                onChange={handleChange('brand')}
                placeholder="e.g. Homemade"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Per 100g macros */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Nutrition per 100g <span className="text-red-500">*</span>
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {([
                ['calories_per_100g', 'Calories', 'kcal'],
                ['protein_per_100g', 'Protein', 'g'],
                ['carbs_per_100g', 'Carbs', 'g'],
                ['fat_per_100g', 'Fat', 'g'],
              ] as const).map(([field, label, unit]) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {label} ({unit})
                  </label>
                  <input
                    type="number"
                    value={form[field]}
                    onChange={handleChange(field)}
                    placeholder="0"
                    min={0}
                    step={0.1}
                    className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      errors[field] ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  {errors[field] && (
                    <p className="mt-1 text-xs text-red-600">{errors[field]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Fiber */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Fiber (g) <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="number"
                value={form.fiber_per_100g}
                onChange={handleChange('fiber_per_100g')}
                placeholder="0"
                min={0}
                step={0.1}
                className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.fiber_per_100g ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.fiber_per_100g && (
                <p className="mt-1 text-xs text-red-600">{errors.fiber_per_100g}</p>
              )}
            </div>
          </div>

          {/* Serving size */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Serving Size (g)
              </label>
              <input
                type="number"
                value={form.serving_size_g}
                onChange={handleChange('serving_size_g')}
                min={0.1}
                step={1}
                className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.serving_size_g ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.serving_size_g && (
                <p className="mt-1 text-xs text-red-600">{errors.serving_size_g}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Serving Label
              </label>
              <input
                type="text"
                value={form.serving_size_label}
                onChange={handleChange('serving_size_label')}
                placeholder="e.g. 1 cup"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Live Preview */}
          {(form.calories_per_100g || form.protein_per_100g || form.carbs_per_100g || form.fat_per_100g) && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
              <p className="text-sm font-semibold text-emerald-800 mb-2">
                Preview — per {form.serving_size_label || `${form.serving_size_g}g`}
              </p>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { label: 'Cal', value: `${Math.round(preview.calories)}`, color: 'text-gray-900' },
                  { label: 'Protein', value: `${preview.protein}g`, color: 'text-blue-700' },
                  { label: 'Carbs', value: `${preview.carbs}g`, color: 'text-amber-600' },
                  { label: 'Fat', value: `${preview.fat}g`, color: 'text-rose-600' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-white rounded-lg py-2 px-1">
                    <p className={`text-sm font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating…' : 'Create Food'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
