import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ParkingLot from '../ParkingLot';
import { editorTextFromElement, sanitizeEditorHtml, splitEntries, structuredEntriesFromElement } from '../../utils/splitParkingLotEntries';

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
    document.execCommand = vi.fn();
  });

  it('restores an autosaved free-writing draft', () => {
    localStorage.setItem('bloomspace.parkingLotDraft', 'Call the dentist');
    render(<ParkingLot {...defaultProps} />);

    expect(screen.getByRole('textbox', { name: 'Parking Lot notes' })).toHaveTextContent('Call the dentist');
  });

  it('keeps long notes inside a scrolling editor', () => {
    render(<ParkingLot {...defaultProps} />);

    expect(screen.getByRole('textbox', { name: 'Parking Lot notes' }))
      .toHaveClass('h-80', 'overflow-y-auto');
  });

  it('autosaves text as the user types', () => {
    render(<ParkingLot {...defaultProps} />);
    const editor = screen.getByRole('textbox', { name: 'Parking Lot notes' });
    editor.innerHTML = 'Messy thought';
    fireEvent.input(editor);

    expect(localStorage.getItem('bloomspace.parkingLotDraft')).toBe('Messy thought');
  });

  it('does not replace the editor HTML after autosaving and rerendering', () => {
    const { rerender } = render(<ParkingLot {...defaultProps} />);
    const editor = screen.getByRole('textbox', { name: 'Parking Lot notes' });
    editor.innerHTML = 'Typed in order';
    fireEvent.input(editor);

    rerender(<ParkingLot {...defaultProps} tasks={[{ _id: '1', text: 'Another task', sorted: true }]} />);

    expect(editor.innerHTML).toBe('Typed in order');
  });

  it('allows a restored draft to be deleted', () => {
    localStorage.setItem('bloomspace.parkingLotDraft', 'Old saved text');
    render(<ParkingLot {...defaultProps} />);
    const editor = screen.getByRole('textbox', { name: 'Parking Lot notes' });

    editor.innerHTML = '';
    fireEvent.input(editor);

    expect(editor.innerHTML).toBe('');
    expect(localStorage.getItem('bloomspace.parkingLotDraft')).toBe('');
    expect(screen.getByRole('button', { name: 'Turn into tasks' })).toBeDisabled();
  });

  it('supports Ctrl/Cmd formatting shortcuts without blocking native editing shortcuts', () => {
    render(<ParkingLot {...defaultProps} />);
    const editor = screen.getByRole('textbox', { name: 'Parking Lot notes' });

    fireEvent.keyDown(editor, { key: 'b', ctrlKey: true });
    fireEvent.keyDown(editor, { key: 'i', metaKey: true });
    fireEvent.keyDown(editor, { key: 'z', metaKey: true });

    expect(document.execCommand).toHaveBeenCalledWith('bold', false);
    expect(document.execCommand).toHaveBeenCalledWith('italic', false);
    expect(document.execCommand).not.toHaveBeenCalledWith('undo', false);
  });

  it('supports numbered-list and bulleted-list keyboard shortcuts', () => {
    render(<ParkingLot {...defaultProps} />);
    const editor = screen.getByRole('textbox', { name: 'Parking Lot notes' });

    fireEvent.keyDown(editor, { key: '7', metaKey: true, shiftKey: true });
    fireEvent.keyDown(editor, { key: '8', ctrlKey: true, shiftKey: true });

    expect(document.execCommand).toHaveBeenCalledWith('insertOrderedList', false);
    expect(document.execCommand).toHaveBeenCalledWith('insertUnorderedList', false);
  });

  it('turns dash followed by space into a bulleted list', () => {
    render(<ParkingLot {...defaultProps} />);
    const editor = screen.getByRole('textbox', { name: 'Parking Lot notes' });
    editor.textContent = '-';
    const textNode = editor.firstChild;
    const selectionSpy = vi.spyOn(window, 'getSelection').mockReturnValue({
      anchorNode: textNode,
      isCollapsed: true,
    });

    fireEvent.keyDown(editor, { key: ' ' });

    expect(document.execCommand).toHaveBeenCalledWith('delete', false);
    expect(document.execCommand).toHaveBeenCalledWith('insertUnorderedList', false);
    selectionSpy.mockRestore();
  });

  it('turns 1. followed by space into a numbered list', () => {
    render(<ParkingLot {...defaultProps} />);
    const editor = screen.getByRole('textbox', { name: 'Parking Lot notes' });
    editor.textContent = '1.';
    const selectionSpy = vi.spyOn(window, 'getSelection').mockReturnValue({
      anchorNode: editor.firstChild,
      isCollapsed: true,
    });

    fireEvent.keyDown(editor, { key: ' ' });

    expect(document.execCommand).toHaveBeenCalledWith('insertOrderedList', false);
    selectionSpy.mockRestore();
  });

  it('keeps Tab inside the editor as an indent', () => {
    render(<ParkingLot {...defaultProps} />);
    const editor = screen.getByRole('textbox', { name: 'Parking Lot notes' });

    fireEvent.keyDown(editor, { key: 'Tab' });

    expect(document.execCommand).toHaveBeenCalledWith('insertText', false, '    ');
  });

  it('supports bracket shortcuts for indent and outdent', () => {
    render(<ParkingLot {...defaultProps} />);
    const editor = screen.getByRole('textbox', { name: 'Parking Lot notes' });

    fireEvent.keyDown(editor, { key: ']', metaKey: true });
    fireEvent.keyDown(editor, { key: '[', ctrlKey: true });

    expect(document.execCommand).toHaveBeenCalledWith('indent', false);
    expect(document.execCommand).toHaveBeenCalledWith('outdent', false);
  });

  it('turns notes into tasks with Ctrl/Cmd+Enter while the editor is focused', async () => {
    const onExecute = vi.fn(async () => true);
    render(<ParkingLot {...defaultProps} onExecute={onExecute} />);
    const editor = screen.getByRole('textbox', { name: 'Parking Lot notes' });
    editor.textContent = 'Keyboard task';
    fireEvent.input(editor);

    fireEvent.keyDown(editor, { key: 'Enter', metaKey: true });

    await waitFor(() => expect(onExecute).toHaveBeenCalledWith([
      { text: 'Keyboard task', steps: [] },
    ]));
  });

  it('executes each non-empty line and clears the draft after success', async () => {
    const onExecute = vi.fn(async () => true);
    render(<ParkingLot {...defaultProps} onExecute={onExecute} />);
    const textbox = screen.getByRole('textbox', { name: 'Parking Lot notes' });

    textbox.innerHTML = '<div>- Call dentist</div><div>* finish report by Friday</div>';
    fireEvent.input(textbox);
    fireEvent.click(screen.getByRole('button', { name: 'Turn into tasks' }));

    await waitFor(() => expect(onExecute).toHaveBeenCalledWith([
      { text: 'Call dentist', steps: [] },
      { text: 'finish report by Friday', steps: [] },
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

  it('turns nested list items into small steps under their parent task', () => {
    const editor = document.createElement('div');
    editor.innerHTML = '<ul><li>Plan trip<ul><li>Book hotel</li><li>Pack bags</li></ul></li><li>Call Mom</li></ul>';

    expect(structuredEntriesFromElement(editor)).toEqual([
      { text: 'Plan trip', steps: ['Book hotel', 'Pack bags'] },
      { text: 'Call Mom', steps: [] },
    ]);
  });

  it('handles browser-generated sibling nested lists as parent steps', () => {
    const editor = document.createElement('div');
    editor.innerHTML = '<ol><li>Test</li><ol><li>One</li><li>Two</li></ol></ol>';

    expect(structuredEntriesFromElement(editor)).toEqual([
      { text: 'Test', steps: ['One', 'Two'] },
    ]);
  });

  it('removes unsafe markup and attributes from saved notes', () => {
    expect(sanitizeEditorHtml('<b onclick="bad()">Safe</b><script>bad()</script>')).toBe('<b>Safe</b>bad()');
  });
});
