import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar.jsx';
import BookTable from '../components/BookTable.jsx';
import * as bookService from '../services/bookService.js';
import * as borrowService from '../services/borrowService.js';
import { useAuth } from '../hooks/useAuth.jsx';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [books, setBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [returnedBooks, setReturnedBooks] = useState([]);
  const [searchText, setSearchText] = useState('');

  // Form state
  const [bookId, setBookId] = useState('');
  const [bookName, setBookName] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAllData = async () => {
    setIsLoadingBooks(true);
    try {
      // 1. Fetch catalog
      const catalog = await bookService.getBooks();
      setBooks(catalog || []);

      // 2. Fetch all system borrowings (active & returned)
      const active = await borrowService.getActiveBorrowings();
      const returned = await borrowService.getReturnedBorrowings();
      setBorrowedBooks(active || []);
      setReturnedBooks(returned || []);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setIsLoadingBooks(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!bookName.trim() || !author.trim() || !genre.trim()) return;

    setIsSubmitting(true);
    try {
      if (bookId) {
        // UPDATE book via service
        const updated = await bookService.updateBook(bookId, {
          title: bookName,
          author,
          genre,
        });
        setBooks((prev) =>
          prev.map((b) => (b.id == bookId ? updated || { ...b, name: bookName, title: bookName, author, genre } : b))
        );
      } else {
        // CREATE book via service
        const created = await bookService.addBook({
          title: bookName,
          author,
          genre,
        });
        setBooks((prev) => [...prev, created]);
      }

      // Reset form
      setBookId('');
      setBookName('');
      setAuthor('');
      setGenre('');
    } catch (err) {
      alert(`Error saving book: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (book) => {
    setBookId(book.id);
    setBookName(book.title || book.name);
    setAuthor(book.author);
    setGenre(book.genre);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Are you sure you want to remove this book?')) return;
    try {
      await bookService.deleteBook(id);
      setBooks((prev) => prev.filter((b) => b.id != id));
    } catch (err) {
      alert(`Error removing book: ${err.message}`);
    }
  };

  const handleDeleteAll = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete all books? This will also clear active catalog state.'
      )
    ) {
      try {
        await bookService.deleteAllBooks();
        setBooks([]);
        localStorage.setItem('csvLoaded', 'true');
      } catch (err) {
        alert(`Error deleting books: ${err.message}`);
      }
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const filteredBooks = books.filter((b) => {
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
            disabled={isSubmitting}
          />
          <input
            type="text"
            className="form-control"
            id="author"
            placeholder="Author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
            disabled={isSubmitting}
          />
          <input
            type="text"
            className="form-control"
            id="genre"
            placeholder="Genres (comma separated)"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            required
            disabled={isSubmitting}
          />
          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-success btn-block mb-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : bookId ? 'Update Book' : 'Add Book'}
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
                disabled={isSubmitting}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Reusable Search Bar */}
        <SearchBar
          value={searchText}
          onChange={setSearchText}
          placeholder="Search Books by Name, Author, or Genre"
        />

        {/* Available Books Header & Buttons */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="mb-0">Available Books</h3>
          <div>
            <button className="btn btn-outline-danger btn-sm" onClick={handleDeleteAll}>
              Delete All Books
            </button>
          </div>
        </div>

        {/* Available Books Table */}
        <BookTable
          headers={['Name', 'Author', 'Genres', 'Action']}
          items={filteredBooks}
          isLoading={isLoadingBooks}
          loadingMessage="Loading library catalog..."
          emptyMessage="No books found"
          tableId="adminTableBody"
          renderRow={(book) => (
            <tr key={book.id}>
              <td>{book.name || book.title}</td>
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
          )}
        />

        {/* Borrowed Books Table */}
        <h3 className="mt-5">Borrowed Books</h3>
        <BookTable
          headers={['User', 'Book Name', 'Author', 'Genre', 'Due Date']}
          items={borrowedBooks}
          emptyMessage="No borrowed books"
          tableId="borrowedBooksTable"
          renderRow={(book, index) => (
            <tr key={index}>
              <td>{book.user || 'Unknown User'}</td>
              <td>{book.name || book.title}</td>
              <td>{book.author}</td>
              <td>{book.genre}</td>
              <td>{book.dueDate}</td>
            </tr>
          )}
        />

        {/* Returned Books Table */}
        <h3 className="mt-5">Returned Books</h3>
        <BookTable
          headers={['User', 'Book Name', 'Author', 'Due Date', 'Return Date']}
          items={returnedBooks}
          emptyMessage="No returned books"
          tableId="returnedBooksTable"
          renderRow={(book, index) => (
            <tr key={index}>
              <td>{book.user || 'Unknown User'}</td>
              <td>{book.name || book.title}</td>
              <td>{book.author}</td>
              <td>{book.dueDate}</td>
              <td>{book.returnDate}</td>
            </tr>
          )}
        />
      </div>
    </div>
  );
}
