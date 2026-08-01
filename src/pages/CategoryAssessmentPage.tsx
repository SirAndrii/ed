import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import type { NavigateFunction } from 'react-router-dom';
import type { DifficultyLevel, PastDifficultyLevel, FoodAssessment } from '../types';
import { FOODS, getCategoryById } from '../data';
import { CategoryProgress, FoodAssessmentCard, BlockBreak, SessionComplete } from '../components';
import { PastAssessmentCard } from '../components/PastAssessmentCard';
import type { useAppStorage } from '../hooks/useAppStorage';
import styles from './CategoryAssessmentPage.module.css';

const BLOCK_SIZE = 10;

type Stage = 'assessing' | 'block-break' | 'complete' | 'past-survey';

interface Props {
  storageHook: ReturnType<typeof useAppStorage>;
  onNavigate: NavigateFunction;
}

export function CategoryAssessmentPage({ storageHook, onNavigate }: Props) {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { storage, setAssessment, setCategoryProgress } = storageHook;

  const category = getCategoryById(categoryId ?? '');
  const allFoods = categoryId
    ? [
        ...FOODS.filter((f) => f.categoryId === categoryId),
        ...storage.customFoods.filter((f) => f.categoryId === categoryId),
      ]
    : [];

  const savedProgress = categoryId ? storage.categoryProgress[categoryId] : undefined;
  const [currentIndex, setCurrentIndex] = useState(() => savedProgress?.currentFoodIndex ?? 0);
  const [stage, setStage] = useState<Stage>('assessing');
  const [pastIndex, setPastIndex] = useState(0);

  // Prevent double-advance on fast clicks
  const advancing = useRef(false);

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

  const total = allFoods.length;
  const food = allFoods[currentIndex] ?? allFoods[0];
  const assessment = food ? (storage.assessments[food.id] ?? null) : null;

  // ── COMPLETE screen ──────────────────────────────────────────────────────
  if (stage === 'complete') {
    return (
      <SessionComplete
        categoryName={category.nameUk}
        onViewResults={() => onNavigate(`/complete/${categoryId}`)}
        onPrint={() => { onNavigate(`/complete/${categoryId}`); setTimeout(() => window.print(), 300); }}
        onBackToCategories={() => onNavigate('/categories')}
        onFinishForToday={() => onNavigate('/')}
        onChooseAnother={() => onNavigate('/categories')}
        onStartPastSurvey={() => { setPastIndex(0); setStage('past-survey'); }}
      />
    );
  }

  // ── BLOCK BREAK ──────────────────────────────────────────────────────────
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

  // ── PAST SURVEY ──────────────────────────────────────────────────────────
  if (stage === 'past-survey') {
    const pastFood = allFoods[pastIndex];
    const pastAssessment = pastFood ? (storage.assessments[pastFood.id] ?? null) : null;

    const handlePastSelect = (value: PastDifficultyLevel) => {
      if (!pastFood || advancing.current) return;
      advancing.current = true;

      const existing = storage.assessments[pastFood.id];
      const updated: FoodAssessment = {
        foodId: pastFood.id,
        current: existing?.current ?? null,
        oneYearAgo: value,
        updatedAt: new Date().toISOString(),
      };
      setAssessment(updated);

      setTimeout(() => {
        advancing.current = false;
        const next = pastIndex + 1;
        if (next >= total) {
          setStage('complete');
        } else {
          setPastIndex(next);
        }
      }, 300);
    };

    return (
      <div className={styles.wrapper}>
        <div className={styles.pastHeader}>
          <span className={styles.pastBadge}>Опитування: рік тому</span>
          <CategoryProgress
            categoryName={category.nameUk}
            current={pastIndex + 1}
            total={total}
          />
        </div>
        <PastAssessmentCard
          food={pastFood}
          assessment={pastAssessment}
          onSelect={handlePastSelect}
          onBack={() => { if (pastIndex > 0) setPastIndex(pastIndex - 1); }}
          onSaveExit={() => onNavigate('/')}
          isFirst={pastIndex === 0}
        />
      </div>
    );
  }

  // ── MAIN ASSESSING ───────────────────────────────────────────────────────

  const updateAndAdvance = (value: DifficultyLevel) => {
    if (!food || advancing.current) return;
    advancing.current = true;

    // 1. Save assessment immediately
    const existing = storage.assessments[food.id];
    const updated: FoodAssessment = {
      foodId: food.id,
      current: value,
      oneYearAgo: existing?.oneYearAgo ?? null,
      updatedAt: new Date().toISOString(),
    };
    setAssessment(updated);

    // 2. Update assessed list
    const currentProgress = storage.categoryProgress[categoryId];
    const alreadyAssessed = currentProgress?.assessedFoodIds ?? [];
    if (!alreadyAssessed.includes(food.id)) {
      setCategoryProgress({
        ...(currentProgress ?? { categoryId, status: 'in-progress', completedAt: null }),
        categoryId,
        status: 'in-progress',
        currentFoodIndex: currentIndex,
        assessedFoodIds: [...alreadyAssessed, food.id],
      });
    }

    // 3. Advance after short delay (visual feedback)
    setTimeout(() => {
      advancing.current = false;
      goNext();
    }, 300);
  };

  const goNext = () => {
    const nextIndex = currentIndex + 1;
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

    if (nextIndex % BLOCK_SIZE === 0) {
      setStage('block-break');
    }
  };

  const goBack = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
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
        onSelect={updateAndAdvance}
        onBack={goBack}
        onSaveExit={() => onNavigate('/')}
        isFirst={currentIndex === 0}
      />
    </div>
  );
}
