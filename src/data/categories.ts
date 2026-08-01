import type { Category } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 'fruits',
    nameUk: 'Фрукти та ягоди',
    description: 'Свіжі фрукти, ягоди, сухофрукти та консерви',
    icon: '🍎',
  },
  {
    id: 'vegetables',
    nameUk: 'Овочі',
    description: 'Свіжі, варені, квашені та мариновані овочі',
    icon: '🥦',
  },
  {
    id: 'bread',
    nameUk: 'Хліб і випічка',
    description: 'Хліб, булочки, лаваш та інша випічка',
    icon: '🍞',
  },
  {
    id: 'grains',
    nameUk: 'Крупи',
    description: 'Гречка, рис, вівсянка та інші крупи',
    icon: '🌾',
  },
  {
    id: 'pasta',
    nameUk: 'Макарони',
    description: 'Різні види макаронних виробів',
    icon: '🍝',
  },
  {
    id: 'dairy',
    nameUk: 'Молочні продукти',
    description: 'Молоко, сири, йогурт, масло та вершки',
    icon: '🥛',
  },
  {
    id: 'eggs',
    nameUk: 'Яйця',
    description: 'Яйця та яєчні продукти',
    icon: '🥚',
  },
  {
    id: 'meat',
    nameUk: "М'ясо та птиця",
    description: "Курка, яловичина, свинина та інше м'ясо",
    icon: '🍗',
  },
  {
    id: 'sausages',
    nameUk: "Ковбаси й м'ясні продукти",
    description: 'Ковбаси, шинка, сосиски та схожі продукти',
    icon: '🌭',
  },
  {
    id: 'fish',
    nameUk: 'Риба та морепродукти',
    description: 'Свіжа, копчена, консервована риба та морепродукти',
    icon: '🐟',
  },
  {
    id: 'legumes',
    nameUk: 'Бобові',
    description: 'Квасоля, нут, сочевиця та тофу',
    icon: '🫘',
  },
  {
    id: 'potatoes',
    nameUk: 'Картопля та інші гарніри',
    description: 'Картопля різних приготувань, гарніри',
    icon: '🥔',
  },
  {
    id: 'nuts',
    nameUk: 'Горіхи й насіння',
    description: 'Різні горіхи, насіння та горіхові пасти',
    icon: '🥜',
  },
  {
    id: 'sauces',
    nameUk: 'Соуси та намазки',
    description: 'Соуси, пасти, джеми та інші намазки',
    icon: '🫙',
  },
  {
    id: 'sweets',
    nameUk: 'Солодощі',
    description: 'Шоколад, печиво, торти та інші солодощі',
    icon: '🍫',
  },
  {
    id: 'snacks',
    nameUk: 'Снеки',
    description: 'Чипси, крекери, батончики та легкі закуски',
    icon: '🍿',
  },
  {
    id: 'drinks',
    nameUk: 'Напої',
    description: 'Вода, соки, чай, молочні та інші напої',
    icon: '🥤',
  },
  {
    id: 'american',
    nameUk: 'Американські продукти',
    description: 'Поширені американські страви та продукти',
    icon: '🇺🇸',
  },
  {
    id: 'custom',
    nameUk: 'Мої продукти',
    description: 'Продукти, які ти додала самостійно',
    icon: '⭐',
    isCustom: true,
  },
];

export const getCategoryById = (id: string): Category | undefined =>
  CATEGORIES.find((c) => c.id === id);
