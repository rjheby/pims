
import { ReactNode } from 'react';

export interface SheetItem {
  id: number;
  [key: string]: any;
}

export interface SheetColumn<T extends SheetItem> {
  field: keyof T;
  header: string;
  width?: string;
  type?: 'text' | 'number' | 'select' | 'custom';
  options?: string[];
  render?: (item: T) => ReactNode;
}

export interface SheetSummary<T extends SheetItem> {
  label: string;
  calculate: (items: T[]) => number | string;
  format?: (value: number | string) => string;
}

export interface SheetProps<T extends SheetItem> {
  items: T[];
  columns: SheetColumn<T>[];
  summaries?: SheetSummary<T>[];
  onAddItem?: () => void;
  onRemoveItem?: (id: number) => void;
  onUpdateItem?: (id: number, field: keyof T, value: any) => void;
  onCopyItem?: (item: T) => void;
  isAdmin?: boolean;
  addItemLabel?: string;
}
