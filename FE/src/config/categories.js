export const MAIN_CATEGORIES = [
  { label: 'Sticker Single', to: '/pages/category.html?cat=stickers', cat: 'stickers' },
  { label: 'Sticker Sheet', to: '/pages/category.html?cat=sticker sheets', cat: 'sticker sheets' },
  { label: 'Keychain', to: '/pages/category.html?cat=medals', cat: 'medals' },
  { label: 'Mug', to: '/pages/category.html?cat=mugs', cat: 'mugs' },
  { label: 'Visa Skin', to: '/pages/category.html?cat=visa stickers', cat: 'visa stickers' },
  { label: 'Coaster', to: '/pages/category.html?cat=coaster', cat: 'coaster' },
  { label: 'Offers', to: '/pages/offers.html' },
  { label: 'Packages', to: '/pages/packages.html' },
];

export const PRODUCT_CATEGORIES = [
  ...MAIN_CATEGORIES.filter(c => c.cat),
  { cat: 'laptop stickers', label: 'Laptop Stickers' },
];

export const PRODUCT_TYPES = [
  { value: 'sport', label: 'Sport' },
  { value: 'nationalitie', label: 'Nationality' },
  { value: 'cartoon', label: 'Cartoon' },
  { value: 'superheros', label: 'Superheros' },
  { value: 'series', label: 'Series' },
  { value: 'music', label: 'Music' },
  { value: 'colledge', label: 'College' },
  { value: 'anime', label: 'Anime' },
  { value: 'cute', label: 'Cute' },
  { value: 'memes', label: 'Memes' },
  { value: 'coat', label: 'Coat' },
  { value: 'speech', label: 'Speech' },
];

const HIDDEN_CATEGORY_LABELS = { 'laptop stickers': 'Laptop Stickers' };

export const getCategoryLabel = (cat) =>
  MAIN_CATEGORIES.find(c => c.cat === cat)?.label || HIDDEN_CATEGORY_LABELS[cat] || cat;

export const getProductTypeLabel = (type) =>
  PRODUCT_TYPES.find(t => t.value === type)?.label || type;
