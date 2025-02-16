export const STORAGE_KEY = "autoFormFillerSlots";

export function loadSlots() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveSlots(slots) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
}
