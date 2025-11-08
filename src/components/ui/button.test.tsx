// src/components/ui/button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button'; // Adjust path if needed

describe('Button component', () => {

  it('renders children correctly', () => {
    render(<Button>Click Me</Button>);
    
    // 'screen.getByText' finds an element by its text content
    // 'expect(...).toBeInTheDocument' is a matcher from @testing-library/jest-dom
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('applies default variant classes', () => {
    render(<Button>Default</Button>);
    const button = screen.getByText('Default');
    
    // Check that the default classes are applied
    expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  it('applies destructive variant classes', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByText('Delete');
    
    // Check that the correct variant class is applied
    expect(button).toHaveClass('bg-destructive', 'text-destructive-foreground');
    expect(button).not.toHaveClass('bg-primary');
  });
  
  it('applies outline variant classes', () => {
    render(<Button variant="outline">Cancel</Button>);
    const button = screen.getByText('Cancel');
    expect(button).toHaveClass('border-input', 'bg-background');
  });

  it('handles click events', () => {
    // 'vi.fn()' creates a mock function (a "spy")
    const handleClick = vi.fn();
    
    render(<Button onClick={handleClick}>Submit</Button>);
    const button = screen.getByText('Submit');
    
    // 'fireEvent.click' simulates a user clicking the button
    fireEvent.click(button);
    
    // We "assert" that our mock function was called [cite: 28]
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders as a child component with asChild prop', () => {
    // This tests the "Slot" functionality
    render(
      <Button asChild>
        <a href="/">Link</a>
      </Button>
    );
    
    // It should render an 'a' tag, not a 'button'
    const link = screen.getByRole('link', { name: /Link/i });
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe('A');
    
    // It should still have the button styles
    expect(link).toHaveClass('bg-primary');
  });
});