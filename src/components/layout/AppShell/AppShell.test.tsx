import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfigProvider } from 'antd';
import { AppShell } from './AppShell';

vi.mock('next/navigation', () => ({
  usePathname: () => '/test',
}));

let matchMediaMock = false;

const setMatchMedia = (isMobile: boolean) => {
  matchMediaMock = isMobile;
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: matchMediaMock,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
};

const renderShell = (props: Partial<React.ComponentProps<typeof AppShell>> = {}) => {
  return render(
    <ConfigProvider>
      <AppShell
        sider={<div data-testid='sider'>SIDER</div>}
        drawer={<div data-testid='drawer-content'>DRAWER</div>}
        headerLeft={<div>LEFT</div>}
        headerRight={<div>RIGHT</div>}
        {...props}
      >
        <div data-testid='content'>CONTENT</div>
      </AppShell>
    </ConfigProvider>
  );
};

describe('AppShell', () => {
  beforeEach(() => {
    setMatchMedia(false);
  });

  it('renders content and header slots on desktop', () => {
    renderShell();
    expect(screen.getByTestId('content')).toHaveTextContent('CONTENT');
    expect(screen.getByText('LEFT')).toBeInTheDocument();
    expect(screen.getByText('RIGHT')).toBeInTheDocument();
  });

  it('renders sider on desktop', () => {
    renderShell();
    expect(screen.getByTestId('sider')).toHaveTextContent('SIDER');
  });

  it('does not render menu button on desktop', () => {
    renderShell();
    expect(screen.queryByLabelText('Open navigation')).not.toBeInTheDocument();
  });

  it('shows menu button on mobile when drawer is provided', () => {
    setMatchMedia(true);
    renderShell();
    expect(screen.getByLabelText('Open navigation')).toBeInTheDocument();
  });

  it('opens drawer on menu button click on mobile', async () => {
    setMatchMedia(true);
    const user = userEvent.setup();
    renderShell();
    await user.click(screen.getByLabelText('Open navigation'));
    expect(screen.getByTestId('drawer-content')).toBeVisible();
  });

  it('hides sider when hideSider is true', () => {
    renderShell({ hideSider: true });
    expect(screen.queryByTestId('sider')).not.toBeInTheDocument();
  });
});
