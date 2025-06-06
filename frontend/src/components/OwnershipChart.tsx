import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { OwnershipData } from '../types';
import { formatPercent } from '../utils/helpers';

ChartJS.register(ArcElement, Tooltip, Legend);

interface OwnershipChartProps {
  data: OwnershipData[];
}

const OwnershipChart: React.FC<OwnershipChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        data: data.map(item => item.percentage),
        backgroundColor: data.map(item => item.color),
        borderColor: data.map(item => item.color),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          font: {
            family: 'Inter',
            size: 12,
          },
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return ` ${formatPercent(context.raw)} ownership`;
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-[300px] mx-auto">
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default OwnershipChart;