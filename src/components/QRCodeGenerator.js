import React, { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import '../Styles/QRCodeGenerator.css';
import logo from '../logo/gradschool.gif';

const QRCodeGenerator = () => {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Replace with the path to your logo
  const logoUrl = logo; 

  // Fetch books data from the backend
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('https://backend-j2o4.onrender.com/api/books'); // Replace with your API URL
        const data = await response.json();
        setBooks(data);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    fetchBooks();
  }, []);

  // Filter books based on the search query
  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to print the QR codes
  const printQRCodes = () => {
    window.print();
  };

  return (
    <div className="container">
      <h1 className="title no-print">QR Code Generator</h1>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search by title..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="no-print"
        style={{ marginBottom: '20px', padding: '8px', width: '100%', boxSizing: 'border-box' }}
      />

      {/* Button to print QR codes */}
      <button
        className="button no-print"
        onClick={printQRCodes}
        style={{ marginBottom: '20px' }}
      >
        Print QR Codes
      </button>

      <div className="qr-grid">
        {filteredBooks.map((book) => (
          <div key={book.book_id} className="qr-item">
            <div id={`qr-${book.book_id}`} className="qr-code">
              <QRCodeCanvas
                value={`${book.book_id}`}
                size={80}
                level="H" 
                imageSettings={{
                  src: logoUrl,
                  height: 25, 
                  width: 25, 
                  excavate: true,
                }}
              />

            </div>
            <div className="book-info">
              <p className="book-title">{book.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QRCodeGenerator;
