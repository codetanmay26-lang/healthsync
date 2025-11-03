import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Cleanup after each test
afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});

// Mock environment variables
vi.mock("import.meta", () => ({
  env: {
    VITE_GEMINI_API_KEY: "test-api-key",
  },
}));

// Mock window.alert
global.alert = vi.fn();

// Mock window.confirm
global.confirm = vi.fn(() => true);

// Setup localStorage mock with actual storage
const localStorageData = {};
const localStorageMock = {
  getItem: (key) => localStorageData[key] || null,
  setItem: (key, value) => {
    localStorageData[key] = value;
  },
  removeItem: (key) => {
    delete localStorageData[key];
  },
  clear: () => {
    Object.keys(localStorageData).forEach(
      (key) => delete localStorageData[key]
    );
  },
};
global.localStorage = localStorageMock;
