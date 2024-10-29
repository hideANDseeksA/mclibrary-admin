import React, { useEffect, useState } from 'react';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PeopleIcon from '@mui/icons-material/People';
import GppBadIcon from '@mui/icons-material/GppBad';
import * as XLSX from "xlsx";
import axios from 'axios';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  createTheme,
  ThemeProvider,
  useMediaQuery,
} from '@mui/material';
import Swal from 'sweetalert2';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderRadius: '4px',
          textTransform: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #e0e0e0',
        },
      },
    },
  },
});

const StudentDashboard = () => {
  const [students, setStudents] = useState([]);
  const [newStudents, setNewStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('https://backend-j2o4.onrender.com/api/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (email, action, value) => {
    const actionMessage = value ? action : `un${action}`;
    const result = await Swal.fire({
      title: `Are you sure you want to ${actionMessage} ${email}?`,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      icon: 'warning',
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: `Processing...`,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      try {
        await axios.put(`https://backend-j2o4.onrender.com/api/students/${email}/${action}`, { [action]: value });
        fetchStudents();
        Swal.fire('Success!', `Successfully ${actionMessage}d ${email}.`, 'success');
      } catch (error) {
        console.error(`Error updating ${action}:`, error);
        Swal.fire('Error!', `Failed to update ${action}. Please try again.`, 'error');
      }
    }
  };
  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (!file) {
      Swal.fire({
        icon: "error",
        title: "No file selected",
        text: "Please select a valid Excel file.",
      });
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        Swal.fire({
          icon: "error",
          title: "Empty File",
          text: "The file is empty or contains no valid data.",
        });
        return;
      }

      // Ensure email validation for your domain
      const filteredNewStudents = jsonData.filter(
        (student) =>
          student.email &&
          student.email.endsWith("@mabinicolleges.edu.ph")
      );

      if (filteredNewStudents.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "No Valid New Students",
          text: "No new students with valid email addresses were found.",
        });
      } else {
        setNewStudents(filteredNewStudents);
        Swal.fire({
          icon: "success",
          title: "File Loaded",
          text: `${filteredNewStudents.length} valid new students found.`,
        });
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleInsertNewStudents = async () => {
   
    const confirmed = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to insert new students into the database.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, insert them!",
      cancelButtonText: "No, cancel!",
    });
  
    if (confirmed.isConfirmed) {
      setLoading(true);
      Swal.fire({
        title: "Inserting new students...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
  
      try {
        const response = await axios.post("https://backend-j2o4.onrender.com/api/insert_students", {
          students: newStudents,
        });
  
        Swal.fire({
          icon: "success",
          title: "New Students Inserted",
          text: response.data.message || "New students were successfully inserted.",
        });
  
        // Refresh the student list
        fetchStudents();
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "There was an error inserting the new students.",
        });
      } finally {
        setLoading(false);
      }
    }
  };
  



  const handleVerifyAll = async (enrolled) => {
    const actionMessage = enrolled ? 'enroll all' : 'unenroll all';
    const result = await Swal.fire({
      title: `Are you sure you want to ${actionMessage}?`,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      icon: 'warning',
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: `Processing...`,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      try {
        await axios.put(`https://backend-j2o4.onrender.com/api/students/verifyAll`, { enrolled });
        fetchStudents();
        Swal.fire('Success!', `Successfully ${actionMessage}.`, 'success');
      } catch (error) {
        console.error('Error verifying all students:', error);
        Swal.fire('Error!', 'Failed to verify all students. Please try again.', 'error');
      }
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredStudents = students.filter((student) =>
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStudents = students.length;
  const verifiedStudents = students.filter(student => student.enrolled).length;
  const notVerifiedStudents = totalStudents - verifiedStudents;

  if (loading) {
    return (
      <Container style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Typography variant="h4" align="center" gutterBottom>
          Student Dashboard
        </Typography>

        {/* Statistics Section */}
        <Grid container spacing={2} justifyContent="center" sx={{ marginBottom: '20px' }}>
          <StatisticCard title="Total Users" value={totalStudents} icon={<PeopleIcon />} />
          <StatisticCard title="Not Verified Users" value={notVerifiedStudents} icon={<GppBadIcon />} />
          <StatisticCard title="Verified Users" value={verifiedStudents} icon={<VerifiedUserIcon />} />
        </Grid>
        
        {/* Main Table */}
        <Grid container spacing={2} justifyContent="center" sx={{ marginBottom: '20px' }}>
          <Grid item xs={12} sm="auto">
            <Button
              variant="contained"
              color="primary"
              fullWidth={isMobile}
              onClick={() => handleVerifyAll(true, true)}
            >
              Enroll All
            </Button>
          </Grid>
          <Grid item xs={12} sm="auto">
            <Button
              variant="contained"
              color="secondary"
              fullWidth={isMobile}
              onClick={() => handleVerifyAll(false, false)}
            >
              Unenroll All
            </Button>
          </Grid>

          <Grid item xs={12} sm="auto">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm="auto">
            <button onClick={handleInsertNewStudents} disabled={newStudents.length === 0 || loading}>
              {loading ? "Inserting..." : "Insert New Students"}
            </button>
          </Grid>
        </Grid>

        {/* Search Bar */}
        <TextField
          label="Search by email, first or last name"
          variant="outlined"
          fullWidth
          style={{ marginBottom: '20px' }}
          value={searchTerm}
          onChange={handleSearchChange}
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
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                {!isMobile && <TableCell>Enrolled</TableCell>}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.map((student) => (
                <StudentRow
                  key={student.email}
                  student={student}
                  isMobile={isMobile}
                  handleAction={handleAction}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </ThemeProvider>
  );
};

const StatisticCard = ({ title, value, icon }) => (
  <Grid item xs={12} sm={4}>
    <Card variant="outlined">
      <CardContent style={{ textAlign: 'center' }}>
        <span style={{ display: 'block', marginBottom: '8px' }}>
          {icon}
        </span>
        <Typography variant="h6" style={{ fontWeight: 'bold' }}>{title}</Typography>
        <Typography variant="body1" style={{ fontSize: '1.2em' }}>{value}</Typography>
      </CardContent>
    </Card>
  </Grid>
);

const StudentRow = ({ student, isMobile, handleAction }) => {
  return (
    <TableRow>
      <TableCell>{student.email}</TableCell>
      <TableCell>{student.first_name}</TableCell>
      <TableCell>{student.last_name}</TableCell>

      {!isMobile && (
        <>
          <TableCell>{student.enrolled ? 'Enrolled' : 'Not Enrolled'}</TableCell>
        </>
      )}

      <TableCell>


        {/* Enrollment Button */}
        <Button
          variant="outlined"
          color={student.enrolled ? 'secondary' : 'primary'}
          onClick={() => handleAction(student.email, 'enrolled', !student.enrolled)}
          fullWidth={isMobile}
          style={{ marginLeft: '8px' }} // Add spacing between buttons
        >
          {student.enrolled ? 'Unenroll' : 'Enroll'}
        </Button>
      </TableCell>
    </TableRow>
  );
};



export default StudentDashboard;
