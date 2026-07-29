import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ParkingLot from '../ParkingLot';
import { splitEntries } from '../../utils/splitParkingLotEntries';

const defaultProps = {
  tasks: [],
  onUpdate: vi.fn(),
  onDelete: vi.fn(),
  onExecute: vi.fn(async () => true),
  onUndo: vi.fn(async () => true),
  canUndo: false,
  onSelect: vi.fn(),
  selectedTaskId: null,
};

describe('ParkingLot', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('restores an autosaved free-writing draft', () => {
    localStorage.setItem('bloomspace.parkingLotDraft', 'Call the dentist');
    render(<ParkingLot {...defaultProps} />);

    expect(screen.getByRole('textbox', { name: 'Parking Lot notes' })).toHaveValue('Call the dentist');
  });

  it('autosaves text as the user types', () => {
    render(<ParkingLot {...defaultProps} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Parking Lot notes' }), {
      target: { value: 'Messy thought' },
    });

    expect(localStorage.getItem('bloomspace.parkingLotDraft')).toBe('Messy thought');
  });

  it('executes each non-empty line and clears the draft after success', async () => {
    const onExecute = vi.fn(async () => true);
    render(<ParkingLot {...defaultProps} onExecute={onExecute} />);
    const textbox = screen.getByRole('textbox', { name: 'Parking Lot notes' });

    fireEvent.change(textbox, { target: { value: '- Call dentist\n\n* finish report by Friday' } });
    fireEvent.click(screen.getByRole('button', { name: 'Turn into tasks' }));

    await waitFor(() => expect(onExecute).toHaveBeenCalledWith([
      'Call dentist',
      'finish report by Friday',
    ]));
    expect(textbox).toHaveValue('');
  });

  it('restores the previous draft after undo succeeds', async () => {
    const { rerender } = render(<ParkingLot {...defaultProps} />);
    const textbox = screen.getByRole('textbox', { name: 'Parking Lot notes' });
    fireEvent.change(textbox, { target: { value: 'Renew insurance' } });
    fireEvent.click(screen.getByRole('button', { name: 'Turn into tasks' }));
    await waitFor(() => expect(textbox).toHaveValue(''));

    rerender(<ParkingLot {...defaultProps} canUndo />);
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));

    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Parking Lot notes' })).toHaveValue('Renew insurance'));
  });
});

describe('splitEntries', () => {
  it('accepts bullets, numbered lines, and plain text', () => {
    expect(splitEntries('1. First thing\n• Second thing\nplain thought')).toEqual([
      'First thing',
      'Second thing',
      'plain thought',
    ]);
  });
});
