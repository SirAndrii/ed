# Food Assessment App

Вебзастосунок для оцінювання продуктів за рівнем складності. Допомагає структуровано записати, наскільки різні продукти здаються складними, та порівняти зміни з часом.

## Технологічний стек

- React 18
- TypeScript
- Vite
- CSS Modules
- React Router (HashRouter)
- localStorage — зберігання даних
- Vitest + Testing Library — тести
- GitHub Actions — автоматичний деплой на GitHub Pages

## Встановлення

```bash
npm install
```

## Команди

```bash
npm run dev       # локальний сервер
npm run build     # production build
npm run preview   # перегляд production build
npm run test      # запустити тести
```

## Локальний запуск

```bash
npm install
npm run dev
```

Відкрий `http://localhost:5173/food-assessment/` у браузері.

## Production build

```bash
npm run build
```

Файли готові до деплою у папці `dist/`.

## GitHub Pages

1. Зроби push у гілку `main`.
2. GitHub Actions автоматично збере та задеплоє на GitHub Pages.
3. Додаток буде доступний за адресою: `https://<username>.github.io/food-assessment/`

## Зберігання даних (localStorage)

Дані зберігаються **лише в цьому браузері**.

> Якщо очистити дані браузера або перейти на інший пристрій, вони не перенесуться автоматично.

**Ключ:** `food-assessment-v1`

## Експорт та імпорт

- Відкрий **Налаштування → Експортувати всі дані** — завантажиться JSON-файл.
- Для відновлення: **Налаштування → Імпортувати дані** → обери файл.

Можна також експортувати окрему категорію: **Результати → Експортувати цю категорію**.

## Додавання продуктів

### Через інтерфейс

Відкрий **Знайти продукт** → якщо продукт не знайдено → **Додати свій продукт**.

### Через код

Відкрий `src/data/foods.ts` та додай запис:

```ts
{
  id: 'my-product',
  nameUk: 'Назва',
  nameEn: 'Name',
  aliases: ['альтернативна назва', 'alternative'],
  categoryId: 'custom', // або будь-яка існуюча категорія
  storeTags: ['heb', 'common-us'],
  keywords: ['ключове слово'],
}
```

## Додавання нової категорії

1. Додай запис у `src/data/categories.ts`:
```ts
{
  id: 'new-category',
  nameUk: 'Нова категорія',
  description: 'Опис',
  icon: '🍽️',
}
```
2. Додай продукти в `src/data/foods.ts` з `categoryId: 'new-category'`.

## Структура даних

```ts
interface AppStorage {
  schemaVersion: 1;
  assessments: Record<string, FoodAssessment>;  // оцінки
  customFoods: FoodItem[];                       // власні продукти
  categoryProgress: Record<string, CategoryProgress>; // прогрес
  lastActiveCategoryId: string | null;
  preferences: { reducedMotion: boolean; showStoreTags: boolean; reportName: string; };
}

type DifficultyLevel = 'low' | 'medium' | 'high' | 'unsure' | 'unfamiliar' | 'skipped';
```

## Обмеження Phase 1

- Немає рекомендацій, що їсти
- Немає підрахунку калорій / ваги / BMI
- Немає формування меню
- Немає авторизації
- Немає серверу або зовнішньої бази даних
- Немає live-пошуку на сторонніх сайтах

## Phase 2 (план)

- Формування меню на основі рівнів складності
- Список продуктів для майбутніх спроб
- Рулетка продуктів середньої складності
- Погодження експериментів із терапевтом або дієтологом
