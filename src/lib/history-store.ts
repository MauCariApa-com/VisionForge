export interface HistoryItem {
  id: string;
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  steps: number;
  cfgScale: number;
  seed?: number;
  provider: string;
  model: string;
  imageDataUrl: string;
  createdAt: number;
}

const STORAGE_KEY = "visionforge_history_v1";
const MAX_HISTORY_ITEMS = 50;

export function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistory(items: HistoryItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addHistoryItem(item: HistoryItem): HistoryItem[] {
  const items = [item, ...loadHistory()].slice(0, MAX_HISTORY_ITEMS);
  saveHistory(items);
  return items;
}

export function deleteHistoryItem(id: string): HistoryItem[] {
  const items = loadHistory().filter((item) => item.id !== id);
  saveHistory(items);
  return items;
}

export function clearHistory(): HistoryItem[] {
  localStorage.removeItem(STORAGE_KEY);
  return [];
}
