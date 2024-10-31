import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto'; 
import Swal from 'sweetalert2';


const BooksReadOverMonth = () => {
  const [chartData, setChartData] = useState({ datasets: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Show loading alert
      Swal.fire({
        title: 'Loading...',
        text: 'Fetching data, please wait...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
  
      try {
        const response = await fetch('https://backend-j2o4.onrender.com/api/books-read-over-month');
        const data = await response.json();
  
        const labels = data.map(item => item.title);
        const readCounts = data.map(item => item.total_reads);
  

        const uniqueColors = labels.map(() => {
          const r = Math.floor(Math.random() * 255);
          const g = Math.floor(Math.random() * 255);
          const b = Math.floor(Math.random() * 255);
          return `rgba(${r}, ${g}, ${b}, 0.6)`;
        });
  
  
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
  
        Swal.close(); 
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
  
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong while fetching data!',
        });
  
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
                text: 'Books Read Over the Month',
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

export default BooksReadOverMonth;
