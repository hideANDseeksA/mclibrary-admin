import React, { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";

const InsertNewStudents = () => {
  const [newStudents, setNewStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (!file) {
      Swal.fire({
        icon: "error",
        title: "No file selected",
        text: "Please select a valid Excel file.",
      });
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        Swal.fire({
          icon: "error",
          title: "Empty File",
          text: "The file is empty or contains no valid data.",
        });
        return;
      }

      // Ensure email validation for your domain
      const filteredNewStudents = jsonData.filter(
        (student) =>
          student.email &&
          student.email.endsWith("@mabinicolleges.edu.ph")
      );

      if (filteredNewStudents.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "No Valid New Students",
          text: "No new students with valid email addresses were found.",
        });
      } else {
        setNewStudents(filteredNewStudents);
        Swal.fire({
          icon: "success",
          title: "File Loaded",
          text: `${filteredNewStudents.length} valid new students found.`,
        });
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleInsertNewStudents = async () => {
    const confirmed = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to insert new students into the database.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, insert them!",
      cancelButtonText: "No, cancel!",
    });

    if (confirmed.isConfirmed) {
      setLoading(true);
      Swal.fire({
        title: "Inserting new students...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const response = await axios.post("https://backend-j2o4.onrender.com/api/insert_students", {
          students: newStudents,
        });
        Swal.fire({
          icon: "success",
          title: "New Students Inserted",
          text: response.data.message || "New students were successfully inserted.",
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "There was an error inserting the new students.",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <h1>Insert New Students</h1>
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
        disabled={loading}
      />
      <button onClick={handleInsertNewStudents} disabled={newStudents.length === 0 || loading}>
        {loading ? "Inserting..." : "Insert New Students"}
      </button>
    </div>
  );
};

export default InsertNewStudents;
