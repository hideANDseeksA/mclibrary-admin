import React, { useState } from 'react';
import Swal from 'sweetalert2';
import {
  Box,
  CssBaseline,
  Toolbar,
  AppBar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Collapse, // Import Collapse
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import StackedLineChartIcon from '@mui/icons-material/StackedLineChart';
import DevicesIcon from '@mui/icons-material/Devices';
import DvrIcon from '@mui/icons-material/Dvr';
import BookIcon from '@mui/icons-material/Book';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import FolderIcon from '@mui/icons-material/Folder';
import CopyIcon from '@mui/icons-material/FileCopy';
import QRCODE from '@mui/icons-material/QrCode';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import BarChartIcon from '@mui/icons-material/BarChart';
import LogoutIcon from '@mui/icons-material/Logout';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AddToQueueIcon from '@mui/icons-material/AddToQueue';
import ExpandLess from '@mui/icons-material/ExpandLess'; // Import ExpandLess
import ExpandMore from '@mui/icons-material/ExpandMore'; // Import ExpandMore
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

// Import your components
import Home from './Book-Activity';
import Students from './Student';
import BookList from './BookList';
import AddBooks from './AddBooks';
import QRCodeGenerator from './QRCodeGenerator';
import BookHistory from './Book-History';
import AddDigital from './AddDigital'
import DigitalList from './DigitalList';
import ResearchList from './ResearchList';
import AddReseach from './AddResearch';
import StatsDisplay from './Statistics';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import FolderCopyIcon from '@mui/icons-material/FolderCopy';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import ReturnBook from './Book-Returned';
import BorrowedBook from './Book-Borrowed';
import ResearchGraph from './ResearchGraph';
import BooksReadOverMonth from './Books-Read_monthly';
import BooksReadOverYear from './Books-Read-Yearly';
const drawerWidth = 250;

const MainDashboard = () => {
  const [open, setOpen] = useState(false);
  const [booksOpen, setBooksOpen] = useState(false);
  const [digitalOpen, setDigitalOpen] = useState(false);
  const [researchOpen, setResearchOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleBooksClick = () => {
    setBooksOpen(!booksOpen);
  };
  const handleReportsClick = () => {
    setReportOpen(!reportOpen);
  };
  const handleDigitalClick = () => {
    setDigitalOpen(!digitalOpen);
  };

  const handleResearchClick = () => {
    setResearchOpen(!researchOpen);
  };

  const handleSignOut = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to sign out?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, sign me out!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        signOut(auth)
          .then(() => {
            Swal.fire('Signed out!', 'You have been signed out successfully.', 'success');
          })
          .catch((error) => {
            Swal.fire('Error!', `Error signing out: ${error.message}`, 'error');
          });
      }
    });
  };

  return (
    <Router>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />

        {/* AppBar */}
        <AppBar
          position="fixed"
          sx={{
            width: open ? `calc(100% - ${drawerWidth}px)` : '100%',
            marginLeft: open ? `${drawerWidth}px` : 0, // Adjust margin based on drawer state
            transition: (theme) =>
              theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleDrawer}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap>
              MC Salik-Sik Library System
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Drawer */}
        <Drawer
          variant="persistent"
          open={open}
          sx={{
            width: 0,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          <Toolbar /> {/* Optional: To align with AppBar */}
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <List sx={{ flexGrow: 1, padding: 0 }}>
              <ListItem button component={Link} to="/" onClick={toggleDrawer}>
                <ListItemIcon><HomeIcon /></ListItemIcon>
                <ListItemText primary="Home" />
              </ListItem>
              <ListItem button component={Link} to="/students" onClick={toggleDrawer}>
                <ListItemIcon><SchoolIcon /></ListItemIcon>
                <ListItemText primary="Students" />
              </ListItem>

              {/* Books Menu Item with Submenu */}
              <ListItem button onClick={handleBooksClick}>
                <ListItemIcon><BookIcon /></ListItemIcon>
                <ListItemText primary="Books" />
                {booksOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={booksOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <ListItem
                    button
                    component={Link}
                    to="/books/list"
                    onClick={toggleDrawer}
                    sx={{ pl: 4 }}
                  >
                    <ListItemIcon><CollectionsBookmarkIcon /></ListItemIcon>
                    <ListItemText primary="Book List" />
                  </ListItem>
                  <ListItem
                    button
                    component={Link}
                    to="/books/add"
                    onClick={toggleDrawer}
                    sx={{ pl: 4 }}
                  >
                    <ListItemIcon><CopyIcon /></ListItemIcon>
                    <ListItemText primary="Add Books" />
                  </ListItem>
                  <ListItem
                    button
                    component={Link}
                    to="/books/returned"
                    onClick={toggleDrawer}
                    sx={{ pl: 4 }}
                  >
                    <ListItemIcon><AssignmentReturnIcon /></ListItemIcon>
                    <ListItemText primary="Returned Books" />
                  </ListItem>
                  <ListItem
                    button
                    component={Link}
                    to="/books/borrowed"
                    onClick={toggleDrawer}
                    sx={{ pl: 4 }}
                  >
                    <ListItemIcon><AssignmentReturnIcon /></ListItemIcon>
                    <ListItemText primary="Borrowed Books" />
                  </ListItem>
                </List>
              </Collapse>



              <ListItem button onClick={handleDigitalClick}>
                <ListItemIcon><DevicesIcon /></ListItemIcon>
                <ListItemText primary="Digital Copies" />
                {digitalOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={digitalOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <ListItem
                    button
                    component={Link}
                    to="/digital copies/list"
                    onClick={toggleDrawer}
                    sx={{ pl: 4 }}
                  >
                    <ListItemIcon><DvrIcon /></ListItemIcon>
                    <ListItemText primary="Digital Book List" />
                  </ListItem>
                  <ListItem
                    button
                    component={Link}
                    to="/digital copies/add"
                    onClick={toggleDrawer}
                    sx={{ pl: 4 }}
                  >
                    <ListItemIcon><AddToQueueIcon /></ListItemIcon>
                    <ListItemText primary="Add Digital Books" />
                  </ListItem>
                </List>
              </Collapse>


              <ListItem button onClick={handleResearchClick}>
                <ListItemIcon><FolderIcon /></ListItemIcon>
                <ListItemText primary="Research Repository" />
                {researchOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={researchOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <ListItem
                    button
                    component={Link}
                    to="/research repository/list"
                    onClick={toggleDrawer}
                    sx={{ pl: 4 }}>
                    <ListItemIcon><FolderCopyIcon /></ListItemIcon>
                    <ListItemText primary="Research List" />
                  </ListItem>
                  <ListItem
                    button
                    component={Link}
                    to="/research repository/add"
                    onClick={toggleDrawer}
                    sx={{ pl: 4 }}>
                    <ListItemIcon><CreateNewFolderIcon /></ListItemIcon>
                    <ListItemText primary="Add Research" />
                  </ListItem>
                  <ListItem
                    button
                    component={Link}
                    to="/research repository/statistics"
                    onClick={toggleDrawer}
                    sx={{ pl: 4 }}>
                    <ListItemIcon><StackedLineChartIcon /></ListItemIcon>
                    <ListItemText primary="Research Statistics" />
                  </ListItem>
                </List>
              </Collapse>

              <ListItem button component={Link} to="/digital-copies" onClick={toggleDrawer}>
                <ListItemIcon><QRCODE /></ListItemIcon>
                <ListItemText primary="QR Generator" />
              </ListItem>

              {/* Reports */}
              <ListItem button onClick={handleReportsClick}>
                <ListItemIcon><BarChartIcon /></ListItemIcon>
                <ListItemText primary="Reports" />
                {reportOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={reportOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <ListItem
                    button
                    component={Link}
                    to="/Reports/monthly"
                    onClick={toggleDrawer}
                    sx={{ pl: 4 }}>
                    <ListItemIcon><ShowChartIcon /></ListItemIcon>
                    <ListItemText primary="Monthly Reports" />
                  </ListItem>
                  <ListItem
                    button
                    component={Link}
                    to="/Reports/yearly"
                    onClick={toggleDrawer}
                    sx={{ pl: 4 }}>
                    <ListItemIcon><StackedLineChartIcon /></ListItemIcon>
                    <ListItemText primary="Yearly Reports" />
                  </ListItem>
                  <ListItem
                    button
                    component={Link}
                    to="/Reports/logs"
                    onClick={toggleDrawer}
                    sx={{ pl: 4 }}>
                    <ListItemIcon><ManageHistoryIcon /></ListItemIcon>
                    <ListItemText primary="Books Logs" />
                  </ListItem>
                </List>
              </Collapse>
            </List>

            {/* Sign Out Button at the bottom */}
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<LogoutIcon />}
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </Box>
          </Box>
        </Drawer>

        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 0,
            transition: (theme) =>
              theme.transitions.create('margin', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            marginLeft: open ? `${drawerWidth}px` : 0,
            width: '100%',
            height: '100vh',
            boxSizing: 'border-box',
          }}
        >
          <Toolbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/students" element={<Students />} />
            {/* Nested Routes for Books */}
            <Route path="/books">
              <Route path="list" element={<BookList />} />
              <Route path="add" element={<AddBooks />} />
              <Route path="returned" element={<ReturnBook />} />
              <Route path="borrowed" element={<BorrowedBook />} />
            </Route>

            <Route path="/digital copies">
              <Route path="list" element={<DigitalList />} />
              <Route path="add" element={<AddDigital />} />
            </Route>

            <Route path="/research repository">
              <Route path="list" element={<ResearchList />} />
              <Route path="add" element={<AddReseach />} />
              <Route path="statistics" element={<ResearchGraph />} />
            </Route>


            <Route path="/reports">
              <Route path="monthly" element={<BooksReadOverMonth />} />
              <Route path="yearly" element={<BooksReadOverYear />} />
              <Route path="logs" element={<BookHistory />} />
            </Route>

            <Route path="/digital-copies" element={<QRCodeGenerator />} />
            {/* Optionally, add a fallback route */}
            <Route path="*" element={<Typography variant="h4">Page Not Found</Typography>} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
};

export default MainDashboard;
