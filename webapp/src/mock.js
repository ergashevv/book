/** Kitob muqovasi – har bir kitob uchun barqaror placeholder rasm (200x300) */
export function getBookCoverImageUrl(bookId) {
  return `https://picsum.photos/seed/book-${bookId}/200/300`;
}
/** Muallif avatar – barqaror profil rasm */
export function getAuthorImageUrl(authorId) {
  return `https://i.pravatar.cc/150?u=author-${authorId}`;
}
/** Vendor logo placeholder */
export function getVendorLogoUrl(vendorId) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(vendorId)}&size=128&background=ea580c&color=fff`;
}

export const MOCK_BOOKS = [
  { id: '1', title: 'The Kite Runner', author: 'Khaled Hosseini', price: 19.99, vendorId: 'gd', category: 'Novels' },
  { id: '2', title: 'The Subtle Art of Not Giving A F*CK', author: 'Mark Manson', price: 19.99, vendorId: 'gd', category: 'Self Love' },
  { id: '3', title: 'Sun Tzu: The Art of War', author: 'Sun Tzu', price: 19.99, vendorId: 'gd', category: 'Science' },
  { id: '4', title: 'APOLLO', author: 'Author', price: 24.99, vendorId: 'gd', category: 'Novels' },
  { id: '5', title: 'The Da Vinci Code', author: 'Dan Brown', price: 19.99, vendorId: 'gd', category: 'Novels' },
  { id: '6', title: 'The Princess Diarist', author: 'Carrie Fisher', price: 27.12, vendorId: 'gd', category: 'Romantic' },
  { id: '7', title: 'The Good Sister', author: 'Drusilla Campbell', price: 27.12, vendorId: 'gd', category: 'Novels' },
  { id: '8', title: 'The Waiting', author: 'Corinne Michaels', price: 27.12, vendorId: 'gd', category: 'Romantic' },
  { id: '9', title: 'Bright Young Things', author: 'Author', price: 27.12, vendorId: 'gd', category: 'Novels' },
].map((b) => ({ ...b, coverUrl: getBookCoverImageUrl(b.id) }));

export const MOCK_VENDORS = [
  { id: 'wattpad', name: 'Wattpad', rating: 5 },
  { id: 'kuromi', name: 'Kuromi', rating: 5 },
  { id: 'crane', name: 'Crane & Co', rating: 4.5 },
  { id: 'gd', name: 'GoodDay', rating: 5 },
  { id: 'warehouse', name: 'Warehouse', rating: 4 },
  { id: 'pappa', name: 'Pappa Pig', rating: 4.5 },
  { id: 'jstor', name: 'JSTOR', rating: 5 },
  { id: 'peloton', name: 'Peloton', rating: 4 },
  { id: 'haymarket', name: 'Haymarket', rating: 5 },
].map((v) => ({ ...v, logo: getVendorLogoUrl(v.id) }));

export const MOCK_AUTHORS = [
  { id: '1', name: 'John Freeman', role: 'Writer', bio: 'American writer and critic.', rating: 4, bookIds: ['5', '6'] },
  { id: '2', name: 'Tess Gunty', role: 'Novelist', bio: 'Gunty was born and raised in South Bend, Indiana. She studied at University and New York University.', rating: 4, bookIds: ['5', '7', '8', '9'] },
  { id: '3', name: 'Richard Po...', role: 'Author', bio: '', rating: 4, bookIds: [] },
  { id: '4', name: 'Adam Dalva', role: 'Senior fiction editor', bio: '', rating: 4, bookIds: [] },
  { id: '5', name: 'Abraham Verghese', role: 'Professor', bio: 'Linda R. Meier and...', rating: 4, bookIds: [] },
  { id: '6', name: 'Ann Napolitano', role: 'Author', bio: '', rating: 4, bookIds: [] },
  { id: '7', name: 'Herman Diaz', role: 'Author', bio: '', rating: 4, bookIds: [] },
].map((a) => ({ ...a, image: getAuthorImageUrl(a.id) }));

export const CATEGORIES = ['All', 'Novels', 'Self Love', 'Science', 'Romantic', 'Poets', 'Playwrights', 'Novelists', 'Journalists', 'Blogs', 'Special for you'];

export const COUPONS = [
  { id: '1', code: 'SAVE50', discount: '50% OFF', color: '#000' },
  { id: '2', code: 'SAVE23', discount: '23% OFF', color: '#eab308' },
  { id: '3', code: 'SAVE15', discount: '15% OFF', color: '#3b82f6' },
  { id: '4', code: 'SAVE30', discount: '30% OFF', color: '#ea580c' },
  { id: '5', code: 'SAVE10', discount: '10% OFF', color: '#22c55e' },
  { id: '6', code: 'SAVE20', discount: '20% OFF', color: '#8b5cf6' },
];

export const DEFAULT_ADDRESS = {
  street: 'Utama Street No.20, Dumbo',
  city: 'New York',
  full: 'Utama Street No.20, Dumbo, New York 10001, United States',
  phone: '',
  name: '',
  governorate: '',
  block: '',
  building: '',
  floor: '',
  flat: '',
  avenue: '',
  label: 'Home', // Home | Office
};

export const PAYMENT_METHODS = [
  { id: 'knet', name: 'KNET', icon: 'card' },
  { id: 'card', name: 'Credit Card', icon: 'card' },
];

/** Banner / Special offer rasmi (keng format) */
export const BANNER_SPECIAL_IMAGE = 'https://picsum.photos/seed/offer/800/400';
