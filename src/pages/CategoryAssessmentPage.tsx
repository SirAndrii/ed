import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { NavigateFunction } from 'react-router-dom';
import type { DifficultyLevel, PastDifficultyLevel, FoodAssessment } from '../types';
import { FOODS, CATEGORIES, getCategoryById } from '../data';
import { CategoryProgress, FoodAssessmentCard, BlockBreak, SessionComplete } from '../components';
import type { useAppStorage } from '../hooks/useAppStorage';
import styles from './CategoryAssessmentPage.module.css';

const BLOCK_SIZE = 10;

type Stage = 'assessing' | 'block-break' | 'complete';

interface Props {
  storageHook: ReturnType<typeof useAppStorage>;
  onNavigate: NavigateFunction;
}

export function CategoryAssessmentPage({ storageHook, onNavigate }: Props) {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { storage, setAssessment, setCategoryProgress, handleExportCategory } = storageHook;

  const category = getCategoryById(categoryId ?? '');
  const allFoods = categoryId
    ? [...FOODS.filter((f) => f.categoryId === categoryId), ...storage.customFoods.filter((f) => f.categoryId === categoryId)]
    : [];

  const savedProgress = categoryId ? storage.categoryProgress[categoryId] : undefined;
  const [currentIndex, setCurrentIndex] = useState(() => savedProgress?.currentFoodIndex ?? 0);
  const [stage, setStage] = useState<Stage>('assessing');

  useEffect(() => {
    if (!categoryId || !category) return;
    if (!savedProgress) {
      setCategoryProgress({
        categoryId,
        status: 'in-progress',
        currentFoodIndex: 0,
        assessedFoodIds: [],
        completedAt: null,
      });
    }
  }, [categoryId]);

  if (!category || !categoryId) {
    return (
      <div>
        <p>Категорію не знайдено.</p>
        <button className="btn-secondary" onClick={() => onNavigate('/categories')}>
          Повернутися до категорій
        </button>
      </div>
    );
  }

  if (allFoods.length === 0) {
    return (
      <div>
        <p>У цій категорії поки немає продуктів.</p>
        <button className="btn-secondary" onClick={() => onNavigate('/categories')}>
          Повернутися
        </button>
      </div>
    );
  }

  const food = allFoods[currentIndex];
  const assessment = food ? storage.assessments[food.id] ?? null : null;
  const total = allFoods.length;
  const progress = storage.categoryProgress[categoryId];

  if (stage === 'complete') {
    return (
      <SessionComplete
        categoryName={category.nameUk}
        onViewResults={() => onNavigate(`/complete/${categoryId}`)}
        onPrint={() => {
          onNavigate(`/complete/${categoryId}`);
          setTimeout(() => window.print(), 300);
        }}
        onBackToCategories={() => onNavigate('/categories')}
        onFinishForToday={() => onNavigate('/')}
        onChooseAnother={() => onNavigate('/categories')}
      />
    );
  }

  if (stage === 'block-break') {
    return (
      <BlockBreak
        categoryName={category.nameUk}
        onContinue={() => setStage('assessing')}
        onBreak={() => onNavigate('/')}
        onViewPartial={() => onNavigate(`/results/${categoryId}`)}
        onFinishNow={() => finishCategory()}
      />
    );
  }

  const updateAssessment = (
    field: 'current' | 'oneYearAgo',
    value: DifficultyLevel | PastDifficultyLevel
  ) => {
    if (!food) return;
    const existing = storage.assessments[food.id];
    const updated: FoodAssessment = {
      foodId: food.id,
      current: field === 'current' ? (value as DifficultyLevel) : (existing?.current ?? null),
      oneYearAgo: field === 'oneYearAgo' ? (value as PastDifficultyLevel) : (existing?.oneYearAgo ?? null),
      updatedAt: new Date().toISOString(),
    };
    setAssessment(updated);

    const currentProgress = storage.categoryProgress[categoryId];
    const alreadyAssessed = currentProgress?.assessedFoodIds ?? [];
    if (!alreadyAssessed.includes(food.id)) {
      setCategoryProgress({
        ...(currentProgress ?? { categoryId, status: 'in-progress', currentFoodIndex: currentIndex, completedAt: null }),
        categoryId,
        status: 'in-progress',
        currentFoodIndex: currentIndex,
        assessedFoodIds: [...alreadyAssessed, food.id],
      });
    }
  };

  const goNext = () => {
    const nextIndex = currentIndex + 1;

    // Update progress index
    const currentProgress = storage.categoryProgress[categoryId];
    setCategoryProgress({
      ...(currentProgress ?? { categoryId, status: 'in-progress', assessedFoodIds: [], completedAt: null }),
      categoryId,
      currentFoodIndex: nextIndex,
      status: 'in-progress',
    });

    if (nextIndex >= total) {
      finishCategory();
      return;
    }

    setCurrentIndex(nextIndex);

    // Block break every BLOCK_SIZE foods
    if (nextIndex % BLOCK_SIZE === 0) {
      setStage('block-break');
    }
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSkip = () => {
    if (!food) return;
    const existing = storage.assessments[food.id];
    if (!existing?.current) {
      setAssessment({
        foodId: food.id,
        current: 'skipped',
        oneYearAgo: existing?.oneYearAgo ?? null,
        updatedAt: new Date().toISOString(),
      });
    }
    goNext();
  };

  const handleSaveExit = () => {
    onNavigate('/');
  };

  const finishCategory = () => {
    const currentProgress = storage.categoryProgress[categoryId];
    setCategoryProgress({
      ...(currentProgress ?? { categoryId, assessedFoodIds: [], currentFoodIndex: total }),
      categoryId,
      status: 'completed',
      currentFoodIndex: total,
      completedAt: new Date().toISOString(),
    });
    setStage('complete');
  };

  if (!food) return null;

  return (
    <div className={styles.wrapper}>
      <CategoryProgress
        categoryName={category.nameUk}
        current={currentIndex + 1}
        total={total}
      />

      <FoodAssessmentCard
        food={food}
        assessment={assessment}
        showStoreTags={storage.preferences.showStoreTags}
        onChangeCurrent={(v) => updateAssessment('current', v)}
        onChangePast={(v) => updateAssessment('oneYearAgo', v)}
        onNext={goNext}
        onBack={goBack}
        onSkip={handleSkip}
        onSaveExit={handleSaveExit}
        isFirst={currentIndex === 0}
        isLast={currentIndex === total - 1}
      />
    </div>
  );
}
