import React, { useState } from "react";
import axios from "axios"; // Import axios
import { storage } from "../firebase"; // Import your firebase storage
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import functions for storage
import Swal from "sweetalert2"; // Import SweetAlert2
import "./EditBook.css"; // Keep this line if you create EditBook.css

const EditBook = ({ book, onClose, onBookUpdated }) => {
    const [title, setTitle] = useState(book.title);
    const [keyword, setKeyword] = useState(book.keyword);


    // Initialize state with formatted date
    const [year, setYear] = useState((book.year));

    const [pdf_url, setpdfUrl] = useState(book.abstract_url); // Keep track of the current URL
    const [pdf, setPdf] = useState(null);
    const [loading, setLoading] = useState(false); // State to show loading status

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true); // Start loading

        // Show loading dialog
        Swal.fire({
            title: 'Updating...',
            html: 'Please wait while we update the book details.',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            willOpen: () => {
                Swal.showLoading(); // Show loading spinner
            },
        });

        let pdfDownloadURL = pdf_url;

        if (pdf) {
            const pdfStorageRef = ref(storage, `PDFs/${pdf.name}`);

            try {
                // Upload the new PDF to Firebase
                await uploadBytes(pdfStorageRef, pdf);

                // Get the new download URL
                pdfDownloadURL = await getDownloadURL(pdfStorageRef); // Get the new download URL
                pdfDownloadURL = String(pdfDownloadURL); // Convert URL to string explicitly
                setpdfUrl(pdfDownloadURL);
            } catch (uploadError) {
                console.error("Error uploading file:", uploadError);
                setLoading(false); // Stop loading
                Swal.fire({
                    icon: 'error',
                    title: 'Upload Failed',
                    text: 'There was an error uploading the file.',
                });
                return; // Exit the function to avoid proceeding with the update
            }
        }

        try {
            // Make the update request to the server with the correct downloadURL
            const response = await axios.put(`https://backend-j2o4.onrender.com/api/research/${book.id}`, {
                title,
                keyword,
                year,
                pdf_url: pdfDownloadURL,
            });
            console.log("Response from server:", response.data); // Log response for debugging

            Swal.fire({
                icon: 'success',
                title: 'Updated!',
                text: 'The book details have been updated successfully.',
            });

            onBookUpdated(); // Refresh the book list
            onClose(); // Close the modal

        } catch (error) {
            console.error("Error updating book:", error);
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: 'There was an error updating the book details.',
            });
        } finally {
            setLoading(false); // Stop loading
        }
    };

    return (
        <div className="edit-book-modal">
            <h2>Edit Research</h2>
            <form onSubmit={handleUpdate}>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Title"
                    required
                />
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="key word"
                    required
                />
                <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="Publication Year"
                    required
                />
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                        const file = e.target.files[0];
                        setPdf(file); 
                        console.log("Selected file:", file);
                    }}
                />
                <div className="button-group">
                    <button type="submit" disabled={loading}>
                        {loading ? "Updating..." : "Update"}
                    </button>
                    <button type="button" onClick={onClose}>Cancel</button>
                </div>

            </form>
        </div>
    );
};

export default EditBook;
