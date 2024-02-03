const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Convert the books object to an array of book objects including their key
let booksArray = Object.entries(books).map(([key, value]) => {
    return { ...value };
});

const isValid = (username) => { //returns boolean
    // Basic length check - adjust numbers as needed
    if (username.length < 4 || username.length > 20) {
        return false;
    }

    // Ensure username consists of only letters, numbers, or underscores
    if (!/^[A-Za-z0-9_]+$/.test(username)) {
        return false;
    }

    // Check if the username is already taken
    const isTaken = users.some((user) => user.username === username);
    return !isTaken; // Valid if not taken
}

const authenticatedUser = (username, password) => { //returns boolean
    //write code to check if username and password match the one we have in records.
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password)
    });
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.query.username;
    const password = req.query.password;

    if (!username || !password) {
        return res.status(401).json({ message: "Error logging in" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: username
        }, 'access', { expiresIn: 60 * 60 });

        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params; // Extract ISBN from URL parameters
    const { review } = req.query; // Extract review from request query
    const { username } = req.session; // Extract username from session

    const book = booksArray.find(book => book.isbn === isbn);

    if (!book) {
        // Book not found
        return res.status(404).json({ message: "Book not found" });
    }

    const existingReviewIndex = book.reviews.findIndex(r => r.username === username);

    if (existingReviewIndex > -1) {
        // Update existing review
        book.reviews[existingReviewIndex].review = review;
    } else {
        // Add new review
        book.reviews.push({ username, review });
    }

    // Save the updated booksArray back to your data store here

    return res.status(200).json({ message: "Review submitted successfully" });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const username = req.session.username; // Example: Getting username from session

    // Find the book by ISBN
    const book = booksArray.find(book => book.isbn === isbn);

    if (!book) {
        return res.status(404).send(`Book with ISBN ${isbn} not found.`);
    }

    // Filter out the review by the current user
    const initialReviewCount = book.reviews.length;
    book.reviews = book.reviews.filter(review => review.username !== username);

    if (book.reviews.length === initialReviewCount) {
        // No review was deleted, indicating the user hadn't reviewed this book
        return res.status(404).send(`Review by ${username} for ISBN ${isbn} not found.`);
    } else {
        // Save the updated book details to your data store here
        res.send(`Review by ${username} for ISBN ${isbn} deleted.`);
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;