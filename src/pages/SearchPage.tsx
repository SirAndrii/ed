import { useState } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import type { FoodItem } from '../types';
import { FOODS } from '../data';
import { FoodSearch } from '../components';
import type { useAppStorage } from '../hooks/useAppStorage';
import styles from './SearchPage.module.css';

interface Props {
  storageHook: ReturnType<typeof useAppStorage>;
  onNavigate: NavigateFunction;
}

export function SearchPage({ storageHook, onNavigate }: Props) {
  const { storage, addCustomFood } = storageHook;
  const [showAddForm, setShowAddForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customNameEn, setCustomNameEn] = useState('');
  const [customCategoryId, setCustomCategoryId] = useState('custom');

  const allFoods = [...FOODS, ...storage.customFoods];

  const handleAssess = (food: FoodItem) => {
    onNavigate(`/assess/${food.categoryId}`);
  };

  const handleGoToCategory = (categoryId: string) => {
    onNavigate(`/assess/${categoryId}`);
  };

  const handleAddCustom = (query: string) => {
    setCustomName(query);
    setShowAddForm(true);
  };

  const handleSaveCustom = () => {
    if (!customName.trim()) return;
    const id = `custom-${Date.now()}`;
    addCustomFood({
      id,
      nameUk: customName.trim(),
      nameEn: customNameEn.trim() || customName.trim(),
      aliases: [],
      categoryId: customCategoryId,
      storeTags: [],
      keywords: [],
    });
    setCustomName('');
    setCustomNameEn('');
    setShowAddForm(false);
  };

  return (
    <div>
      <h1 className="page-title">Знайти продукт</h1>
      <p className="page-subtitle">
        Пошук за українською, англійською або альтернативними назвами.
      </p>

      <FoodSearch
        foods={allFoods}
        assessments={storage.assessments}
        showStoreTags={storage.preferences.showStoreTags}
        onAssess={handleAssess}
        onGoToCategory={handleGoToCategory}
        onAddCustom={handleAddCustom}
      />

      {showAddForm && (
        <div className={styles.addForm}>
          <h2 className={styles.addTitle}>Додати свій продукт</h2>
          <label className={styles.fieldLabel}>
            Назва (українська або як зручно)
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className={styles.input}
              placeholder="Наприклад: Млинці з сиром"
              autoFocus
            />
          </label>
          <label className={styles.fieldLabel}>
            Англійська назва (необов'язково)
            <input
              type="text"
              value={customNameEn}
              onChange={(e) => setCustomNameEn(e.target.value)}
              className={styles.input}
              placeholder="Crepes with cottage cheese"
            />
          </label>
          <label className={styles.fieldLabel}>
            Категорія
            <select
              value={customCategoryId}
              onChange={(e) => setCustomCategoryId(e.target.value)}
              className={styles.input}
            >
              {[
                { id: 'fruits', nameUk: 'Фрукти та ягоди' },
                { id: 'vegetables', nameUk: 'Овочі' },
                { id: 'bread', nameUk: 'Хліб і випічка' },
                { id: 'grains', nameUk: 'Крупи' },
                { id: 'pasta', nameUk: 'Макарони' },
                { id: 'dairy', nameUk: 'Молочні продукти' },
                { id: 'eggs', nameUk: 'Яйця' },
                { id: 'meat', nameUk: "М'ясо та птиця" },
                { id: 'sausages', nameUk: "Ковбаси й м'ясні продукти" },
                { id: 'fish', nameUk: 'Риба та морепродукти' },
                { id: 'legumes', nameUk: 'Бобові' },
                { id: 'potatoes', nameUk: 'Картопля та інші гарніри' },
                { id: 'nuts', nameUk: 'Горіхи й насіння' },
                { id: 'sauces', nameUk: 'Соуси та намазки' },
                { id: 'sweets', nameUk: 'Солодощі' },
                { id: 'snacks', nameUk: 'Снеки' },
                { id: 'drinks', nameUk: 'Напої' },
                { id: 'american', nameUk: 'Американські продукти' },
                { id: 'custom', nameUk: 'Мої продукти' },
              ].map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.nameUk}</option>
              ))}
            </select>
          </label>
          <div className={styles.formActions}>
            <button className="btn-primary" onClick={handleSaveCustom} disabled={!customName.trim()}>
              Зберегти
            </button>
            <button className="btn-secondary" onClick={() => setShowAddForm(false)}>
              Скасувати
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
