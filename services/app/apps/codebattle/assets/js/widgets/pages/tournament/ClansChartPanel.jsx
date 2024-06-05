import React, { memo, useState, useEffect } from 'react';

import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bubble } from 'react-chartjs-2';
import { useDispatch } from 'react-redux';

import { getResults } from '../../middlewares/TournamentAdmin';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

function ClansChartPanel({ type, state }) {
  const dispatch = useDispatch();

  const [items, setItems] = useState([]);

  useEffect(() => {
    if (state === 'active') {
      dispatch(getResults(type, undefined, setItems));

      const interval = setInterval(() => {
        dispatch(getResults(type, undefined, setItems));
      }, 1000 * 30);

      return () => {
        clearInterval(interval);
      };
    }

    if (state === 'finished') {
      dispatch(getResults(type, undefined, setItems));
    }

    return () => {};
  }, [setItems, dispatch, type, state]);

  const colors = [
    '#FF621E',
    '#2AE881',
    '#FFE500',
    '#B6A4FF',
    '#73CCFE',
    '#FF9C41',
  ];

  const getBackgroundColor = id => {
    const index = id % colors.length;
    return colors[index];
  };

  const config = {
    data: {
      datasets: items.map(item => ({
        label: `${item.clanName} [${item.playerCount}]`,
        data: [
          {
            x: item.totalScore,
            y: item.performance,
            z: item.radius,
          },
        ],
        backgroundColor: getBackgroundColor(item.clanId),
      })),
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
      },
    },
  };

  return (
    <div className="my-2 px-1 mt-lg-0 sticky-top rounded-lg position-relative cb-overflow-x-auto cb-overflow-y-auto">
      <Bubble data={config.data} options={config.options} />
    </div>
  );
}

export default memo(ClansChartPanel);