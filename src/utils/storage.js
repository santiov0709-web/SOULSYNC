export const saveState = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Local storage error:", e);
  }
};

export const loadState = (key, defaultValue) => {
  try {
    const value = localStorage.getItem(key);
    if (value) {
      return JSON.parse(value);
    }
  } catch (e) {
    console.error("Local storage error:", e);
  }
  return defaultValue;
};
