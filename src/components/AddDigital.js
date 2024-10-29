import React, { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase"; // Import storage from firebase.js
import axios from "axios";
import Swal from "sweetalert2"; // Import SweetAlert
import "../Styles/AddBook.css"; // Import your CSS file

const AddBook = () => {
  const [image, setImage] = useState(null);
  const [pdf, setPdf] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    year: "",
  });

  // Handle file input change
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handlePdfChange = (e) => {
    setPdf(e.target.files[0]);
  };

  // Handle form data change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image || !pdf) {
      Swal.fire("Error!", "Please select an image and a PDF to upload", "error");
      return;
    }

    // Show loading alert
    Swal.fire({
      title: 'Uploading...',
      text: 'Please wait while we upload the book.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // Create a reference to the storage location
    const storageRef = ref(storage, `Images/${image.name}`);
    const pdfStorageRef = ref(storage, `PDFs/${pdf.name}`);
    const pdfUploadTask = uploadBytesResumable(pdfStorageRef, pdf);
    const uploadTask = uploadBytesResumable(storageRef, image);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Optional: You can track upload progress here
      },
      (error) => {
        console.error("Error uploading image: ", error);
        Swal.fire("Error!", "Error uploading image.", "error");
      },
      async () => {
        // Get the image download URL after the upload is complete
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const pdfDownloadURL = await getDownloadURL(pdfUploadTask.snapshot.ref);

        // Now send the form data with the image URL to your backend
        const bookData = {
          title: formData.title,
          author: formData.author,
          year: formData.year,
          url: downloadURL, // The image URL from Firebase
          stocks: pdfDownloadURL,
        };

        try {
          // Make a POST request to your backend to insert book data into PostgreSQL
          await axios.post("https://backend-j2o4.onrender.com/api/digital_copies", bookData);
          Swal.fire("Success!", "Book added successfully!", "success");
          // Reset form after submission
          setFormData({
            title: "",
            author: "",
            year: "",
          });
          setImage(null);
          setPdf(null);
        } catch (error) {
          console.error("Error adding book:", error);
          Swal.fire("Error!", "Error adding book.", "error");
        }
      }
    );
  };

  return (
    <div className="add-book-container">
      <h2>Add Digital Copies</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Title"
          required
        />
        <input
          type="text"
          name="author"
          value={formData.author}
          onChange={handleInputChange}
          placeholder="Author"
          required
        />
            <p>Publication Date:</p>
        <input
          type="date"
          name="year"
          value={formData.year}
          onChange={handleInputChange}
          required
        />
        <p>Book Cover:</p>
        <input type="file" onChange={handleImageChange} required />
        {image && (
          <div className="image-preview">
            <h4>Selected Image:</h4>
            <img src={URL.createObjectURL(image)} alt="Selected" />
          </div>
        )}
        <p>Soft Copy(PDF):</p>
        <input type="file" accept="application/pdf" onChange={handlePdfChange} required />
        {pdf && (
          <div className="pdf-preview">
            <h4>Selected PDF:</h4>
            <p>{pdf.name}</p>
          </div>
        )}
        <button type="submit">Add Book</button>
      </form>
    </div>
  );
};

export default AddBook;
