-- Insert sample data into authors table
INSERT INTO authors (author_id, name, birth_year)
VALUES
  (1, 'J.K. Rowling', 1965),
  (2, 'J.R.R. Tolkien', 1892),
  (3, 'George R.R. Martin', 1948);

-- Insert sample data into genres table
INSERT INTO genres (genre_id, name)
VALUES
  (1, 'Fantasy'),
  (2, 'Adventure'),
  (3, 'Science Fiction');

-- Insert sample data into shelves table
INSERT INTO shelves (shelf_id, shelf_number, location) VALUES
  (1, 'A12', 'Fantasy'),
  (2, 'B05', 'Sci-Fi & Fantasy'); 

-- Insert sample data into books table
INSERT INTO books (book_id, title, author_id, genre_id, publication_year, shelf_id)
VALUES
  (1, 'Harry Potter and the Philosopher\'s Stone', 1, 1, 1997, 1),
  (2, 'The Lord of the Rings', 2, 2, 1954, 2),
  (3, 'A Game of Thrones', 3, 3, 1996, 2);

-- Insert sample data into borrowers table
INSERT INTO borrowers (borrower_id, name, email)
VALUES
  (1, 'John Doe', 'johndoe@example.com'),
  (2, 'Jane Doe', 'janedoe@example.com');

-- Insert sample data into borrowings table
INSERT INTO borrowings (borrowing_id, book_id, borrower_id, borrow_date, return_date)
VALUES
  (1, 1, 1, '2022-01-01', '2022-01-15'),
  (2, 2, 2, '2022-02-01', '2022-02-20');

-- Retrieve book information with shelf details
SELECT 
    b.title, 
    a.name AS author_name, 
    g.name AS genre_name,
    s.shelf_number,
    s.location AS shelf_location
FROM books AS b
JOIN authors AS a ON b.author_id = a.author_id
JOIN genres AS g ON b.genre_id = g.genre_id
JOIN shelves AS s ON b.shelf_id = s.shelf_id
WHERE b.author_id = 1; 

-- Retrieve borrowers who borrowed a specific book
SELECT * FROM borrowers WHERE borrower_id IN (SELECT borrower_id FROM borrowings WHERE book_id = 1);