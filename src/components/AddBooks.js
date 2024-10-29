import React, { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase"; // Import storage from firebase.js
import axios from "axios";
import Swal from "sweetalert2"; // Import SweetAlert
import "../Styles/AddBook.css"; // Import your CSS file

const AddBook = () => {
  const [image, setImage] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    year: "",
    stocks: 0,
  });

  // Handle file input change
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // Handle form data change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      Swal.fire("Error!", "Please select an image to upload", "error");
      return;
    }

    // Show loading alert while uploading the image
    Swal.fire({
      title: "Uploading...",
      text: "Please wait while the image is being uploaded.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading(); // Start the loading animation
      },
    });

    // Create a reference to the storage location
    const storageRef = ref(storage, `Images/${image.name}`);
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

        // Now send the form data with the image URL to your backend
        const bookData = {
          title: formData.title,
          author: formData.author,
          year: formData.year,
          url: downloadURL, // The image URL from Firebase
          stocks: formData.stocks,
        };

        try {
          // Make a POST request to your backend to insert book data into PostgreSQL
          await axios.post("https://backend-j2o4.onrender.com/api/books", bookData);
          Swal.fire("Success!", "Book added successfully!", "success");
          // Reset form after submission
          setFormData({
            title: "",
            author: "",
            year: "",
            stocks: 0,
          });
          setImage(null);
        } catch (error) {
          console.error("Error adding book:", error);
          Swal.fire("Error!", "Error adding book.", "error");
        }
      }
    );
  };

  return (
    <div className="add-book-container">
      <h2>Add a New Book</h2>
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
        <p>Book Publication Date:</p>
        <input
          type="date"
          name="year"
          value={formData.year}
          onChange={handleInputChange}
          required
        />
        <p>Book Stocks:</p>
        <input
          type="number"
          name="stocks"
          value={formData.stocks}
          onChange={handleInputChange}
          placeholder="Stocks"
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
        <button type="submit">Add Book</button>
      </form>
    </div>
  );
};

export default AddBook;
