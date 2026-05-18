import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Table, type Column } from '../components/Table';

interface TestItem {
  id: number;
  date: string;
  name: string;
}

const columns: Column<TestItem>[] = [
  { key: 'date', header: 'Data', render: (row) => row.date },
  { key: 'name', header: 'Nome', render: (row) => row.name },
];

describe('Table', () => {
  it('renders column headers and data rows', () => {
    const data: TestItem[] = [
      { id: 1, date: '15/01/2024', name: 'Item A' },
      { id: 2, date: '10/01/2024', name: 'Item B' },
    ];

    render(<Table data={data} columns={columns} />);

    expect(screen.getByText('Data')).toBeInTheDocument();
    expect(screen.getByText('Nome')).toBeInTheDocument();
    expect(screen.getByText('Item A')).toBeInTheDocument();
    expect(screen.getByText('Item B')).toBeInTheDocument();
  });

  it('renders items in provided order (date descending matches API order)', () => {
    const data: TestItem[] = [
      { id: 1, date: '15/01/2024', name: 'Mais recente' },
      { id: 2, date: '10/01/2024', name: 'Mais antigo' },
    ];

    render(<Table data={data} columns={columns} />);

    const rows = screen.getAllByRole('row');
    // rows[0] = thead tr, rows[1] and rows[2] = data rows
    expect(within(rows[1]).getByText('Mais recente')).toBeInTheDocument();
    expect(within(rows[2]).getByText('Mais antigo')).toBeInTheDocument();
  });

  it('renders empty message when data array is empty', () => {
    render(
      <Table
        data={[]}
        columns={columns}
        emptyMessage="Nenhuma despesa encontrada."
      />,
    );

    expect(screen.getByText('Nenhuma despesa encontrada.')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders delete button per row when onDelete is provided', async () => {
    const onDelete = jest.fn();
    const user = userEvent.setup();
    const data: TestItem[] = [
      { id: 1, date: '15/01/2024', name: 'Item A' },
      { id: 2, date: '10/01/2024', name: 'Item B' },
    ];

    render(<Table data={data} columns={columns} onDelete={onDelete} />);

    const deleteButtons = screen.getAllByRole('button');
    expect(deleteButtons).toHaveLength(2);

    await user.click(deleteButtons[0]);
    expect(onDelete).toHaveBeenCalledWith(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete with the correct id for the clicked row', async () => {
    const onDelete = jest.fn();
    const user = userEvent.setup();
    const data: TestItem[] = [
      { id: 10, date: '15/01/2024', name: 'Primeiro' },
      { id: 20, date: '10/01/2024', name: 'Segundo' },
    ];

    render(<Table data={data} columns={columns} onDelete={onDelete} />);

    const rows = screen.getAllByRole('row');
    const secondDeleteBtn = within(rows[2]).getByRole('button');
    await user.click(secondDeleteBtn);

    expect(onDelete).toHaveBeenCalledWith(20);
  });

  it('does not render delete column when onDelete is not provided', () => {
    const data: TestItem[] = [{ id: 1, date: '15/01/2024', name: 'Item A' }];

    render(<Table data={data} columns={columns} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText('Ações')).not.toBeInTheDocument();
  });
});
