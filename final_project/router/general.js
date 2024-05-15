const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // 检查是否提供了用户名和密码
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // 检查用户名是否已存在
  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // 注册新用户
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});



// Get the list of books available in the shop
public_users.get('/', async function (req, res) {
  try {
    // Simulate asynchronous fetching of book data
    const response = await axios.get('http://localhost:5001/books'); // Assume there is an endpoint providing book data
    const booksList = response.data;
    res.status(200).json(booksList);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve books", error: error.message });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    // Simulate asynchronous fetching of book data
    const response = await axios.get(`http://localhost:5001/books/${isbn}`); // Assume there is an endpoint providing book data
    const bookDetails = response.data;

    if (bookDetails) {
      res.status(200).json(bookDetails);
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve book details", error: error.message });
  }
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  try {
    // Simulate asynchronous fetching of book data
    const response = await axios.get(`http://localhost:5001/books/author/${author}`); // Assume there is an endpoint providing book data
    const authorBooks = response.data;

    if (authorBooks.length > 0) {
      res.status(200).json(authorBooks);
    } else {
      res.status(404).json({ message: "No books found for this author" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve books by author", error: error.message });
  }
});

// Get book details based on title
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;

  try {
    // Simulate asynchronous fetching of book data
    const response = await axios.get(`http://localhost:5001/books/title/${title}`); // Assume there is an endpoint providing book data
    const titleBooks = response.data;

    if (titleBooks.length > 0) {
      res.status(200).json(titleBooks);
    } else {
      res.status(404).json({ message: "No books found with this title" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve books by title", error: error.message });
  }
});

// Get book reviews
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn; // Retrieve ISBN from request parameters
  const book = books[isbn]; // Access book details using ISBN

  if (book) {
    res.status(200).json(book.reviews); // If the book exists, return its reviews
  } else {
    res.status(404).json({ message: "Book not found" }); // If no book found, return 404 not found response
  }
});
module.exports.general = public_users;
