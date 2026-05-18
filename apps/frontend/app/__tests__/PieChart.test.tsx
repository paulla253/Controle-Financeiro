import { render, screen } from '@testing-library/react';

jest.mock('react-chartjs-2', () => ({
  Doughnut: ({ data }: { data: { labels: string[] } }) => (
    <div data-testid="doughnut-chart">{data.labels.join(', ')}</div>
  ),
}));

jest.mock('../lib/chartjs-setup', () => {});

import { PieChart } from '../components/PieChart';
import type { CategorySummary } from '../lib/queries/useSummaries';

const mockData: CategorySummary[] = [
  { category: 'Alimentação', total: 400, percentage: 80 },
  { category: 'Transporte', total: 100, percentage: 20 },
];

describe('PieChart', () => {
  it('renders the chart and legend when data is provided', () => {
    render(<PieChart data={mockData} />);

    expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
    expect(screen.getByText('Alimentação')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('Transporte')).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
  });

  it('shows fallback message when data is empty', () => {
    render(<PieChart data={[]} />);

    expect(
      screen.getByText('Não possui dados para ser mostrado'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('doughnut-chart')).not.toBeInTheDocument();
  });
});
