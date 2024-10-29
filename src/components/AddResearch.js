import React, { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase"; // Import storage from firebase.js
import axios from "axios";
import Swal from "sweetalert2"; // Import SweetAlert
import "../Styles/AddBook.css"; // Import your CSS file

const AddReseach = () => {
  const [pdf, setPdf] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    keyword:"",
    year: "",
  });

  // Handle file input change
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

    if (!pdf) {
      Swal.fire("Error!", "Please select a PDF to upload", "error");
      return;
    }

    // Display loading alert
    Swal.fire({
      title: "Uploading...",
      text: "Please wait while the PDF is being uploaded.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading(); // Show loading spinner
      },
    });

    // Create a reference to the storage location for PDFs
    const storageRef = ref(storage, `Abstract/${pdf.name}`);
    const uploadTask = uploadBytesResumable(storageRef, pdf);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Optional: You can track upload progress here
      },
      (error) => {
        console.error("Error uploading PDF: ", error);
        Swal.fire("Error!", "Error uploading PDF.", "error");
      },
      async () => {
        // Get the PDF download URL after the upload is complete
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        // Now send the form data with the PDF URL to your backend
        const bookData = {
          title: formData.title,
          keyword:formData.keyword,
          year: formData.year,
          url: downloadURL, // The PDF URL from Firebase
        };

        try {
          // Make a POST request to your backend to insert book data into PostgreSQL
          await axios.post("https://backend-j2o4.onrender.com/api/research", bookData);

          // Close the loading alert
          Swal.close();

          // Show success alert
          Swal.fire("Success!", "Book added successfully!", "success");

          // Reset form after submission
          setFormData({
            title: "",
            keyword:"",
            year: "",
          });
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
      <h2>Research Repository</h2>
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
          name="keyword"
          value={formData.keyword}
          onChange={handleInputChange}
          placeholder="keyword"
          required
        />

        <input
          type="number"
          name="year"
          value={formData.year}
          onChange={(e) => {
            const value = e.target.value;
            if (value.length <= 4) {
              handleInputChange(e); // Only allow input change if it's 4 digits or less
            }
          }}
          placeholder="Year Submitted"
          required
          max="9999" // This ensures the user can't submit a number greater than 9999
        />

      <p>Abstract Pdf File:</p>
        <input type="file" accept="application/pdf" onChange={handlePdfChange} required />
        {pdf && (
          <div className="pdf-preview">
            <h4>Selected PDF:</h4>
            <p>{pdf.name}</p> {/* Display the PDF file name */}
          </div>
        )}
        <button type="submit">Continue</button>
      </form>
    </div>
  );
};

export default AddReseach;
