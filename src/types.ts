export type Category = 'Hotel' | 'Shop/Food' | 'Entertainment';

export type TabName = 'explore' | 'mapview' | 'journey' | 'share';

export type ToastTone = 'success' | 'info' | 'danger' | 'neutral';

export type Stop = {
  id: string;
  day: number;
  time: string;
  name: string;
  category: Category;
  rating: number;
  cost: number;
  x: number;
  y: number;
  review: string;
  author: string;
};

export type Trip = {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  authorHandle: string;
  avatar: string;
  cover: string;
  days: number;
  totalBudget: number;
  remixes: number;
  rating: number;
  tag: string;
  cityLabel: string;
  stops: Stop[];
};

export type JourneyItem = {
  id: string;
  day: number;
  time: string;
  name: string;
  category: Category;
  cost: number;
  sourceAuthor: string;
  sourceTrip: string;
};

export type ReminderIcon =
  | 'shield-check'
  | 'train'
  | 'download-cloud'
  | 'wifi'
  | 'check-square';

export type Reminder = {
  id: string;
  title: string;
  subtitle: string;
  estCost: number;
  checked: boolean;
  icon: ReminderIcon;
  badge: string;
};

export type ToastMessage = {
  id: number;
  title: string;
  subtitle: string;
  tone: ToastTone;
};

export type PinCoords = {
  x: number;
  y: number;
};

export type AppState = {
  activeTab: TabName;
  selectedTripId: string;
  selectedCategoryFilter: string;
  selectedMapPinId: string | null;
  journeyActiveDay: number;
  targetBudget: number;
  newPinCoords: PinCoords;
  newReviewRating: number;
  newReviewCategory: Category;
  trips: Trip[];
  myJourney: JourneyItem[];
  smartReminders: Reminder[];
  lastToast: ToastMessage | null;
  toastSeq: number;
};

export const CATEGORY_FILTERS = [
  'All',
  'Culture & Food',
  'Coastal Luxury',
  'Urban & Nightlife',
] as const;

export type CategoryFilter = (typeof CATEGORY_FILTERS)[number];

export const JOURNEY_DAYS = [1, 2, 3] as const;

export const BUDGET_TARGET_MIN = 600;
export const BUDGET_TARGET_MAX = 4000;
export const BUDGET_TARGET_STEP = 50;

export const PIN_X_MIN = 12;
export const PIN_X_MAX = 88;
export const PIN_Y_MIN = 22;
export const PIN_Y_MAX = 88;

export const CUSTOM_PLACES = [
  {
    name: 'Blue Bottle Coffee Kiyosumi',
    category: 'Shop/Food' as const,
    cost: 12,
    time: '10:30 AM',
  },
  {
    name: 'Shibuya Sky Sunset Deck',
    category: 'Entertainment' as const,
    cost: 20,
    time: '05:15 PM',
  },
  {
    name: 'Hoshinoya Boutique Ryokan',
    category: 'Hotel' as const,
    cost: 410,
    time: '03:00 PM',
  },
] as const;

export const SPOT_CATEGORIES = [
  { id: 'Hotel' as const, label: 'Hotel / Stay', icon: 'bed-double' as const },
  { id: 'Shop/Food' as const, label: 'Shop / Dining', icon: 'utensils' as const },
  { id: 'Entertainment' as const, label: 'Activity / Fun', icon: 'ticket' as const },
];
