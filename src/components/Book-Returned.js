import React, { useEffect, useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box,
    Paper, TextField, Typography, Button, Dialog, DialogActions,
    DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import Swal from 'sweetalert2';

const BookReturnTable = () => {
    const [bookActivities, setBookActivities] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredActivities, setFilteredActivities] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [bookCondition, setBookCondition] = useState('');
    const [fine, setFine] = useState('');

 

    useEffect(() => {
        const fetchData = async () => {
          try {
            Swal.fire({
              title: 'Loading...',
              text: 'Fetching book activity data.',
              allowOutsideClick: false,
              didOpen: () => {
                Swal.showLoading();
              }
            });
      
            const response = await fetch('https://backend-j2o4.onrender.com/api/booksToreturned');
            const data = await response.json();
            console.log(data);
            
            setBookActivities(data);
            setFilteredActivities(data);
            
            Swal.close();
          } catch (error) {
            Swal.close();
            console.error('Error fetching book activity data:', error);
            
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Could not fetch book activity data. Please try again later.',
            });
          }
        };
      
        fetchData();
      
        const intervalId = setInterval(() => {
          Swal.fire({
            title: 'Loading...',
            text: 'Updating book activity data.',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });
      
          const timeoutId = setTimeout(() => {
            Swal.close();
            clearInterval(intervalId); // stop the interval
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Data fetching took too long. Please check your connection or try again later.',
            });
          }, 120000); // 2 minutes in milliseconds
      
          fetchData().then(() => {
            clearTimeout(timeoutId); // clear timeout if data is fetched successfully
          });
        }, 120000); // set interval to 2 minutes
      
        return () => clearInterval(intervalId);
      }, []);

    useEffect(() => {
        const filtered = bookActivities.filter((activity) =>
            activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            activity.user_email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredActivities(filtered);
    }, [searchTerm, bookActivities]);

    const handleReturnClick = (activity) => {
        setSelectedActivity(activity);
        setBookCondition('');
        setFine('');
        setOpenDialog(true);
    };
    const handleDialogClose = () => {
        setOpenDialog(false);
    };
    const approvedRequest = bookActivities ? bookActivities.filter(activity => activity.status === 'Approved').length : 0;
    const totalRequest = bookActivities ? bookActivities.length : 0;
    const overdueRequests = bookActivities ? bookActivities.filter(activity => activity.status === 'Overdue').length : 0;


    const handleReturnSubmit = async () => {
        // Validate inputs
        if (!bookCondition || fine === '') {
            setOpenDialog(false)
            Swal.fire('Error', 'Please select book condition and fine', 'error');
            return;
        } else {
            setOpenDialog(false);
        }

        // Confirm the return action
        Swal.fire({
            title: 'Are you sure?',
            text: "You are about to mark this book as returned.",
            icon: 'warning',
            showCancelButton: true,
        }).then(async (result) => {
            if (result.isConfirmed) {
                // Show loading dialog while processing
                Swal.fire({
                    title: 'Processing...',
                    text: 'Please wait while we process the return.',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    },
                });

                try {
                    // API call to return the book
                    const response = await fetch(`https://backend-j2o4.onrender.com/api/returned_book/${selectedActivity.activity_id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            fine: fine,
                            book_state: bookCondition,
                            delete_activity: true, // or false based on your logic
                        }),
                    });

                    if (response.ok) {
                        // After successfully returning the book, increase the stock
                        const increaseResponse = await fetch(`https://backend-j2o4.onrender.com/api/books_increase/${selectedActivity.book_id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        });

                        if (increaseResponse.ok) {
                            const increaseData = await increaseResponse.json();
                            Swal.fire('Success', `${increaseData.message}. Book returned successfully!`, 'success');

                            // Update local state to reflect changes and remove the returned activity
                            const updatedActivities = bookActivities.filter(
                                (activity) => activity.activity_id !== selectedActivity.activity_id
                            );
                            setBookActivities(updatedActivities); // Remove the row by updating the state
                        } else {
                            throw new Error('Failed to increase book stock');
                        }
                    } else {
                        throw new Error('Failed to return book');
                    }
                } catch (error) {
                    Swal.fire('Error', error.message, 'error');
                }
            }
        });
    };



    return (
        <div style={{ padding: '20px' }}>
            <Typography variant="h4" gutterBottom>
                Book Activity(Returned)
            </Typography>



            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', marginBottom: 3 }}>
                <Paper sx={{ padding: 2, flex: '1 1 200px', textAlign: 'center' }}>
                    <Typography variant="subtitle1">Total Borrowed</Typography>
                    <Typography variant="h6">{totalRequest}</Typography>
                </Paper>
                <Paper sx={{ padding: 2, flex: '1 1 200px', textAlign: 'center' }}>
                    <Typography variant="subtitle1">Approved</Typography>
                    <Typography variant="h6">{approvedRequest}</Typography>
                </Paper>
                <Paper sx={{ padding: 2, flex: '1 1 200px', textAlign: 'center' }}>
                    <Typography variant="subtitle1">Overdue</Typography>
                    <Typography variant="h6">{overdueRequests}</Typography>
                </Paper>
            </Box>

            <TextField
                label="Search......."
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
                            <TableCell style={{ width: '25%', textAlign: 'center' }}><strong>Date</strong></TableCell>
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
                                    <TableCell style={{ maxWidth: '230px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activity.title}</TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>{activity.stocks}</TableCell>
                                    <TableCell style={{ maxWidth: '170px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activity.user_email}</TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>{activity.action_type}</TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>{new Date(activity.action_date).toLocaleString()}</TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>{activity.fine}</TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>{activity.book_state || 'N/A'}</TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>{activity.status}</TableCell>
                                    <TableCell style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none' }}>
                                        {activity.status !== 'Returned' && (
                                            <Button variant="outlined" color="primary" onClick={() => handleReturnClick(activity)}>
                                                Return
                                            </Button>
                                        )}
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

            <Dialog open={openDialog} onClose={handleDialogClose}>
                <DialogTitle>Return Book</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please select the condition of the book and enter the fine (if any).
                    </DialogContentText>

                    <FormControl fullWidth sx={{ marginTop: 2 }}>
                        <InputLabel id="book-condition-label">Book Condition</InputLabel>
                        <Select
                            labelId="book-condition-label"
                            value={bookCondition}
                            onChange={(e) => setBookCondition(e.target.value)}
                            label="Book Condition"
                        >
                            <MenuItem value="default">Default</MenuItem>
                            <MenuItem value="Good">Good</MenuItem>
                            <MenuItem value="Damaged (Pages)">Damaged (Pages)</MenuItem>
                            <MenuItem value="Damaged (Cover)">Damaged (Cover)</MenuItem>
                            <MenuItem value="Damaged (Missing Page)">Damaged (Missing Page)</MenuItem>
                            <MenuItem value="Lost">Lost</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label="Fine"
                        type="number"
                        inputProps={{
                            step: '0.01', // Allows decimal numbers with two decimal places
                            min: '0' // Ensures no negative values
                        }}
                        fullWidth
                        value={fine}
                        onChange={(e) => {
                            // Ensures that only valid decimal numbers are input
                            const newValue = e.target.value;
                            if (!isNaN(newValue) && newValue >= 0) {
                                setFine(newValue);
                            }
                        }}
                        sx={{ marginTop: 2, border: 'none',   '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              border: 'none',
                            },
                          }, }}
                        
                  
                    />

                </DialogContent>

                <DialogActions>
                    <Button onClick={handleDialogClose} color="secondary">Cancel</Button>
                    <Button onClick={handleReturnSubmit} color="primary">Submit</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default BookReturnTable;
