import React, { useState } from "react";
import axios from "axios"; // Import axios
import { storage } from "../firebase"; // Import your firebase storage
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import functions for storage
import Swal from "sweetalert2"; // Import SweetAlert2
import "./EditBook.css"; // Keep this line if you create EditBook.css

const EditBook = ({ book, onClose, onBookUpdated }) => {
    const [title, setTitle] = useState(book.title);
    const [author, setAuthor] = useState(book.author);
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };


    // Initialize state with formatted date
    const [year, setYear] = useState(
        book.year ? formatDate(book.year) : ''
    );

    const [url, setUrl] = useState(book.image_url); // Keep track of the current URL
    const [coverImage, setCoverImage] = useState(null); // State to hold the selected image file
    const [pdf_url, setpdfUrl] = useState(book.pdf_url); // Keep track of the current URL
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

        let downloadURL = url;
        let pdfDownloadURL = pdf_url;

        // Check if a new image is selected
        if (coverImage) {
            const storageRef = ref(storage, `Images/${Date.now()}_${coverImage.name}`);
            try {
                // Upload the new image to Firebase
                await uploadBytes(storageRef, coverImage);

                // Get the new download URL
                downloadURL = await getDownloadURL(storageRef);
                setUrl(downloadURL); // Update URL in state
            } catch (uploadError) {
                console.error("Error uploading image:", uploadError);
                setLoading(false); // Stop loading
                Swal.fire({
                    icon: 'error',
                    title: 'Upload Failed',
                    text: 'There was an error uploading the image.',
                });
                return; // Exit the function to avoid proceeding with the update
            }
        }

        if (pdf) {
            const pdfStorageRef = ref(storage, `PDFs/${pdf.name}`);
            try {
                // Upload the PDF to Firebase
                await uploadBytes(pdfStorageRef, pdf);

                // Get the new download URL
                pdfDownloadURL = await getDownloadURL(pdfStorageRef);
                setpdfUrl(pdfDownloadURL); // Update PDF URL in state
            } catch (uploadError) {
                console.error("Error uploading PDF:", uploadError);
                setLoading(false); // Stop loading
                Swal.fire({
                    icon: 'error',
                    title: 'Upload Failed',
                    text: 'There was an error uploading the PDF.',
                });
                return; // Exit the function to avoid proceeding with the update
            }
        }

        try {
            // Make the update request to the server
            const response = await axios.put(`https://backend-j2o4.onrender.com/api/digital_copies/${book.book_id}`, {
                title,
                author,
                year,
                url: downloadURL,
                pdf_url: pdfDownloadURL,
            });

            console.log("Response from server:", response.data);

            // Close loading dialog and show success alert
            Swal.fire({
                icon: 'success',
                title: 'Updated!',
                text: 'The book details have been updated successfully.',
            });

            onBookUpdated(); // Refresh the book list
            onClose(); // Close the modal
        } catch (error) {
            console.error("Error updating book:", error);
            // Close loading dialog and show error alert
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
            <h2>Edit Book</h2>
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
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Author"
                    required
                />
                <input
                    type="date"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="Publication Year"
                    required
                />


                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files[0];
                        setCoverImage(file); // Store selected file
                        console.log("Selected file:", file); // Log selected file
                    }}
                />
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                        const file = e.target.files[0];
                        setPdf(file); // Store selected file
                        console.log("Selected file:", file);
                    }} />
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
