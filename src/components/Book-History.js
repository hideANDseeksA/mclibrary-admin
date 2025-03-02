import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Toolbar,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import Swal from 'sweetalert2'; // Import SweetAlert2



const BookLogs = () => {
  const [bookLogs, setBookLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading] = useState(false);
  const [error] = useState(null);


  useEffect(() => {
    const fetchBookLogs = async () => {
      // Show loading alert
      Swal.fire({
        title: 'Loading...',
        text: 'Fetching book logs, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        const response = await axios.get('https://backend-j2o4.onrender.com/api/books_history'); // Replace with your API endpoint
        setBookLogs(response.data);

        // Close the loading alert on success
        Swal.close();
      } catch (err) {
        console.error('Error fetching book logs:', err);

        // Show error alert if request fails
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch book logs. Please try again later.',
        });
      }
    };

    fetchBookLogs();
  }, []);

  // Handle Delete All
  const deleteAllBookActivities = async () => {
    try {
      const response = await fetch('https://backend-j2o4.onrender.com/api/books_history', {
        method: 'DELETE',
      });

      const message = await response.text();
      if (response.ok) {
        Swal.fire('Deleted!', message, 'success');
        setBookLogs([]); // Clear logs after deletion
      } else {
        console.error('Error:', message);
      }
    } catch (error) {
      console.error('Error deleting book activities:', error);
    }
  };

  // Confirm Delete with SweetAlert
  const confirmDelete = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this data!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        deleteAllBookActivities(); // If confirmed, delete all book activities
      }
    });
  };

  // Handle Snackbar Close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Filtered Data based on Search Query
  const filteredBookLogs = useMemo(() => {
    return bookLogs.filter((log) => {
      const query = searchQuery.toLowerCase();
      return (
        log.title.toLowerCase().includes(query) ||
        log.user_email.toLowerCase().includes(query) ||
        log.action_type.toLowerCase().includes(query) ||
        log.status.toLowerCase().includes(query)
      );
    });
  }, [bookLogs, searchQuery]);

  // Statistics
  const totalActions =  bookLogs.filter((log) => log.action_type === 'Reserve' && log.status === 'Approved').length;
  const approvedCount = bookLogs.filter((log) => log.action_type === 'Read' && log.status === 'Completed').length;
  const pendingCount = bookLogs.filter((log) => log.action_type === 'Borrowed' && log.status === 'Approved').length;
  const declinedCount = bookLogs.filter((log) => log.action_type === 'Returned' && log.status === 'Completed').length;

  return (
    <Box sx={{ padding: 3 }}>
      {/* Statistics Section */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="h5" gutterBottom>
          Book Logs Statistics
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Paper sx={{ padding: 2, flex: '1 1 200px', textAlign: 'center' }}>
            <Typography variant="subtitle1">Total Reserve Books</Typography>
            <Typography variant="h6">{totalActions}</Typography>
          </Paper>
          <Paper sx={{ padding: 2, flex: '1 1 200px', textAlign: 'center' }}>
            <Typography variant="subtitle1">Total Read Books</Typography>
            <Typography variant="h6">{approvedCount}</Typography>
          </Paper>
          <Paper sx={{ padding: 2, flex: '1 1 200px', textAlign: 'center' }}>
            <Typography variant="subtitle1">Total Borrowed Books</Typography>
            <Typography variant="h6">{pendingCount}</Typography>
          </Paper>
          <Paper sx={{ padding: 2, flex: '1 1 200px', textAlign: 'center' }}>
            <Typography variant="subtitle1">Total Returned Books</Typography>
            <Typography variant="h6">{declinedCount}</Typography>
          </Paper>
        </Box>
      </Box>
 

      {/* Search and Delete Actions */}
      <Toolbar sx={{ justifyContent: 'space-between', paddingLeft: 0, paddingRight: 0 }}>
      <TextField
  label="Search"
  variant="outlined"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  sx={{ 
    width: '100%',
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        border: 'none', 
      },
      '&:hover fieldset': {
        border: 'none',
      },
      '&.Mui-focused fieldset': {
        border: 'none',
      },
    },
  }}
/>

        <Tooltip title="Delete All">
          <span>
            <IconButton
              color="error"
              onClick={confirmDelete} // Trigger confirmation dialog
              disabled={bookLogs.length === 0 || loading}
            >
              <DeleteIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Toolbar>

      {/* Loading Indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error Message */}
      {error && (
        <Box sx={{ marginTop: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {/* Table Section */}
      {!loading && !error && (
        <TableContainer component={Paper} sx={{ marginTop: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
              <TableCell style={{ width: '25%' }}><strong>Book Title</strong></TableCell>
              <TableCell style={{ width: '20%' }}><strong>User</strong></TableCell>
              <TableCell style={{ width: '15%' }}><strong>Book Status</strong></TableCell>
              <TableCell style={{ width: '10%' }}><strong>Date</strong></TableCell>
              <TableCell style={{ width: '10%' }}><strong>Fine</strong></TableCell>
              <TableCell style={{ width: '15%' }}><strong>Book State</strong></TableCell>
              <TableCell style={{ width: '5%' }}><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBookLogs.length > 0 ? (
                filteredBookLogs.map((log) => (
                  <TableRow key={log.activity_id} hover>
                    <TableCell>{log.title}</TableCell>
                    <TableCell>{log.user_email}</TableCell>
                    <TableCell>{log.action_type}</TableCell>
                    <TableCell>
                      {new Date(log.action_date).toLocaleString()}
                    </TableCell>
                    <TableCell>{log.fine}</TableCell>
                    <TableCell>{log.book_state || 'N/A'}</TableCell>
                    <TableCell>{log.status}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    {bookLogs.length === 0
                      ? 'No book logs available.'
                      : 'No matching records found.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Snackbar for Deletion Confirmation */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: '100%' }}
        >
          All book logs have been deleted successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BookLogs;
