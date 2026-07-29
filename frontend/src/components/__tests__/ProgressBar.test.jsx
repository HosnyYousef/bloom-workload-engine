import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ProgressBar from '../ProgressBar';

describe('ProgressBar', () => {
  it('shows a determinate percentage and accessible value', () => {
    render(<ProgressBar label="Loading example tasks" progress={65} />);

    expect(screen.getByText('65%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Loading example tasks' })).toHaveAttribute('aria-valuenow', '65');
  });

  it('clamps progress to 100 percent', () => {
    render(<ProgressBar progress={140} />);

    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });
});
