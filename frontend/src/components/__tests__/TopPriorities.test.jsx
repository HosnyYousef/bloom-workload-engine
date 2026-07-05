import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TopPriorities from '../TopPriorities';

const TASKS = [
  { _id: 'abc1', text: 'Write unit tests', completed: false },
  { _id: 'abc2', text: 'Review teammate PR', completed: true },
];

describe('TopPriorities', () => {
  let onToggle, onDelete, onAdd;

  beforeEach(() => {
    onToggle = vi.fn();
    onDelete = vi.fn();
    onAdd    = vi.fn();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────
  it('renders the panel header', () => {
    render(<TopPriorities tasks={[]} onToggle={onToggle} onDelete={onDelete} onAdd={onAdd} />);
    expect(screen.getByText('Top Priorities')).toBeInTheDocument();
  });

  it('renders every task passed as a prop', () => {
    render(<TopPriorities tasks={TASKS} onToggle={onToggle} onDelete={onDelete} onAdd={onAdd} />);
    expect(screen.getByText('Write unit tests')).toBeInTheDocument();
    expect(screen.getByText('Review teammate PR')).toBeInTheDocument();
  });

  it('applies line-through class to a completed task', () => {
    render(<TopPriorities tasks={TASKS} onToggle={onToggle} onDelete={onDelete} onAdd={onAdd} />);
    expect(screen.getByText('Review teammate PR')).toHaveClass('line-through');
  });

  it('does not apply line-through to an incomplete task', () => {
    render(<TopPriorities tasks={TASKS} onToggle={onToggle} onDelete={onDelete} onAdd={onAdd} />);
    expect(screen.getByText('Write unit tests')).not.toHaveClass('line-through');
  });

  it('renders the add-task input', () => {
    render(<TopPriorities tasks={[]} onToggle={onToggle} onDelete={onDelete} onAdd={onAdd} />);
    expect(screen.getByPlaceholderText('Add priority task...')).toBeInTheDocument();
  });

  // ── Checkbox interaction ───────────────────────────────────────────────────
  it('calls onToggle with the correct task id when a checkbox is clicked', async () => {
    const user = userEvent.setup();
    render(<TopPriorities tasks={TASKS} onToggle={onToggle} onDelete={onDelete} onAdd={onAdd} />);
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);
    expect(onToggle).toHaveBeenCalledOnce();
    expect(onToggle).toHaveBeenCalledWith('abc1');
  });

  it('marks the completed task checkbox as checked', () => {
    render(<TopPriorities tasks={TASKS} onToggle={onToggle} onDelete={onDelete} onAdd={onAdd} />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[1]).toBeChecked();
  });

  it('marks the incomplete task checkbox as unchecked', () => {
    render(<TopPriorities tasks={TASKS} onToggle={onToggle} onDelete={onDelete} onAdd={onAdd} />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).not.toBeChecked();
  });

  // ── Add task via Enter key ─────────────────────────────────────────────────
  it('calls onAdd with the correct shape when Enter is pressed', async () => {
    const user = userEvent.setup();
    render(<TopPriorities tasks={[]} onToggle={onToggle} onDelete={onDelete} onAdd={onAdd} />);
    const input = screen.getByPlaceholderText('Add priority task...');
    await user.type(input, 'Fix login bug{Enter}');
    expect(onAdd).toHaveBeenCalledOnce();
    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({
      text: 'Fix login bug',
      importance: 'high',
    }));
  });

  // ── Add task via + button ─────────────────────────────────────────────────
  it('calls onAdd when the + button is clicked after typing', async () => {
    const user = userEvent.setup();
    render(<TopPriorities tasks={[]} onToggle={onToggle} onDelete={onDelete} onAdd={onAdd} />);
    const input = screen.getByPlaceholderText('Add priority task...');
    await user.type(input, 'Deploy hotfix');
    await user.click(screen.getByText('+'));
    expect(onAdd).toHaveBeenCalledOnce();
    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({ text: 'Deploy hotfix' }));
  });

  // ── Guard: empty input ─────────────────────────────────────────────────────
  it('does not call onAdd when the input is blank', async () => {
    const user = userEvent.setup();
    render(<TopPriorities tasks={[]} onToggle={onToggle} onDelete={onDelete} onAdd={onAdd} />);
    await user.click(screen.getByText('+'));
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('does not call onAdd when only whitespace is entered', async () => {
    const user = userEvent.setup();
    render(<TopPriorities tasks={[]} onToggle={onToggle} onDelete={onDelete} onAdd={onAdd} />);
    const input = screen.getByPlaceholderText('Add priority task...');
    await user.type(input, '   {Enter}');
    expect(onAdd).not.toHaveBeenCalled();
  });

  // ── Input clears after add ─────────────────────────────────────────────────
  it('clears the input field after a successful add', async () => {
    const user = userEvent.setup();
    render(<TopPriorities tasks={[]} onToggle={onToggle} onDelete={onDelete} onAdd={onAdd} />);
    const input = screen.getByPlaceholderText('Add priority task...');
    await user.type(input, 'New task{Enter}');
    expect(input).toHaveValue('');
  });
});
