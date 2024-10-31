import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // Import SweetAlert2
import EditBook from "./EditBook"; // Import EditBook component
import "./BookList.css";
import { FaBookOpen,FaClipboard,FaAward } from 'react-icons/fa';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,

} from '@mui/material';

const BookList = ({ onBookUpdated }) => {
  const [books, setBooks] = useState([]);
  const [editingBook, setEditingBook] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

  const fetchBooks = async () => {
    // Show loading alert
    Swal.fire({
      title: 'Loading...',
      text: 'Fetching books, please wait.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  
    try {
      const response = await axios.get("https://backend-j2o4.onrender.com/api/books");
      setBooks(response.data);
  
      // Close the loading alert on success
      Swal.close();
    } catch (error) {
      console.error("Error fetching books:", error);
  
      // Show error alert
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong while fetching the books!',
      });
    }
  };

  const totalStudents = books.length;
  const verifiedStudents = books.reduce((acc, book) => acc + Number(book.stocks), 0);
  const uniqueAuthors = new Set(books.map((book) => book.author)).size;

  const deleteBook = async (bookId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`https://backend-j2o4.onrender.com/api/books/${bookId}`);
          fetchBooks(); // Refresh the book list
          Swal.fire(
            'Deleted!',
            'Your book has been deleted.',
            'success'
          );
        } catch (error) {
          console.error("Error deleting book:", error);
        }
      }
    });
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleEdit = (book) => {
    setEditingBook(book);
    setShowEditModal(true);
  };

  const StatisticCard = ({ title, value, icon }) => (
    <Grid item xs={12} sm={4}>
      <Card variant="outlined" className="stat-box">
        <CardContent style={{ textAlign: 'center' }}> {/* Center text here */}
          <span className="icon" style={{ display: 'block', marginBottom: '8px' }}>
            {icon}
          </span>
          <Typography variant="h6" style={{ fontWeight: 'bold' }}>{title}</Typography> {/* Optional: Make title bold */}
          <Typography variant="body1" style={{ fontSize: '1.2em' }}>{value}</Typography> {/* Optional: Make value larger */}
        </CardContent>
      </Card>
    </Grid>
  );

  const handleBookUpdated = () => {
    fetchBooks(); // Refresh the book list
  };

  // Filter books based on search query
  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) 
  ||   book.author.toLowerCase().includes(searchQuery.toLowerCase()) 
  ||  book.year.toLowerCase().includes(searchQuery.toLowerCase()) 
  );

  return (
    <div className="book-list-container">
      <h2 className="section-title">Library Book Collection</h2>


      <Grid container spacing={2} justifyContent="center" sx={{ marginBottom: '20px' }}>
          <StatisticCard title="Total Books" value={totalStudents} icon={<FaBookOpen/>} />
          <StatisticCard title="Books (unique)" value={uniqueAuthors} icon={<FaAward />}/>
          <StatisticCard title="Total Copies" value={verifiedStudents} icon={<FaClipboard />}/>
        </Grid>

      {/* Modern Search bar */}
      <div className="book-list-actions">
      <TextField
        label="Search..... "
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{
          width: '100%',
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              border: 'none',
            },
          },
        }}
      />
   
    </div>

      <table className="book-list-table">
        <thead>
          <tr>
            <th>Cover</th>
            <th>Title</th>
            <th>Author</th>
            <th>Publication Date</th>
            <th>Available Copies</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredBooks.length > 0 ?(
          filteredBooks.map((book) => (
            <tr key={book.book_id}>
              <td>
                <img src={book.url} alt={book.title} className="book-cover" />
              </td>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{new Date(book.year).toLocaleDateString()}</td>
              <td>{book.stocks}</td>
              <td>
                <button onClick={() => handleEdit(book)} className="edit-button">
                  Edit
                </button>
                <button onClick={() => deleteBook(book.book_id)} className="delete-button">
                  Delete
                </button>
              </td>
            </tr>
          )) ): (
            <td  colSpan={6} align="center" >{
    
              'No books found'
       
            }</td>
            
      
          )}
        </tbody>
      </table>

      {/* Edit modal */}
      {showEditModal && (
        <EditBook
          book={editingBook}
          onClose={() => setShowEditModal(false)}
          onBookUpdated={handleBookUpdated}
        />
      )}
    </div>
  );
};

export default BookList;
