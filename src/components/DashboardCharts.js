import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Box, Paper, Typography, Grid } from '@mui/material';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ActivityChart = ({ data, title }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Requests Created',
        data: data.requests,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.4
      },
      {
        label: 'Helped Others',
        data: data.helped,
        borderColor: 'rgb(153, 102, 255)',
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: title
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return <Line data={chartData} options={options} />;
};

const ImpactBreakdown = ({ data }) => {
  const chartData = {
    labels: ['Requests Created', 'Requests Completed', 'Helped Others'],
    datasets: [
      {
        data: [
          data.totalRequests,
          data.completedRequests,
          data.helpedOthers
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)'
        ]
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right'
      },
      title: {
        display: true,
        text: 'Community Impact Breakdown'
      }
    }
  };

  return <Doughnut data={chartData} options={options} />;
};

const CategoryBreakdown = ({ categories }) => {
  const chartData = {
    labels: Object.keys(categories),
    datasets: [
      {
        label: 'Requests by Category',
        data: Object.values(categories),
        backgroundColor: 'rgba(53, 162, 235, 0.5)'
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Requests by Category'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return <Bar data={chartData} options={options} />;
};

const DashboardCharts = ({ activityData, impactData, categoryData }) => {
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Activity Analytics
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <ActivityChart
              data={activityData}
              title="Monthly Activity Overview"
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <ImpactBreakdown data={impactData} />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <CategoryBreakdown categories={categoryData} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardCharts;