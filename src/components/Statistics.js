import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';

// Register necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

const BooksReadChart = () => {
  const [booksReadData, setBooksReadData] = useState([]);

  // Fetch books read data from the API
  useEffect(() => {
    const fetchBooksReadData = async () => {
      try {
        const response = await fetch('https://backend-j2o4.onrender.com/api/books-reads');
        const data = await response.json();

        // Aggregate read_count for books with the same title and month
        const aggregatedData = data.reduce((acc, item) => {
          const monthYear = new Date(item.month).toLocaleString('default', { month: 'long', year: 'numeric' });
          const key = `${item.title}-${monthYear}`;
          if (!acc[key]) {
            acc[key] = { ...item, read_count: parseInt(item.read_count, 10) };
          } else {
            acc[key].read_count += parseInt(item.read_count, 10);
          }
          return acc;
        }, {});
        
        setBooksReadData(Object.values(aggregatedData)); // Store the aggregated data
      } catch (error) {
        console.error('Error fetching books read data:', error);
      }
    };

    fetchBooksReadData();
  }, []);

  // Extract unique months and books
  const months = Array.from(new Set(booksReadData.map(item => 
    new Date(item.month).toLocaleString('default', { month: 'long', year: 'numeric' })
  ))).sort((a, b) => new Date(a + ' 1') - new Date(b + ' 1'));  // Correct month sorting

  const books = Array.from(new Set(booksReadData.map(item => item.title)));

  // Dynamically generate a color palette based on the number of books
  const generateColors = (numColors) => {
    const colors = [];
    for (let i = 0; i < numColors; i++) {
      const hue = (i * 360) / numColors; // Distribute colors evenly across the color wheel
      colors.push(`hsl(${hue}, 70%, 60%)`); // Generate HSL color
    }
    return colors;
  };

  const colors = generateColors(books.length); // Generate colors based on the number of books

  // Prepare datasets for each book
  const datasets = books.map((book, index) => {
    return {
      label: book,
      data: months.map(month => {
        const record = booksReadData.find(item => 
          item.title === book && 
          new Date(item.month).toLocaleString('default', { month: 'long', year: 'numeric' }) === month
        );
        return record ? parseInt(record.read_count, 10) : 0; // Default to 0 if no record found
      }),
      backgroundColor: colors[index],
      borderColor: colors[index].replace('0.6', '1'),
      borderWidth: 2,
      fill: false, // Don't fill the area under the line
      tension: 0.4, // Smooth the lines
    };
  });

  const chartData = {
    labels: months, // Months as labels
    datasets, // Book read counts per book
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Books Read per Month (Line Chart)',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw}`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: false,
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default BooksReadChart;
