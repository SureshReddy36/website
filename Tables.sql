-- Create authors table
CREATE TABLE authors (
  author_id INT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  birth_year INT
);

-- Create genres table
CREATE TABLE genres (
  genre_id INT PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);

-- Create shelves table
CREATE TABLE shelves (
  shelf_id INT PRIMARY KEY,
  shelf_number VARCHAR(10) NOT NULL UNIQUE, 
  location VARCHAR(50) 
);

-- Create books table
CREATE TABLE books (
  book_id INT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  author_id INT NOT NULL,
  genre_id INT,
  publication_year INT,
  shelf_id INT,
  FOREIGN KEY (author_id) REFERENCES authors(author_id),
  FOREIGN KEY (genre_id) REFERENCES genres(genre_id),
  FOREIGN KEY (shelf_id) REFERENCES shelves(shelf_id)
);

-- Create borrowers table
CREATE TABLE borrowers (
  borrower_id INT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL
);

-- Create borrowings table
CREATE TABLE borrowings (
  borrowing_id INT PRIMARY KEY,
  book_id INT NOT NULL,
  borrower_id INT NOT NULL,
  borrow_date DATE NOT NULL,
  return_date DATE,
  FOREIGN KEY (book_id) REFERENCES books(book_id),
  FOREIGN KEY (borrower_id) REFERENCES borrowers(borrower_id)
);

