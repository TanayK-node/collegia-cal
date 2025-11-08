// src/hooks/use-mobile.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from './use-mobile'; // Adjust path if needed

// We need to create a mock for addEventListener *before* we use it.
const addEventListenerMock = vi.fn();
const removeEventListenerMock = vi.fn();

// Mock window.matchMedia
const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
  matches: query.includes('max-width: 767px'), // 768 - 1
  media: query,
  onchange: null,
  addListener: vi.fn(), // deprecated
  removeListener: vi.fn(), // deprecated
  // Pass in our specific mock functions
  addEventListener: addEventListenerMock,
  removeEventListener: removeEventListenerMock,
  dispatchEvent: vi.fn(),
}));

describe('useIsMobile hook', () => {

  beforeEach(() => {
    // Apply the mock before each test
    vi.stubGlobal('matchMedia', matchMediaMock);
  });

  afterEach(() => {
    // Clean up mocks after each test
    vi.unstubAllGlobals();
    matchMediaMock.mockClear();
    addEventListenerMock.mockClear();
    removeEventListenerMock.mockClear();
  });

  it('should return true for mobile width', () => {
    vi.stubGlobal('innerWidth', 500);
    
    // 'renderHook' is used for testing hooks
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(true);
  });

  it('should return false for desktop width', () => {
    vi.stubGlobal('innerWidth', 1024);

    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(false);
  });

  it('should update when window is resized (simulating event listener)', () => {
    vi.stubGlobal('innerWidth', 1024);
    
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false); // Initially desktop

    // **This is the fix:**
    // We find the 'onChange' handler that was passed to 'addEventListener'.
    // It's the second argument (index 1) of the first call.
    const changeListener = addEventListenerMock.mock.calls[0][1];

    // Verify it's a function before calling it
    expect(changeListener).toBeTypeOf('function');

    // Manually trigger the listener logic
    act(() => {
      // Simulate changing to a mobile width
      vi.stubGlobal('innerWidth', 400);
      changeListener();
    });

    // The hook's state should update
    expect(result.current).toBe(true);
  });
});