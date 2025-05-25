const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if both username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Check if the user exists and credentials match
  if (!isValid(username) || !authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password." });
  }

  // Generate JWT token
  const accessToken = jwt.sign(
    { username },
    "fingerprint_customer", // Secret key must match the session secret
    { expiresIn: '1h' }
  );

  // Save token in session
  req.session.authorization = { accessToken, username };

  return res.status(200).json({ message: "User logged in successfully.", token: accessToken });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;

  // Get username from session
  const username = req.session?.authorization?.username;

  // Check if user is authenticated
  if (!username) {
    return res.status(401).json({ message: "User not logged in." });
  }

  // Check if review is provided
  if (!review) {
    return res.status(400).json({ message: "Review query is required." });
  }

  // Find the book by ISBN
  let bookFound = null;
  for (let key in books) {
    if (books[key].isbn === isbn) {
      bookFound = books[key];
      break;
    }
  }

  if (!bookFound) {
    return res.status(404).json({ message: "Book not found." });
  }

  // Add or update review by this user
  bookFound.reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated successfully.",
    reviews: bookFound.reviews
  });
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  // Get username from session (stored during login)
  const username = req.session?.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "Unauthorized: No user logged in" });
  }

  // Find the book by matching its isbn
  let bookFound = null;
  for (let key in books) {
    if (books[key].isbn === isbn) {
      bookFound = books[key];
      break;
    }
  }

  if (!bookFound) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if the user has a review to delete
  if (!bookFound.reviews[username]) {
    return res.status(404).json({ message: "No review found for this user on the book" });
  }

  // Delete the user's review
  delete bookFound.reviews[username];

  return res.status(200).json({ message: "Review deleted successfully" });
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
