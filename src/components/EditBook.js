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
  const year = date.getFullYear(); // Get the full year
  const day = String(date.getDate()).padStart(2, '0'); // Get the day with leading zero
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Get the month with leading zero (add 1 for zero-indexing)
  return `${year}-${month}-${day}`; // Return formatted date as YYYY-MM-DD
};


  // Initialize state with formatted date
  const [year, setYear] = useState(book.year ? formatDate(book.year) : '');
  const [stocks, setStocks] = useState(book.stocks);
  const [url, setUrl] = useState(book.url); // Keep track of the current URL
  const [coverImage, setCoverImage] = useState(null); // State to hold the selected image file
  const [loading, setLoading] = useState(false); // State to show loading status

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    // Show loading dialog without an "OK" button
    Swal.fire({
      title: 'Updating...',
      html: 'Please wait while we update the book details.',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false, // Disable the "OK" button
      willOpen: () => {
        Swal.showLoading(); // Show loading spinner
      },
    });

    let downloadURL = url; // Default to current URL

    // Check if a new image is selected
    if (coverImage) {
      const storageRef = ref(storage, `Images/${Date.now()}_${coverImage.name}`);
      try {
        // Upload the new image to Firebase
        await uploadBytes(storageRef, coverImage);

        // Get the new download URL
        downloadURL = await getDownloadURL(storageRef); // Get the new download URL
        downloadURL = String(downloadURL); // Convert URL to string explicitly
        setUrl(downloadURL);
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

    try {
      // Make the update request to the server with the correct downloadURL
      const response = await axios.put(`https://backend-j2o4.onrender.com/api/books/${book.book_id}`, {
        title,
        author,
        year,
        stocks,
        url: downloadURL, // Use the new downloadURL if a new image was uploaded
      });
      console.log("Response from server:", response.data); // Log response for debugging

      // Close the loading dialog and show success alert
      Swal.close(); // Close the loading dialog
      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'The book details have been updated successfully.',
        timer: 2000, // Automatically close the success alert after 2 seconds
      });

      onBookUpdated(); // Refresh the book list
      onClose(); // Close the modal

    } catch (error) {
      console.error("Error updating book:", error);
      // Close the loading dialog and show error alert
      Swal.close(); // Close the loading dialog
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
          type="number"
          value={stocks}
          onChange={(e) => setStocks(e.target.value)}
          placeholder="Available Copies"
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
