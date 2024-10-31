import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import './ResearchGraph.css'; 
import Swal from 'sweetalert2';


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ResearchGraph = () => {
  const [data, setData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Number of Research Entries',
        data: [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
      },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      Swal.fire({
        title: 'Loading',
        text: 'Fetching research data...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const response = await fetch('https://backend-j2o4.onrender.com/api/Research-graph');
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const result = await response.json();
        const labels = result.map(item => item.year);
        const counts = result.map(item => item.count);

        setData({
          labels: labels,
          datasets: [
            {
              label: 'Number of Research Entries',
              data: counts,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: true,
            },
          ],
        });

        Swal.close(); // Close loading dialog on success
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch research data.',
        });
      }
    };

    fetchData();
  }, []);

  const options = {
    maintainAspectRatio: false, 
    responsive: true,
    scales: {
      y: {
        ticks: {
          beginAtZero: true,
          precision: 0, 
        },
      },
    },
  };

  return (
    <div className="graph-container">
      <h2>Research Over the Years</h2>
      <div className="chart-wrapper">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default ResearchGraph;
