import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto'; 

const BooksReadOverYear = () => {
  const [chartData, setChartData] = useState({ datasets: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://backend-j2o4.onrender.com/api/books-read-over-yearly');
        const data = await response.json();

        // Prepare the data for the chart
        const labels = data.map(item => item.title);
        const readCounts = data.map(item => item.total_reads);

        // Generate unique colors for each bar
        const uniqueColors = labels.map(() => {
          const r = Math.floor(Math.random() * 255);
          const g = Math.floor(Math.random() * 255);
          const b = Math.floor(Math.random() * 255);
          return `rgba(${r}, ${g}, ${b}, 0.6)`;
        });

        // Set the chart data
        setChartData({
          labels: labels,
          datasets: [
            {
              label: 'Total Reads',
              data: readCounts,
              backgroundColor: uniqueColors,
              borderColor: uniqueColors.map(color => color.replace('0.6', '1')),
              borderWidth: 1,
            },
          ],
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {loading ? (
        <p>Loading chart...</p>
      ) : (
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Top 10 Books Read Over the Year',
                font: {
                  size: 18,
                },
              },
              legend: {
                display: true,
                position: 'top',
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Total Reads',
                },
              },
              x: {
                title: {
                  display: true,
                  text: 'Book Titles',
                },
              },
            },
          }}
        />
      )}
    </div>
  );
};

export default BooksReadOverYear;
