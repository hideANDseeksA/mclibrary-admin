// services/booksService.js
import axios from 'axios';

const API_URL = 'http://localhost:3000/books';

export const getBooks = async () => {
  return await axios.get(API_URL);
};

export const getBook = async (title) => {
  return await axios.get(`${API_URL}/${title}`);
};

export const createBook = async (book) => {
  return await axios.post(API_URL, book);
};

export const updateBook = async (title, updatedBook) => {
  return await axios.put(`${API_URL}/${title}`, updatedBook);
};

export const deleteBook = async (title) => {
  return await axios.delete(`${API_URL}/${title}`);
};
