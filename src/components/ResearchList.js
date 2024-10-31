import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // Import SweetAlert2
import EditBook from "./EditResearch"; // Import EditBook component
import "./BookList.css";

const ResearchList = ({ onBookUpdated }) => {
    const [books, setBooks] = useState([]);
    const [editingBook, setEditingBook] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState(""); // State for search query

    const fetchBooks = async () => {
        try {
            // Show loading alert
            Swal.fire({
                title: 'Loading...',
                text: 'Fetching Research data, please wait.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });
    
            const response = await axios.get("https://backend-j2o4.onrender.com/api/research");
            setBooks(response.data);
    
            // Close loading alert once data is fetched
            Swal.close();
        } catch (error) {
            console.error("Error fetching Research:", error);
    
            // Show error alert if fetching fails
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'There was an error fetching the Research. Please try again later.',
            });
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
                    await axios.delete(`https://backend-j2o4.onrender.com/api/research/${bookId}`);
                    fetchBooks(); // Refresh the book list
                    Swal.fire('Deleted!', 'Your book has been deleted.', 'success');
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
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.year.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="book-list-container">
            <h2 className="section-title">Research Repository</h2>

            {/* Modern Search bar */}
            <div className="book-list-actions">
                <div className="search-container">
                    <i className="fa fa-search search-icon"></i>
                    <input
                        type="text"
                        placeholder="Search....."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-bar modern-search-bar"
                    />
                </div>
            </div>

            <table className="book-list-table">
                <thead>
                    <tr>
                        <th style={{ width: '40%', textAlign: 'center' }}>Research Title</th>
                        <th>Date Submitted</th>
                        <th>Abstract</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredBooks.map((book) => (
                        <tr key={book.id}>
                            <td style={{ textJustify: 'inherit' }}>{book.title}</td>
                            <td>{book.year}</td>
                            <td>
                                <a href={book.abstract_url} target="_blank" rel="noopener noreferrer">
                                    View Abstract
                                </a>
                            </td>
                            <td>
                                <button onClick={() => handleEdit(book)} className="edit-button">
                                    Edit
                                </button>
                                <button onClick={() => deleteBook(book.id)} className="delete-button">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
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

export default ResearchList;
