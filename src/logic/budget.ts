import type { AppState, JourneyItem, Reminder } from '../types';

export type BudgetBreakdown = {
  hotelCost: number;
  foodShopCost: number;
  activityCost: number;
  addonsCost: number;
  totalSpent: number;
  targetBudget: number;
  remaining: number;
  overBy: number;
  pct: number;
  isOverBudget: boolean;
};

export function sumByCategory(items: JourneyItem[], category: JourneyItem['category']): number {
  return items.filter((item) => item.category === category).reduce((acc, item) => acc + item.cost, 0);
}

export function sumCheckedAddons(reminders: Reminder[]): number {
  return reminders.filter((reminder) => reminder.checked).reduce((acc, reminder) => acc + reminder.estCost, 0);
}

export function calculateBudget(
  input: Pick<AppState, 'myJourney' | 'smartReminders' | 'targetBudget'>,
): BudgetBreakdown {
  const hotelCost = sumByCategory(input.myJourney, 'Hotel');
  const foodShopCost = sumByCategory(input.myJourney, 'Shop/Food');
  const activityCost = sumByCategory(input.myJourney, 'Entertainment');
  const addonsCost = sumCheckedAddons(input.smartReminders);
  const totalSpent = hotelCost + foodShopCost + activityCost + addonsCost;
  const targetBudget = input.targetBudget;
  const isOverBudget = totalSpent > targetBudget;
  const pct =
    targetBudget <= 0 ? 100 : Math.min(100, Math.round((totalSpent / targetBudget) * 100));

  return {
    hotelCost,
    foodShopCost,
    activityCost,
    addonsCost,
    totalSpent,
    targetBudget,
    remaining: targetBudget - totalSpent,
    overBy: totalSpent - targetBudget,
    pct,
    isOverBudget,
  };
}
