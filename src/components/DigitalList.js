import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // Import SweetAlert2
import EditBook from "./EditDigital"; // Import EditBook component
import "./BookList.css";

const BookList = ({ onBookUpdated }) => {
  const [books, setBooks] = useState([]);
  const [editingBook, setEditingBook] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

  const fetchBooks = async () => {
    try {
      const response = await axios.get("https://backend-j2o4.onrender.com/api/digital_copies");
      setBooks(response.data);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

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
          await axios.delete(`https://backend-j2o4.onrender.com/api/digital_copies/${bookId}`);
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

  const handleBookUpdated = () => {
    fetchBooks(); // Refresh the book list
  };

  // Filter books based on search query
  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="book-list-container">
      <h2 className="section-title">Digital Book Collection</h2>

      {/* Modern Search bar */}
      <div className="book-list-actions">
      <div className="search-container">
        <i className="fa fa-search search-icon"></i> {/* Font Awesome search icon */}
        <input
          type="text"
          placeholder="Search...."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-bar modern-search-bar" // Add new class for modern style
        />
      </div>
    </div>

      <table className="book-list-table">
        <thead>
          <tr>
            <th>Cover</th>
            <th>Title</th>
            <th>Author</th>
            <th>Publication Date</th>
            <th>PDF</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
        {filteredBooks.length > 0 ? (
          filteredBooks.map((book) => (
            <tr key={book.book_id}>
              <td>
                <img src={book.image_url} alt={book.title} className="book-cover" />
              </td>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{new Date(book.year).toLocaleDateString()}</td>
              <td>
                                    <a href={book.pdf_url} target="_blank" rel="noopener noreferrer">
                                        View PDF
                                    </a>
                                </td>
              <td>
                <button onClick={() => handleEdit(book)} className="edit-button">
                  Edit
                </button>
                <button onClick={() => deleteBook(book.book_id)} className="delete-button">
                  Delete
                </button>
              </td>
            </tr>
          ))):(
        
            <td colSpan={10} align="center">
                No records found.
            </td>
  
          )
          
          
          }
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
