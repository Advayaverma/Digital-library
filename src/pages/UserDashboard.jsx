import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar.jsx';
import BookTable from '../components/BookTable.jsx';
import AlertBanner from '../components/AlertBanner.jsx';
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
  const [actionInProgressId, setActionInProgressId] = useState(null);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'danger', message: '' }

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 5000);
  };

  const loadData = async () => {
    setIsLoadingBooks(true);
    try {
      const catalog = await bookService.getBooks();
      setBooks(catalog || []);

      const active = await borrowService.getActiveBorrowings(user?.id);
      const returned = await borrowService.getReturnedBorrowings(user?.id);
      setBorrowedBooks(active || []);
      setReturnedBooks(returned || []);
    } catch (err) {
      console.error('Failed to load user dashboard data:', err);
      showFeedback('danger', 'Unable to load library catalog. Please check your connection.');
    } finally {
      setIsLoadingBooks(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleBorrow = async (book) => {
    const daysStr = prompt('Enter the number of days you want to borrow the book:');
    if (daysStr === null) return; // User cancelled prompt

    const days = parseInt(daysStr, 10);
    if (!days || days <= 0) {
      showFeedback('danger', 'Invalid number of days. Please enter a positive number.');
      return;
    }

    setActionInProgressId(`borrow-${book.id}`);
    try {
      await borrowService.borrowBook({
        userId: user?.id,
        bookId: book.id,
        days,
        bookFallback: book,
      });

      showFeedback('success', `Successfully borrowed "${book.name || book.title}" for ${days} days!`);
      await loadData();
    } catch (err) {
      showFeedback('danger', `Borrow failed: ${err.message}`);
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleReturn = async (borrowing) => {
    setActionInProgressId(`return-${borrowing.id}`);
    try {
      const today = new Date();
      const returnDate = today.toISOString().split('T')[0];
      const dueDate = new Date(borrowing.dueDate);
      const delayDays = Math.max(0, Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24)));

      await borrowService.returnBook({
        borrowingId: borrowing.id,
        bookFallback: borrowing,
      });

      const delayMsg = delayDays > 0 ? ` (Delayed by ${delayDays} days)` : ' (Returned on time)';
      showFeedback('success', `Returned "${borrowing.name}" successfully!${delayMsg}`);
      await loadData();
    } catch (err) {
      showFeedback('danger', `Return failed: ${err.message}`);
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleDeleteReturned = async (borrowing) => {
    setActionInProgressId(`delete-${borrowing.id}`);
    try {
      await borrowService.deleteReturnedBorrowing(borrowing.id);
      setReturnedBooks((prev) => prev.filter((b) => b.id !== borrowing.id));
      showFeedback('info', 'Record removed from return history.');
    } catch (err) {
      showFeedback('danger', `Delete failed: ${err.message}`);
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // Availability calculation
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

        {/* Real-time Feedback Banner */}
        {feedback && (
          <AlertBanner
            type={feedback.type}
            message={feedback.message}
            onClose={() => setFeedback(null)}
          />
        )}

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
          emptyMessage="No available books found matching your criteria."
          tableId="tableBody"
          renderRow={(book, index) => {
            const isProcessing = actionInProgressId === `borrow-${book.id}`;
            return (
              <tr key={book.id || index}>
                <td>{book.name || book.title}</td>
                <td>{book.author}</td>
                <td>{book.genre}</td>
                <td>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleBorrow(book)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Borrowing...' : 'Borrow'}
                  </button>
                </td>
              </tr>
            );
          }}
        />

        {/* Borrowed Books Table */}
        <h3 className="mt-5">Borrowed Books</h3>
        <BookTable
          headers={['Name', 'Author', 'Genre', 'Due Date', 'Action']}
          items={borrowedBooks}
          emptyMessage="You have no currently borrowed books."
          tableId="borrowedBody"
          renderRow={(borrowing, index) => {
            const isProcessing = actionInProgressId === `return-${borrowing.id}`;
            return (
              <tr key={borrowing.id || index}>
                <td>{borrowing.name}</td>
                <td>{borrowing.author}</td>
                <td>{borrowing.genre}</td>
                <td>{borrowing.dueDate}</td>
                <td>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => handleReturn(borrowing)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Returning...' : 'Return'}
                  </button>
                </td>
              </tr>
            );
          }}
        />

        {/* Returned Books Table */}
        <h3 className="mt-5">Returned Books</h3>
        <BookTable
          headers={['Name', 'Author', 'Due Date', 'Return Date', 'Action']}
          items={returnedBooks}
          emptyMessage="No loan return history recorded yet."
          tableId="returnedBody"
          renderRow={(borrowing, index) => {
            const isProcessing = actionInProgressId === `delete-${borrowing.id}`;
            return (
              <tr key={borrowing.id || index}>
                <td>{borrowing.name}</td>
                <td>{borrowing.author}</td>
                <td>{borrowing.dueDate}</td>
                <td>{borrowing.returnDate}</td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteReturned(borrowing)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            );
          }}
        />
      </div>
    </div>
  );
}
