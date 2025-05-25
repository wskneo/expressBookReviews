const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Check if the username already exists
  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists." });
  }

  // Add new user
  users.push({ username, password });
  console.log(users);

  return res.status(200).json({ message: "User registered successfully." });
});


// Get the book list available in the shop
public_users.get('/', function (req, res) {
  // Return the full list of books as JSON
  return res.status(200).json({ books: books });
});

const axios = require('axios');
// Get the book list available in the shop using async/await
public_users.get('/async-books', async function (req, res) {
    try {
      // Simulate an API call to your own server
      const response = await axios.get('http://localhost:5000/');
      return res.status(200).json(response.data);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching book list", error: error.message });
    }
  });

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
  
    // Loop through all books to find one with the matching ISBN
    for (let key in books) {
      if (books[key].isbn === isbn) {
        return res.status(200).json({ book: books[key] });
      }
    }
  
    return res.status(404).json({ message: "Book not found" });
  });  


// Get book details based on ISBN using async/await
public_users.get('/async-isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    return res.status(200).json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: "Book not found" });
    }
    return res.status(500).json({ message: "Error fetching book details", error: error.message });
  }
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();
  const matchingBooks = [];

  // Iterate through the books and collect those by the given author
  Object.values(books).forEach(book => {
    if (book.author.toLowerCase() === author) {
      matchingBooks.push(book);
    }
  });

  if (matchingBooks.length > 0) {
    return res.status(200).json({ booksByAuthor: matchingBooks });
  } else {
    return res.status(404).json({ message: "No books found for the given author" });
  }
});

// Get book details based on author using async/await
public_users.get('/async-author/:author', async function (req, res) {
    const author = req.params.author;
  
    try {
      const response = await axios.get(`http://localhost:5000/author/${author}`);
      return res.status(200).json(response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return res.status(404).json({ message: "No books found for the given author" });
      }
      return res.status(500).json({ message: "Error fetching book details", error: error.message });
    }
  });


// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title.toLowerCase();
  const matchingBooks = [];

  Object.values(books).forEach(book => {
    if (book.title.toLowerCase() === title) {
      matchingBooks.push(book);
    }
  });

  if (matchingBooks.length > 0) {
    return res.status(200).json({ booksByAuthor: matchingBooks });
  } else {
    return res.status(404).json({ message: "No books found for the given title" });
  }
});

// Get all books based on title using async/await
public_users.get('/async-title/:title', async function (req, res) {
    const title = req.params.title;
  
    try {
      const response = await axios.get(`http://localhost:5000/title/${title}`);
      return res.status(200).json(response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return res.status(404).json({ message: "No books found for the given title" });
      }
      return res.status(500).json({ message: "Error fetching book details", error: error.message });
    }
  });

public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
  
    for (let key in books) {
      if (books[key].isbn === isbn) {
        return res.status(200).json({ reviews: books[key].reviews });
      }
    }
  
    return res.status(404).json({ message: "Book not found" });
  });
  
  

module.exports.general = public_users;
