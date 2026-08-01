export type StoreTag = 'heb' | 'phoenicia' | 'common-us' | 'eastern-european';

export interface FoodItem {
  id: string;
  nameUk: string;
  nameEn: string;
  aliases: string[];
  categoryId: string;
  storeTags: StoreTag[];
  keywords: string[];
}
