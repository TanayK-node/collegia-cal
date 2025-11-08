// src/lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { cn } from './utils';

// 'describe' groups related tests into a "test suite"
describe('cn utility function', () => {

  // 'it' or 'test' defines an individual test case
  it('should merge basic string arguments', () => {
    // This follows the "input and expected output" model [cite: 26]
    const input = cn('text-red-500', 'font-bold');
    const expected = 'text-red-500 font-bold';
    expect(input).toBe(expected);
  });

  it('should handle conditional objects', () => {
    const input = cn('base-class', {
      'is-active': true,
      'is-hidden': false,
    });
    const expected = 'base-class is-active';
    expect(input).toBe(expected);
  });

  it('should handle mixed string, object, and null/undefined values', () => {
    const input = cn(
      'p-4',
      false && 'p-2',
      null,
      undefined,
      { 'm-2': true },
      'font-sans'
    );
    const expected = 'p-4 m-2 font-sans';
    expect(input).toBe(expected);
  });

  it('should correctly merge conflicting tailwind classes', () => {
    // This is the specific job of `tailwind-merge`
    const input = cn('p-4', 'p-2', 'pt-8');
    const expected = 'p-2 pt-8'; // p-2 overrides p-4, pt-8 overrides p-2's padding-top
    expect(input).toBe(expected);
  });
});