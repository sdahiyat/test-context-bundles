'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MealType, PendingMealItem, Meal } from '@/types/nutrition';
import MealTypeSelector from '@/components/meal-logging/MealTypeSelector';
import FoodSearchPanel from '@/components/meal-logging/FoodSearchPanel';
import MealItemsList from '@/components/meal-logging/MealItemsList';
import MealConfirmation from '@/components/meal-logging/MealConfirmation';

type Step = 1 | 2 | 3;

const STEP_LABELS = ['Meal Type', 'Add Foods', 'Confirm'];

export default function LogMealPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [mealType, setMealType] = useState<MealType | null>(null);
  const [mealDate, setMealDate] = useState(new Date().toISOString().split('T')[0]);
  const [pendingItems, setPendingItems] = useState<PendingMealItem[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [submittedMeal, setSubmittedMeal] = useState<Meal | null>(null);

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
        notes: notes.trim() || undefined,
        items: pendingItems.map((item) => ({
          food_id: item.food.id,
          quantity: item.quantity,
          unit: item.unit,
        })),
      };

      const res = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save meal');
      }

      const meal = await res.json();
      setSubmittedMeal(meal);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Success state
  if (submittedMeal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="text-6xl">🎉</div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Meal Logged!</h2>
            <p className="text-gray-500 mt-2">
              Your {submittedMeal.meal_type} has been saved successfully.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href="/dashboard"
              className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors block"
            >
              View Dashboard
            </Link>
            <button
              onClick={() => {
                setSubmittedMeal(null);
                setStep(1);
                setMealType(null);
                setMealDate(new Date().toISOString().split('T')[0]);
                setPendingItems([]);
                setNotes('');
                setSubmitError(undefined);
              }}
              className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Log Another Meal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors text-sm">
              ← Home
            </Link>
            <h1 className="text-lg font-bold text-gray-800 flex-1 text-center">Log a Meal</h1>
            <div className="w-12" /> {/* spacer */}
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-1">
            {([1, 2, 3] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      step >= s
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {step > s ? '✓' : s}
                  </div>
                  <span className={`text-xs mt-0.5 ${step >= s ? 'text-green-600' : 'text-gray-400'}`}>
                    {STEP_LABELS[i]}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className={`h-0.5 flex-1 mx-1 rounded transition-colors ${
                      step > s ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {step === 1 && (
          <MealTypeSelector
            selected={mealType}
            onSelect={setMealType}
            mealDate={mealDate}
            onDateChange={setMealDate}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <div className="space-y-4">
            {mealType && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Logging</span>
                <span className="capitalize font-semibold text-green-600">{mealType}</span>
                <span>for</span>
                <span className="font-medium text-gray-700">
                  {new Date(mealDate + 'T00:00:00').toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <button
                  onClick={() => setStep(1)}
                  className="ml-auto text-blue-500 hover:text-blue-700 text-xs"
                >
                  Change
                </button>
              </div>
            )}
            <FoodSearchPanel onAddItem={handleAddItem} />
            <MealItemsList
              items={pendingItems}
              onRemove={handleRemoveItem}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          </div>
        )}

        {step === 3 && mealType && (
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
