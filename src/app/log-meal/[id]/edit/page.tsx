'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Meal, MealType, PendingMealItem, MEAL_TYPES } from '@/types/nutrition';
import FoodSearchPanel from '@/components/meal-logging/FoodSearchPanel';
import MealItemsList from '@/components/meal-logging/MealItemsList';
import MealConfirmation from '@/components/meal-logging/MealConfirmation';

type EditStep = 2 | 3;

const MEAL_TYPE_ICONS: Record<MealType, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
};

export default function EditMealPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [meal, setMeal] = useState<Meal | null>(null);

  const [step, setStep] = useState<EditStep>(2);
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [mealDate, setMealDate] = useState(new Date().toISOString().split('T')[0]);
  const [pendingItems, setPendingItems] = useState<PendingMealItem[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();

  useEffect(() => {
    async function loadMeal() {
      try {
        const res = await fetch(`/api/meals/${params.id}`);
        if (res.status === 401) {
          router.push('/auth/login');
          return;
        }
        if (res.status === 403 || res.status === 404) {
          setLoadError('Meal not found or you do not have permission to edit it.');
          setIsLoading(false);
          return;
        }
        if (!res.ok) {
          throw new Error('Failed to load meal');
        }

        const data: Meal = await res.json();
        setMeal(data);
        setMealType(data.meal_type);
        setMealDate(data.logged_at);
        setNotes(data.notes || '');

        // Convert MealItem[] to PendingMealItem[]
        const converted: PendingMealItem[] = (data.items || []).map((item) => ({
          food: item.food!,
          quantity: item.quantity,
          unit: item.unit as PendingMealItem['unit'],
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
        }));
        setPendingItems(converted);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Failed to load meal');
      } finally {
        setIsLoading(false);
      }
    }

    loadMeal();
  }, [params.id, router]);

  function handleAddItem(item: PendingMealItem) {
    setPendingItems((prev) => [...prev, item]);
  }

  function handleRemoveItem(index: number) {
    setPendingItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!mealType || pendingItems.length === 0) return;

    setIsSubmitting(true);
    setSubmitError(undefined);

    try {
      const body = {
        meal_type: mealType,
        logged_at: mealDate,
        notes: notes.trim() || null,
        items: pendingItems.map((item) => ({
          food_id: item.food.id,
          quantity: item.quantity,
          unit: item.unit,
        })),
      };

      const res = await fetch(`/api/meals/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update meal');
      }

      router.push('/dashboard');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading meal...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="text-5xl">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800">Error</h2>
          <p className="text-gray-500">{loadError}</p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors text-sm">
              ← Dashboard
            </Link>
            <h1 className="text-lg font-bold text-gray-800 flex-1 text-center">Edit Meal</h1>
            <div className="w-20" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Meal type & date editor */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Meal Details</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Meal Type</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value as MealType)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {MEAL_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {MEAL_TYPE_ICONS[type]} {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
              <input
                type="date"
                value={mealDate}
                onChange={(e) => setMealDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {step === 2 && (
          <>
            <FoodSearchPanel onAddItem={handleAddItem} />
            <MealItemsList
              items={pendingItems}
              onRemove={handleRemoveItem}
              onBack={() => router.push('/dashboard')}
              onNext={() => setStep(3)}
            />
          </>
        )}

        {step === 3 && (
          <MealConfirmation
            mealType={mealType}
            mealDate={mealDate}
            items={pendingItems}
            notes={notes}
            onNotesChange={setNotes}
            onBack={() => setStep(2)}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            error={submitError}
          />
        )}
      </div>
    </div>
  );
}
