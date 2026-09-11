import React, { useState, useEffect } from 'react';

export default function AdminDashboard({ onNavigate }) {
  const [books, setBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [returnedBooks, setReturnedBooks] = useState([]);
  const [searchText, setSearchText] = useState('');

  // Form state
  const [bookId, setBookId] = useState('');
  const [bookName, setBookName] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [isLoadingCSV, setIsLoadingCSV] = useState(false);

  useEffect(() => {
    const storedBooks = JSON.parse(localStorage.getItem('books')) || [];
    const storedBorrowed = JSON.parse(localStorage.getItem('borrowedBooks')) || [];
    const storedReturned = JSON.parse(localStorage.getItem('returnedBooks')) || [];

    setBooks(storedBooks);
    setBorrowedBooks(storedBorrowed);
    setReturnedBooks(storedReturned);

    if (storedBooks.length === 0 && localStorage.getItem('csvLoaded') !== 'true') {
      loadBooksFromCSV();
    }
  }, []);

  const loadBooksFromCSV = async () => {
    setIsLoadingCSV(true);
    try {
      const fileSize = 77800000;
      const chunkSize = 500 * 1024; // 500 KB
      const maxStart = fileSize - chunkSize - 2000;
      const startByte = Math.max(0, Math.floor(Math.random() * maxStart));
      const endByte = startByte + chunkSize;

      const response = await fetch('/books.csv', {
        headers: { Range: `bytes=${startByte}-${endByte}` },
      });

      let text = '';
      if (response.status === 206) {
        text = await response.text();
      } else {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let bytesRead = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          text += decoder.decode(value, { stream: true });
          bytesRead += value.length;
          if (bytesRead >= chunkSize) {
            reader.cancel();
            break;
          }
        }
      }

      const lines = text.split('\n');
      const startIdx = response.status === 206 && startByte > 0 ? 1 : 1;
      const parsedBooks = [];
      const genres = ['Fiction', 'Mystery', 'Sci-Fi', 'Biography', 'History', 'Fantasy', 'Romance', 'Thriller'];

      for (let i = startIdx; i < lines.length - 1; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split('";"');
        if (parts.length < 3) continue;

        const isbn = parts[0].replace(/^"/, '').trim();
        const title = parts[1].trim();
        const bookAuthor = parts[2].trim();

        let hash = 0;
        for (let j = 0; j < isbn.length; j++) {
          hash = isbn.charCodeAt(j) + ((hash << 5) - hash);
        }
        const assignedGenre = genres[Math.abs(hash) % genres.length];

        parsedBooks.push({
          id: isbn || Date.now() + i,
          name: title,
          author: bookAuthor,
          genre: assignedGenre,
        });
      }

      if (parsedBooks.length > 0) {
        localStorage.setItem('books', JSON.stringify(parsedBooks));
        localStorage.setItem('csvLoaded', 'true');
        setBooks(parsedBooks);
      } else {
        throw new Error('No books parsed.');
      }
    } catch (error) {
      console.error('Error preloading books:', error);
      const fallbackBooks = [
        { id: '0195153448', name: 'Classical Mythology', author: 'Mark P. O. Morford', genre: 'Mythology' },
        { id: '0002005018', name: 'Clara Callan', author: 'Richard Bruce Wright', genre: 'Fiction' },
        { id: '0060973129', name: "Decision in Normandy", author: "Carlo D'Este", genre: 'History' },
        { id: '0374157065', name: 'Flu: Great Influenza Pandemic of 1918', author: 'Gina Bari Kolata', genre: 'Science' },
      ];
      localStorage.setItem('books', JSON.stringify(fallbackBooks));
      localStorage.setItem('csvLoaded', 'true');
      setBooks(fallbackBooks);
    } finally {
      setIsLoadingCSV(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!bookName.trim() || !author.trim() || !genre.trim()) return;

    let updatedBooks = [...books];

    if (bookId) {
      // Edit existing book
      updatedBooks = updatedBooks.map((b) =>
        b.id == bookId ? { ...b, name: bookName, author, genre } : b
      );
    } else {
      // Add new book
      const newBook = {
        id: Date.now(),
        name: bookName,
        author: author,
        genre: genre,
      };
      updatedBooks.push(newBook);
    }

    setBooks(updatedBooks);
    localStorage.setItem('books', JSON.stringify(updatedBooks));

    // Reset form
    setBookId('');
    setBookName('');
    setAuthor('');
    setGenre('');
  };

  const handleEdit = (book) => {
    setBookId(book.id);
    setBookName(book.name);
    setAuthor(book.author);
    setGenre(book.genre);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemove = (id) => {
    const updated = books.filter((b) => b.id != id);
    setBooks(updated);
    localStorage.setItem('books', JSON.stringify(updated));
  };

  const handleDeleteAll = () => {
    if (
      window.confirm(
        'Are you sure you want to delete all books? This will also clear active catalog state.'
      )
    ) {
      setBooks([]);
      localStorage.setItem('books', JSON.stringify([]));
      localStorage.setItem('csvLoaded', 'true');
    }
  };

  const handleRestoreCSV = async () => {
    if (
      window.confirm(
        'Are you sure you want to load books from CSV? This will overwrite your current book list.'
      )
    ) {
      localStorage.removeItem('books');
      localStorage.removeItem('csvLoaded');
      await loadBooksFromCSV();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('currentUser');
    if (onNavigate) {
      onNavigate('login');
    }
  };

  const filteredBooks = books.filter((b) => {
    if (!searchText.trim()) return true;
    const lower = searchText.toLowerCase();
    return (
      b.name?.toLowerCase().includes(lower) ||
      b.author?.toLowerCase().includes(lower) ||
      b.genre?.toLowerCase().includes(lower)
    );
  });

  return (
    <div
      style={{
        background: "url('/pexels-repuding-12064.jpg') no-repeat center center fixed",
        backgroundSize: 'cover',
        minHeight: '100vh',
        padding: '80px 15px 40px',
        color: '#fff',
      }}
    >
      <div
        className="container"
        style={{
          background: 'rgba(0, 0, 0, 0.75)',
          padding: '30px',
          borderRadius: '10px',
          marginTop: '20px',
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0">Admin Dashboard</h2>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
        <hr style={{ borderColor: 'rgba(255,255,255,0.2)' }} />

        {/* Add / Edit Book Form */}
        <form id="libraryForm" onSubmit={handleFormSubmit} className="mb-4">
          <input
            type="text"
            className="form-control"
            id="bookName"
            placeholder="Book Name"
            value={bookName}
            onChange={(e) => setBookName(e.target.value)}
            required
          />
          <input
            type="text"
            className="form-control"
            id="author"
            placeholder="Author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
          />
          <input
            type="text"
            className="form-control"
            id="genre"
            placeholder="Genres (comma separated)"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            required
          />
          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-success btn-block mb-2">
              {bookId ? 'Update Book' : 'Add Book'}
            </button>
            {bookId && (
              <button
                type="button"
                className="btn btn-secondary ml-2 mb-2"
                onClick={() => {
                  setBookId('');
                  setBookName('');
                  setAuthor('');
                  setGenre('');
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Search Bar */}
        <input
          className="form-control mb-3"
          id="searchTxt"
          type="search"
          placeholder="Search Books by Name, Author, or Genre"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        {/* Available Books Header & Buttons */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="mb-0">Available Books</h3>
          <div>
            <button className="btn btn-outline-warning btn-sm mr-2" onClick={handleRestoreCSV}>
              Load CSV Books
            </button>
            <button className="btn btn-outline-danger btn-sm" onClick={handleDeleteAll}>
              Delete All Books
            </button>
          </div>
        </div>

        {/* Available Books Table */}
        <div className="table-responsive">
          <table className="table table-dark table-hover mt-3">
            <thead>
              <tr>
                <th>Name</th>
                <th>Author</th>
                <th>Genres</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="adminTableBody">
              {isLoadingCSV ? (
                <tr>
                  <td colSpan="4" className="text-center">
                    <div className="spinner-border text-light" role="status" style={{ width: '1.5rem', height: '1.5rem' }}>
                      <span className="sr-only">Loading...</span>
                    </div>
                    <span className="ml-2">Loading random books from CSV...</span>
                  </td>
                </tr>
              ) : filteredBooks.length > 0 ? (
                filteredBooks.map((book) => (
                  <tr key={book.id}>
                    <td>{book.name}</td>
                    <td>{book.author}</td>
                    <td>{book.genre}</td>
                    <td>
                      <button className="btn btn-warning btn-sm mr-2" onClick={() => handleEdit(book)}>
                        Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleRemove(book.id)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    No books found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Borrowed Books Table */}
        <h3 className="mt-5">Borrowed Books</h3>
        <div className="table-responsive">
          <table className="table table-dark table-hover mt-3">
            <thead>
              <tr>
                <th>User</th>
                <th>Book Name</th>
                <th>Author</th>
                <th>Genre</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody id="borrowedBooksTable">
              {borrowedBooks.length > 0 ? (
                borrowedBooks.map((book, index) => (
                  <tr key={index}>
                    <td>{book.user || 'Unknown User'}</td>
                    <td>{book.name}</td>
                    <td>{book.author}</td>
                    <td>{book.genre}</td>
                    <td>{book.dueDate}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    No borrowed books
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Returned Books Table */}
        <h3 className="mt-5">Returned Books</h3>
        <div className="table-responsive">
          <table className="table table-dark table-hover mt-3">
            <thead>
              <tr>
                <th>User</th>
                <th>Book Name</th>
                <th>Author</th>
                <th>Due Date</th>
                <th>Return Date</th>
              </tr>
            </thead>
            <tbody id="returnedBooksTable">
              {returnedBooks.length > 0 ? (
                returnedBooks.map((book, index) => (
                  <tr key={index}>
                    <td>{book.user || 'Unknown User'}</td>
                    <td>{book.name}</td>
                    <td>{book.author}</td>
                    <td>{book.dueDate}</td>
                    <td>{book.returnDate}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    No returned books
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
