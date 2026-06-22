import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VersionTag } from './VersionTag';

describe('VersionTag', () => {
  it('renders "dev" when NEXT_PUBLIC_GIT_COMMIT is not set', () => {
    render(<VersionTag />);
    expect(screen.getByText('dev')).toBeInTheDocument();
  });

  it('renders truncated SHA when NEXT_PUBLIC_GIT_COMMIT is set', () => {
    const original = process.env.NEXT_PUBLIC_GIT_COMMIT;
    process.env.NEXT_PUBLIC_GIT_COMMIT = 'abc1234567890';
    render(<VersionTag />);
    expect(screen.getByText('abc1234')).toBeInTheDocument();
    process.env.NEXT_PUBLIC_GIT_COMMIT = original;
  });

  it('renders with dark data-theme attribute', () => {
    const { container } = render(<VersionTag theme='dark' />);
    expect(container.firstChild).toHaveAttribute('data-theme', 'dark');
  });

  it('renders with light data-theme attribute by default', () => {
    const { container } = render(<VersionTag />);
    expect(container.firstChild).toHaveAttribute('data-theme', 'light');
  });
});
