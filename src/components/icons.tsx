import {
  BedDouble,
  CheckSquare,
  CloudDownload,
  ShieldCheck,
  Ticket,
  TrainFront,
  Utensils,
  Wifi,
  type LucideIcon,
} from 'lucide-react-native';

import type { ReminderIcon } from '../types';

export const categoryIcons = {
  'bed-double': BedDouble,
  utensils: Utensils,
  ticket: Ticket,
} as const;

export const reminderIcons: Record<ReminderIcon, LucideIcon> = {
  'shield-check': ShieldCheck,
  train: TrainFront,
  'download-cloud': CloudDownload,
  wifi: Wifi,
  'check-square': CheckSquare,
};
