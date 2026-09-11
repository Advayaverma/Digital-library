import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar.jsx';
import BookTable from '../components/BookTable.jsx';
import * as bookService from '../services/bookService.js';
import * as borrowService from '../services/borrowService.js';
import { useAuth } from '../hooks/useAuth.jsx';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const [books, setBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [returnedBooks, setReturnedBooks] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);

  const loadData = async () => {
    setIsLoadingBooks(true);
    try {
      // 1. Fetch catalog
      const catalog = await bookService.getBooks();
      setBooks(catalog || []);

      // 2. Fetch user's active borrowings & history from database
      const active = await borrowService.getActiveBorrowings(user?.id);
      const returned = await borrowService.getReturnedBorrowings(user?.id);
      setBorrowedBooks(active || []);
      setReturnedBooks(returned || []);
    } catch (err) {
      console.error('Failed to load user dashboard data:', err);
    } finally {
      setIsLoadingBooks(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleBorrow = async (book) => {
    const daysStr = prompt('Enter the number of days you want to borrow the book:');
    const days = parseInt(daysStr, 10);
    if (!days || days <= 0) {
      alert('Invalid number of days. Please enter a positive number.');
      return;
    }

    try {
      await borrowService.borrowBook({
        userId: user?.id,
        bookId: book.id,
        days,
        bookFallback: book,
      });

      alert(`Successfully borrowed "${book.name || book.title}" for ${days} days!`);
      await loadData();
    } catch (err) {
      alert(`Borrow failed: ${err.message}`);
    }
  };

  const handleReturn = async (borrowing) => {
    try {
      const today = new Date();
      const returnDate = today.toISOString().split('T')[0];
      const dueDate = new Date(borrowing.dueDate);
      const delayDays = Math.max(0, Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24)));

      await borrowService.returnBook({
        borrowingId: borrowing.id,
        bookFallback: borrowing,
      });

      alert(
        `Book: ${borrowing.name}\nReturned on: ${returnDate}\nDue Date was: ${borrowing.dueDate}\n${
          delayDays > 0 ? '⚠ Delayed by ' + delayDays + ' days!' : '✅ Returned on time!'
        }`
      );

      await loadData();
    } catch (err) {
      alert(`Return failed: ${err.message}`);
    }
  };

  const handleDeleteReturned = async (borrowing) => {
    try {
      await borrowService.deleteReturnedBorrowing(borrowing.id);
      setReturnedBooks((prev) => prev.filter((b) => b.id !== borrowing.id));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // Determine available books dynamically:
  // A book is available if its ID is not currently among active borrowings
  const availableBooks = books
    .filter((b) => !borrowedBooks.some((borrowed) => borrowed.bookId == b.id || borrowed.name === (b.name || b.title)))
    .filter((b) => {
      if (!searchText.trim()) return true;
      const lower = searchText.toLowerCase();
      return (
        (b.name || b.title)?.toLowerCase().includes(lower) ||
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

        {/* Reusable Search Bar */}
        <SearchBar
          value={searchText}
          onChange={setSearchText}
          placeholder="Search Books by Name, Author, or Genre"
        />

        {/* Available Books Table */}
        <h3>Available Books</h3>
        <BookTable
          headers={['Name', 'Author', 'Genre', 'Action']}
          items={availableBooks}
          isLoading={isLoadingBooks}
          loadingMessage="Loading library catalog..."
          emptyMessage="No books available"
          tableId="tableBody"
          renderRow={(book, index) => (
            <tr key={book.id || index}>
              <td>{book.name || book.title}</td>
              <td>{book.author}</td>
              <td>{book.genre}</td>
              <td>
                <button className="btn btn-success btn-sm" onClick={() => handleBorrow(book)}>
                  Borrow
                </button>
              </td>
            </tr>
          )}
        />

        {/* Borrowed Books Table */}
        <h3 className="mt-5">Borrowed Books</h3>
        <BookTable
          headers={['Name', 'Author', 'Genre', 'Due Date', 'Action']}
          items={borrowedBooks}
          emptyMessage="No borrowed books"
          tableId="borrowedBody"
          renderRow={(borrowing, index) => (
            <tr key={borrowing.id || index}>
              <td>{borrowing.name}</td>
              <td>{borrowing.author}</td>
              <td>{borrowing.genre}</td>
              <td>{borrowing.dueDate}</td>
              <td>
                <button className="btn btn-warning btn-sm" onClick={() => handleReturn(borrowing)}>
                  Return
                </button>
              </td>
            </tr>
          )}
        />

        {/* Returned Books Table */}
        <h3 className="mt-5">Returned Books</h3>
        <BookTable
          headers={['Name', 'Author', 'Due Date', 'Return Date', 'Action']}
          items={returnedBooks}
          emptyMessage="No returned books"
          tableId="returnedBody"
          renderRow={(borrowing, index) => (
            <tr key={borrowing.id || index}>
              <td>{borrowing.name}</td>
              <td>{borrowing.author}</td>
              <td>{borrowing.dueDate}</td>
              <td>{borrowing.returnDate}</td>
              <td>
                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteReturned(borrowing)}>
                  Delete
                </button>
              </td>
            </tr>
          )}
        />
      </div>
    </div>
  );
}
