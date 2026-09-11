import React, { useState, useEffect } from 'react';

export default function UserDashboard({ onNavigate }) {
  const [books, setBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [returnedBooks, setReturnedBooks] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isLoadingCSV, setIsLoadingCSV] = useState(false);

  // Load books from localStorage or CSV on initial mount
  useEffect(() => {
    const storedBooks = JSON.parse(localStorage.getItem('books')) || [];
    const storedBorrowed = JSON.parse(localStorage.getItem('borrowedBooks')) || [];
    const storedReturned = JSON.parse(localStorage.getItem('returnedBooks')) || [];

    setBorrowedBooks(storedBorrowed);
    setReturnedBooks(storedReturned);

    if (storedBooks.length > 0 || localStorage.getItem('csvLoaded') === 'true') {
      setBooks(storedBooks);
    } else {
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
        headers: {
          Range: `bytes=${startByte}-${endByte}`,
        },
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
        const author = parts[2].trim();

        let hash = 0;
        for (let j = 0; j < isbn.length; j++) {
          hash = isbn.charCodeAt(j) + ((hash << 5) - hash);
        }
        const genre = genres[Math.abs(hash) % genres.length];

        parsedBooks.push({
          id: isbn || Date.now() + i,
          name: title,
          author: author,
          genre: genre,
        });
      }

      if (parsedBooks.length > 0) {
        localStorage.setItem('books', JSON.stringify(parsedBooks));
        localStorage.setItem('csvLoaded', 'true');
        setBooks(parsedBooks);
      } else {
        throw new Error('No books parsed');
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

  const handleBorrow = (book) => {
    const daysStr = prompt('Enter the number of days you want to borrow the book:');
    const days = parseInt(daysStr, 10);
    if (!days || days <= 0) {
      alert('Invalid number of days. Please enter a positive number.');
      return;
    }

    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + days);

    const borrowedItem = {
      ...book,
      dueDate: dueDate.toISOString().split('T')[0],
      user: JSON.parse(localStorage.getItem('currentUser'))?.username || 'user123',
    };

    const updatedBorrowed = [...borrowedBooks, borrowedItem];
    setBorrowedBooks(updatedBorrowed);
    localStorage.setItem('borrowedBooks', JSON.stringify(updatedBorrowed));
  };

  const handleReturn = (book, index) => {
    const today = new Date();
    const returnDate = today.toISOString().split('T')[0];
    const dueDate = new Date(book.dueDate);
    const delayDays = Math.max(0, Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24)));

    const returnedItem = {
      ...book,
      returnDate: returnDate,
    };

    const updatedBorrowed = borrowedBooks.filter((_, i) => i !== index);
    const updatedReturned = [...returnedBooks, returnedItem];

    setBorrowedBooks(updatedBorrowed);
    setReturnedBooks(updatedReturned);

    localStorage.setItem('borrowedBooks', JSON.stringify(updatedBorrowed));
    localStorage.setItem('returnedBooks', JSON.stringify(updatedReturned));

    alert(
      `Book: ${book.name}\nReturned on: ${returnDate}\nDue Date was: ${book.dueDate}\n${
        delayDays > 0 ? '⚠ Delayed by ' + delayDays + ' days!' : '✅ Returned on time!'
      }`
    );
  };

  const handleDeleteReturned = (index) => {
    const updatedReturned = returnedBooks.filter((_, i) => i !== index);
    setReturnedBooks(updatedReturned);
    localStorage.setItem('returnedBooks', JSON.stringify(updatedReturned));
  };

  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('currentUser');
    if (onNavigate) {
      onNavigate('login');
    }
  };

  // Filter available books: not currently in borrowed list, matching search
  const availableBooks = books
    .filter((b) => !borrowedBooks.some((borrowed) => borrowed.name === b.name))
    .filter((b) => {
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
          <h2 className="mb-0">User Dashboard</h2>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
        <hr style={{ borderColor: 'rgba(255,255,255,0.2)' }} />

        {/* Search Books */}
        <input
          className="form-control mb-4"
          id="searchTxt"
          type="search"
          placeholder="Search Books by Name, Author, or Genre"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        {/* Available Books */}
        <h3>Available Books</h3>
        <div className="table-responsive">
          <table className="table table-dark table-hover mt-3">
            <thead>
              <tr>
                <th>Name</th>
                <th>Author</th>
                <th>Genre</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="tableBody">
              {isLoadingCSV ? (
                <tr>
                  <td colSpan="4" className="text-center">
                    <div className="spinner-border text-light" role="status" style={{ width: '1.5rem', height: '1.5rem' }}>
                      <span className="sr-only">Loading...</span>
                    </div>
                    <span className="ml-2">Preloading random books from CSV...</span>
                  </td>
                </tr>
              ) : availableBooks.length > 0 ? (
                availableBooks.map((book, index) => (
                  <tr key={book.id || index}>
                    <td>{book.name}</td>
                    <td>{book.author}</td>
                    <td>{book.genre}</td>
                    <td>
                      <button className="btn btn-success btn-sm" onClick={() => handleBorrow(book)}>
                        Borrow
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    No books available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Borrowed Books */}
        <h3 className="mt-5">Borrowed Books</h3>
        <div className="table-responsive">
          <table className="table table-dark table-hover mt-3">
            <thead>
              <tr>
                <th>Name</th>
                <th>Author</th>
                <th>Genre</th>
                <th>Due Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="borrowedBody">
              {borrowedBooks.length > 0 ? (
                borrowedBooks.map((book, index) => (
                  <tr key={book.id || index}>
                    <td>{book.name}</td>
                    <td>{book.author}</td>
                    <td>{book.genre}</td>
                    <td>{book.dueDate}</td>
                    <td>
                      <button className="btn btn-warning btn-sm" onClick={() => handleReturn(book, index)}>
                        Return
                      </button>
                    </td>
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

        {/* Returned Books */}
        <h3 className="mt-5">Returned Books</h3>
        <div className="table-responsive">
          <table className="table table-dark table-hover mt-3">
            <thead>
              <tr>
                <th>Name</th>
                <th>Author</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="returnedBody">
              {returnedBooks.length > 0 ? (
                returnedBooks.map((book, index) => (
                  <tr key={book.id || index}>
                    <td>{book.name}</td>
                    <td>{book.author}</td>
                    <td>{book.dueDate}</td>
                    <td>{book.returnDate}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteReturned(index)}>
                        Delete
                      </button>
                    </td>
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
