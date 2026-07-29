import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ParkingLot from '../ParkingLot';
import { editorTextFromElement, sanitizeEditorHtml, splitEntries } from '../../utils/splitParkingLotEntries';

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

    expect(screen.getByRole('textbox', { name: 'Parking Lot notes' })).toHaveTextContent('Call the dentist');
  });

  it('autosaves text as the user types', () => {
    render(<ParkingLot {...defaultProps} />);
    const editor = screen.getByRole('textbox', { name: 'Parking Lot notes' });
    editor.innerHTML = 'Messy thought';
    fireEvent.input(editor);

    expect(localStorage.getItem('bloomspace.parkingLotDraft')).toBe('Messy thought');
  });

  it('executes each non-empty line and clears the draft after success', async () => {
    const onExecute = vi.fn(async () => true);
    render(<ParkingLot {...defaultProps} onExecute={onExecute} />);
    const textbox = screen.getByRole('textbox', { name: 'Parking Lot notes' });

    textbox.innerHTML = '<div>- Call dentist</div><div>* finish report by Friday</div>';
    fireEvent.input(textbox);
    fireEvent.click(screen.getByRole('button', { name: 'Turn into tasks' }));

    await waitFor(() => expect(onExecute).toHaveBeenCalledWith([
      'Call dentist',
      'finish report by Friday',
    ]));
    expect(textbox).toHaveTextContent('');
  });

  it('restores the previous draft after undo succeeds', async () => {
    const { rerender } = render(<ParkingLot {...defaultProps} />);
    const textbox = screen.getByRole('textbox', { name: 'Parking Lot notes' });
    textbox.innerHTML = 'Renew insurance';
    fireEvent.input(textbox);
    fireEvent.click(screen.getByRole('button', { name: 'Turn into tasks' }));
    await waitFor(() => expect(textbox).toHaveTextContent(''));

    rerender(<ParkingLot {...defaultProps} canUndo />);
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));

    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Parking Lot notes' })).toHaveTextContent('Renew insurance'));
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

  it('reads separate editor blocks as separate lines', () => {
    const editor = document.createElement('div');
    editor.innerHTML = '<div>Call dentist</div><div>Finish report</div>';

    expect(editorTextFromElement(editor)).toBe('Call dentist\nFinish report');
  });

  it('removes unsafe markup and attributes from saved notes', () => {
    expect(sanitizeEditorHtml('<b onclick="bad()">Safe</b><script>bad()</script>')).toBe('<b>Safe</b>bad()');
  });
});
