import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TopPriorities from '../TopPriorities';

const TASKS = [
  { _id: 'abc1', text: 'Write unit tests', completed: false },
  { _id: 'abc2', text: 'Review teammate PR', completed: true },
];

describe('TopPriorities', () => {
  let onToggle, onDelete, onAdd, onUpdate;

  beforeEach(() => {
    localStorage.clear();
    onToggle = vi.fn();
    onDelete = vi.fn();
    onAdd    = vi.fn();
    onUpdate = vi.fn();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────
  it('renders the panel header', () => {
    render(<TopPriorities tasks={[]} onToggle={onToggle} onDelete={onDelete} onAdd={onAdd} />);
    expect(screen.getByText('Top Priorities')).toBeInTheDocument();
    expect(screen.getByText('Your focus for today')).toBeInTheDocument();
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
      sorted: true,
      sortedCategory: 'priorities',
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

  it('edits a task and reorders its small steps in a focused editor', async () => {
    const user = userEvent.setup();
    const tasks = [{
      _id: 'abc3',
      text: 'Plan launch',
      completed: false,
      steps: [
        { text: 'Write announcement', done: false },
        { text: 'Notify testers', done: false },
      ],
    }];
    render(<TopPriorities tasks={tasks} onToggle={onToggle} onDelete={onDelete} onAdd={onAdd} onUpdate={onUpdate} />);

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    const taskName = screen.getByRole('textbox', { name: 'Task name' });
    await user.clear(taskName);
    await user.type(taskName, 'Prepare launch');
    await user.click(screen.getByRole('button', { name: 'Move step 2 up' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onUpdate).toHaveBeenCalledWith('abc3', {
      text: 'Prepare launch',
      steps: [
        { text: 'Notify testers', done: false },
        { text: 'Write announcement', done: false },
      ],
    });
  });

  it('saves edits with Ctrl/Cmd+Enter from within the editor', async () => {
    const user = userEvent.setup();
    const tasks = [{ _id: 'abc4', text: 'Old name', completed: false, steps: [] }];
    render(<TopPriorities tasks={tasks} onToggle={onToggle} onDelete={onDelete} onAdd={onAdd} onUpdate={onUpdate} />);
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    const taskName = screen.getByRole('textbox', { name: 'Task name' });
    await user.clear(taskName);
    await user.type(taskName, 'New name');

    await user.keyboard('{Meta>}{Enter}{/Meta}');

    expect(onUpdate).toHaveBeenCalledWith('abc4', { text: 'New name', steps: [] });
  });

  it('moves a task between sections and back to the Parking Lot with visible controls', async () => {
    const user = userEvent.setup();
    const onMoveSection = vi.fn();
    const onMoveToParking = vi.fn();
    const tasks = [{ _id: 'abc6', text: 'Move me', completed: false, steps: [] }];
    render(<TopPriorities
      tasks={tasks}
      onToggle={onToggle}
      onDelete={onDelete}
      onAdd={onAdd}
      onUpdate={onUpdate}
      onMoveSection={onMoveSection}
      onMoveToParking={onMoveToParking}
    />);

    await user.click(screen.getByRole('button', { name: 'Move Move me down a section' }));
    await user.click(screen.getByRole('button', { name: 'Move Move me to Parking Lot' }));

    expect(onMoveSection).toHaveBeenCalledWith('abc6', 1);
    expect(onMoveToParking).toHaveBeenCalledWith('abc6');
  });

  it('starts the same native drag from the task title or grip', () => {
    const task = { _id: 'abc-drag', text: 'Drag me', completed: false, steps: [] };
    render(<TopPriorities tasks={[task]} onToggle={onToggle} onDelete={onDelete} onAdd={onAdd} />);
    const title = screen.getByText('Drag me');
    const grip = screen.getByLabelText('Drag Drag me');
    const row = title.parentElement.parentElement;
    const dataTransfer = {
      effectAllowed: '',
      setData: vi.fn(),
      setDragImage: vi.fn(),
    };

    expect(row).toHaveAttribute('draggable', 'true');
    fireEvent.dragStart(title, { dataTransfer });
    fireEvent.dragStart(grip, { dataTransfer });

    expect(dataTransfer.setData).toHaveBeenNthCalledWith(1, 'application/x-bloomspace-task', 'abc-drag');
    expect(dataTransfer.setData).toHaveBeenNthCalledWith(2, 'application/x-bloomspace-task', 'abc-drag');
  });

  it('checks one small step without completing the main task', async () => {
    const user = userEvent.setup();
    const tasks = [{
      _id: 'abc7',
      text: 'Prepare workshop',
      completed: false,
      steps: [
        { text: 'Print worksheets', done: false },
        { text: 'Test projector', done: true },
      ],
    }];
    render(<TopPriorities tasks={tasks} onToggle={onToggle} onDelete={onDelete} onAdd={onAdd} onUpdate={onUpdate} />);

    expect(screen.getByText('1 of 2 small steps complete')).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: 'Complete step: Print worksheets' }));

    expect(onUpdate).toHaveBeenCalledWith('abc7', {
      steps: [
        { text: 'Print worksheets', done: true },
        { text: 'Test projector', done: true },
      ],
    });
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('shows completed step history when the main task is completed', () => {
    const tasks = [{
      _id: 'abc8',
      text: 'Completed task',
      completed: true,
      steps: [{ text: 'Finished step', done: true }],
    }];
    render(<TopPriorities tasks={tasks} onToggle={onToggle} onDelete={onDelete} onAdd={onAdd} onUpdate={onUpdate} />);

    expect(screen.getByText('1 of 1 small steps complete')).toBeInTheDocument();
  });

  it('shows only three secondary tasks until See all is selected', async () => {
    const user = userEvent.setup();
    const tasks = Array.from({ length: 5 }, (_, index) => ({
      _id: `secondary-${index}`,
      text: `Secondary task ${index + 1}`,
      completed: false,
      steps: [],
    }));
    render(<TopPriorities tasks={tasks} category='tomorrow' onToggle={onToggle} onDelete={onDelete} onAdd={onAdd} onUpdate={onUpdate} />);

    expect(screen.getByText('Secondary task 3')).toBeInTheDocument();
    expect(screen.queryByText('Secondary task 4')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'See all (5)' }));
    expect(screen.getByText('Secondary task 4')).toBeInTheDocument();
  });

  it('remembers when a secondary section is collapsed', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<TopPriorities tasks={TASKS} category='tomorrow' onToggle={onToggle} onDelete={onDelete} onAdd={onAdd} onUpdate={onUpdate} />);
    await user.click(screen.getByRole('button', { name: 'Collapse For Tomorrow' }));
    expect(screen.queryByText('Write unit tests')).not.toBeInTheDocument();
    expect(localStorage.getItem('bloomspace.sectionCollapsed.tomorrow')).toBe('true');

    unmount();
    render(<TopPriorities tasks={TASKS} category='tomorrow' onToggle={onToggle} onDelete={onDelete} onAdd={onAdd} onUpdate={onUpdate} />);
    expect(screen.getByRole('button', { name: 'Expand For Tomorrow' })).toBeInTheDocument();
  });

  it('lets Typical Day users choose a different priority', async () => {
    const user = userEvent.setup();
    const onChoosePriority = vi.fn();
    const candidates = [{ _id: 'candidate-1', text: 'Alternative task' }];
    render(<TopPriorities
      tasks={TASKS}
      energyLevel='typical'
      candidateTasks={candidates}
      onChoosePriority={onChoosePriority}
      onToggle={onToggle}
      onDelete={onDelete}
      onAdd={onAdd}
      onUpdate={onUpdate}
    />);

    await user.click(screen.getByRole('button', { name: 'Choose a different task' }));
    await user.click(screen.getByRole('button', { name: 'Choose' }));
    expect(onChoosePriority).toHaveBeenCalledWith('candidate-1');
  });
});
