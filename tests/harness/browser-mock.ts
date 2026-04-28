import { vi } from 'vitest';

export const createPageMock = () => ({
  goto: vi.fn().mockResolvedValue(null),
  locator: vi.fn().mockReturnValue({
    first: vi.fn().mockReturnThis(),
    textContent: vi.fn().mockResolvedValue('Mock Content'),
    innerText: vi.fn().mockResolvedValue('Mock Content'),
    count: vi.fn().mockResolvedValue(1),
    nth: vi.fn().mockReturnThis(),
    allTextContents: vi.fn().mockResolvedValue(['Mock Content']),
  }),
  waitForSelector: vi.fn().mockResolvedValue(null),
  click: vi.fn().mockResolvedValue(null),
  fill: vi.fn().mockResolvedValue(null),
  evaluate: vi.fn().mockResolvedValue({}),
  close: vi.fn().mockResolvedValue(null),
});

export const createContextMock = () => {
  const pageMock = createPageMock();
  return {
    newPage: vi.fn().mockResolvedValue(pageMock),
    close: vi.fn().mockResolvedValue(null),
    pages: vi.fn().mockReturnValue([pageMock]),
  };
};

export const createBrowserMock = () => {
  const contextMock = createContextMock();
  return {
    contexts: vi.fn().mockReturnValue([contextMock]),
    close: vi.fn().mockResolvedValue(null),
    newContext: vi.fn().mockResolvedValue(contextMock),
  };
};
