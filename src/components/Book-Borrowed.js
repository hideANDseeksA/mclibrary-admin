import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, Typography, IconButton
} from '@mui/material';
import { Check, Close } from '@mui/icons-material';
import StatsDisplay from './StatsDisplay';
import Swal from 'sweetalert2';
import notificationSound from '../sounds/notification.wav';

const BookActivityTable = () => {
  const [bookActivities, setBookActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredActivities, setFilteredActivities] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/bookactivities_borrowed');
        const data = await response.json();
        console.log(data);
        setBookActivities(data);
        setFilteredActivities(data);
      } catch (error) {
        console.error('Error fetching book activity data:', error);
      }
    };

    fetchData();

    const intervalId = setInterval(() => {
      fetchData();
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const filtered = bookActivities.filter((activity) =>
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.action_date.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredActivities(filtered);
  }, [searchTerm, bookActivities]);

  const approvedRequest = bookActivities ? bookActivities.filter(activity => activity.status === 'Approved').length : 0;
  const totalRequest = bookActivities ? bookActivities.length : 0;
  const pendingRequests = bookActivities ? bookActivities.filter(activity => activity.status === 'Pending').length : 0;


  useEffect(() => {
    const notificationAudio = new Audio(notificationSound);

    if (pendingRequests > 0) {
      Swal.fire({
        title: 'New request!',
        text: 'Admin users have new request.',
        icon: 'info',
        confirmButtonText: 'OK'
      });
      notificationAudio.play().catch((error) => {
        console.error('Error playing sound:', error);
      });
    } else {
      notificationAudio.pause();
      notificationAudio.currentTime = 0;
    }

    return () => {
      notificationAudio.pause();
      notificationAudio.currentTime = 0;
    };
  }, [pendingRequests]);

  const handleAction = async (activityId, actionType) => {
    const activity = bookActivities.find(activity => activity.activity_id === activityId);

    if (activity.status === 'Approved') {
      Swal.fire({
        title: 'Already Approved',
        text: 'This request has already been approved.',
        icon: 'info',
        confirmButtonText: 'OK'
      });
      return;
    }else if (activity.status === 'Overdue') {
      Swal.fire({
        title: 'Book is Overdue',
        icon: 'info',
        confirmButtonText: 'OK'
      });
      return;
    }

    const actionMessage = actionType === 'Approved' ? 'approve' : 'decline';

    const result = await Swal.fire({
      title: `Are you sure you want to ${actionMessage} this request?`,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      icon: 'warning',
    });

    if (result.isConfirmed) {
      let bookState = null;
      if (actionType === 'Approved' && activity.action_type === 'Borrowed') {
        const { value: selectedState } = await Swal.fire({
          title: 'Select the book state',
          input: 'select',
          inputOptions: {
            Good: 'Good',
            'Damaged (Pages)': 'Damaged (Pages)',
            'Damaged (Cover)': 'Damaged (Cover)',
            'Damaged (Missing Page)': 'Damaged (Missing Page)'
          },
          inputPlaceholder: 'Select book state',
          showCancelButton: true,
          inputValidator: (value) => {
            if (!value) {
              return 'You need to select the book state!';
            }
          }
        });
        if (!selectedState) return; // Exit if the user cancels
        bookState = selectedState;
      }

      // Show the processing modal
      Swal.fire({
        title: 'Processing...',
        text: 'Please wait while we process your request.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const response = await fetch(`http://localhost:3000/api/bookactivity/${activityId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action_type: actionType, book_state: bookState, user_email: activity.user_email }),
        });

        if (!response.ok) {
          throw new Error('Failed to update activity');
        }

        if (actionType === 'Declined') {
          const deleteResponse = await fetch(`http://localhost:3000/api/bookactivities/${activityId}`, {
            method: 'DELETE',
          });

          if (!deleteResponse.ok) {
            throw new Error('Failed to delete activity');
          }

          const updatedActivities = bookActivities.filter(activity => activity.activity_id !== activityId);
          setBookActivities(updatedActivities);
          setFilteredActivities(updatedActivities);
        }

        if (actionType === 'Approved') {
          if (activity.action_type === 'Borrowed' || activity.action_type === 'Reserve') {
            const stockResponse = await fetch(`http://localhost:3000/api/books_decreased/${activity.book_id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
            });

            if (!stockResponse.ok) {
              throw new Error('Failed to decrease book stock');
            }
          }
        }

        // Fetch updated data immediately
        const updatedResponse = await fetch('http://localhost:3000/api/bookactivities_borrowed');
        const updatedData = await updatedResponse.json();
        setBookActivities(updatedData);
        setFilteredActivities(updatedData);

        // Close the processing modal before showing success
        Swal.close();

        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: `The request has been ${actionMessage}d.`,
          timer: 2000,
          showConfirmButton: false
        });

      } catch (error) {
        console.error('Error updating or deleting activity:', error);
        // Close the processing modal before showing error
        Swal.close();
        Swal.fire('Error!', 'Failed to update or delete the activity. Please try again.', 'error');
      }
    }
  };



  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Book Activity(Issued)
      </Typography>

      <StatsDisplay
        totalRequest={totalRequest}
        approved={approvedRequest}
        pendingRequests={pendingRequests}
      />

      <TextField
        label="Search......"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{
          width: '100%',
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              border: 'none',
            },
          },
        }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ width: '10%', textAlign: 'center' }}><strong>Book Title</strong></TableCell>
              <TableCell style={{ width: '10%', textAlign: 'center' }}><strong>Stocks</strong></TableCell>
              <TableCell style={{ width: '10%', textAlign: 'center' }}><strong>User</strong></TableCell>
              <TableCell style={{ width: '25%', textAlign: 'center' }}><strong>Activity</strong></TableCell>
              <TableCell style={{ width: '20%', textAlign: 'center' }}><strong>Date</strong></TableCell>
              <TableCell style={{ width: '15%', textAlign: 'center' }}><strong>Fine</strong></TableCell>
              <TableCell style={{ width: '15%', textAlign: 'center' }}><strong>Condition</strong></TableCell>
              <TableCell style={{ width: '5%', textAlign: 'center' }}><strong>Status</strong></TableCell>
              <TableCell style={{ width: '5%', textAlign: 'center' }}><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity) => (
                <TableRow key={activity.activity_id} hover>
                  <TableCell style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activity.title}</TableCell>
                  <TableCell style={{ textAlign: 'center' }}>{activity.stocks !== undefined ? activity.stocks : 'N/A'}</TableCell> {/* Check for undefined */}
                  <TableCell style={{ maxWidth: '170px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activity.user_email}</TableCell>
                  <TableCell style={{ textAlign: 'center' }}>{activity.action_type}</TableCell>
                  <TableCell style={{ textAlign: 'center' }}>{new Date(activity.action_date).toLocaleString()}</TableCell>
                  <TableCell style={{ textAlign: 'center' }}>{activity.fine}</TableCell>
                  <TableCell style={{ textAlign: 'center' }}>{activity.book_state || 'N/A'}</TableCell>
                  <TableCell style={{ textAlign: 'center' }}>{activity.status}</TableCell>
                  <TableCell style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none' }}>
                    <IconButton
                      color="success"
                      onClick={() => handleAction(activity.activity_id, 'Approved')}
                      style={{ marginRight: '10px' }}
                    >
                      <Check />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleAction(activity.activity_id, 'Declined')}
                    >
                      <Close />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>

        </Table>
      </TableContainer>
    </div>
  );
};

export default BookActivityTable;
