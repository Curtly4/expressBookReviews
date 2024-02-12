const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");

// Convert the books object to an array of book objects including their key
let booksArray = Object.entries(books).map(([key, value]) => {
  return { ...value };
});

//Function to check if the user exists
const doesExist = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
};

public_users.post("/register", (req, res) => {
  const username = req.query.username;
  const password = req.query.password;

  if (username && password) {
    if (!doesExist(username)) {
      users.push({ username: username, password: password });
      return res
        .status(200)
        .json({ message: "User successfully registred. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get("/", async function (req, res) {
  try {
    res.send(JSON.stringify(books, null, 2));
  } catch (error) {
    // Handle any errors that occur during the fetch
    console.error("Error fetching books data:", error);
    res.status(500).send("An error occurred while fetching books data.");
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async function (req, res) {
  const isbn = req.params.isbn;

  // Simulate fetching a book by ISBN asynchronously
  const getBookByIsbnAsync = async (isbn) => {
    // Simulate an asynchronous database call
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredBook = booksArray.filter((book) => book.isbn === isbn);
        resolve(filteredBook.length > 0 ? filteredBook[0] : null);
      }, 100); // Simulate delay
    });
  };

  try {
    // Await the asynchronous operation
    const filteredBook = await getBookByIsbnAsync(isbn);

    // Check if a book was found
    if (filteredBook) {
      res.send(filteredBook);
    } else {
      res.status(404).send({ message: "Book not found" });
    }
  } catch (error) {
    // Handle potential errors
    res.status(500).send("An error occurred while fetching the book data");
  }
});

// Get book details based on author
public_users.get("/author/:author", async function (req, res) {
  const author = req.params.author;

  // Simulate fetching a book by author asynchronously
  const getBookByAuthorAsync = async (author) => {
    // Simulate an asynchronous database call
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredBook = booksArray.filter(
          (book) => book.author === author
        );
        resolve(filteredBook.length > 0 ? filteredBook[0] : null);
      }, 100); // Simulate delay
    });
  };

  try {
    // Await the asynchronous operation
    const filteredBook = await getBookByAuthorAsync(author);

    // Check if a book was found
    if (filteredBook) {
      res.send(filteredBook);
    } else {
      res.status(404).send({ message: "Book not found" });
    }
  } catch (error) {
    // Handle potential errors
    res.status(500).send("An error occurred while fetching the book data");
  }
});

// Get all books based on title
public_users.get("/title/:title", async function (req, res) {
  const title = req.params.title;

  // Simulate fetching a book by title asynchronously
  const getBookByTitleAsync = async (title) => {
    // Simulate an asynchronous database call
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredBook = booksArray.filter((book) => book.title === title);
        resolve(filteredBook.length > 0 ? filteredBook[0] : null);
      }, 100); // Simulate delay
    });
  };

  try {
    // Await the asynchronous operation
    const filteredBook = await getBookByTitleAsync(title);

    // Check if a book was found
    if (filteredBook) {
      res.send(filteredBook);
    } else {
      res.status(404).send({ message: "Book not found" });
    }
  } catch (error) {
    // Handle potential errors
    res.status(500).send("An error occurred while fetching the book data");
  }
});

//  Get book review
public_users.get("/review/:isbn", async function (req, res) {
  const isbn = req.params.isbn;

  const getReviewByIsbn = async (isbn) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const filteredBooks = booksArray.filter((book) => book.isbn === isbn);
        if (filteredBooks.length === 0) {
          // Reject the promise if no book matches the ISBN
          reject(new Error("Book not found"));
        } else {
          const reviews = filteredBooks[0].reviews || [];
          resolve(reviews.length > 0 ? reviews : null);
        }
      }, 100); // Simulate delay
    });
  };

  try {
    const reviews = await getReviewByIsbn(isbn);
    if (reviews) {
      res.json(reviews); // Send the reviews if found
    } else {
      res
        .status(404)
        .send({ message: "No reviews found for book with ISBN: " + isbn });
    }
  } catch (error) {
    // Handle errors, including the 'Book not found' error
    res.status(404).send({ message: error.message });
  }

  /*
    let filtered_book = booksArray.filter((book) => book.isbn === isbn);
    if (!filtered_book) {
        // If the book is not found, send a 404 (Not Found) response
        res.status(404).send('Review not found for book with ISBN: ' + isbn);
        return;
    }

    let reviews = filtered_book.reviews;
    res.send(reviews)
    */
});

module.exports.general = public_users;
