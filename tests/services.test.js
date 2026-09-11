import test from 'node:test';
import assert from 'node:assert/strict';

// Setup in-memory localStorage polyfill for Node.js environment
const store = new Map();
globalThis.localStorage = {
  getItem: (key) => store.get(key) || null,
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: (key) => store.delete(key),
  clear: () => store.clear(),
};

import { isSupabaseConfigured } from '../src/lib/supabase.js';
import * as bookService from '../src/services/bookService.js';
import * as borrowService from '../src/services/borrowService.js';
import * as profileService from '../src/services/profileService.js';

test('Supabase configuration detection', (t) => {
  // Should return a boolean without throwing exceptions
  const configured = isSupabaseConfigured();
  assert.equal(typeof configured, 'boolean');
});

test('BookService CRUD and search operations', async (t) => {
  localStorage.clear();

  await t.test('addBook normalizes title and name', async () => {
    const book = await bookService.addBook({
      title: 'Clean Code',
      author: 'Robert C. Martin',
      genre: 'Software Architecture',
    });

    assert.ok(book.id, 'Book should have an ID');
    assert.equal(book.title, 'Clean Code');
    assert.equal(book.name, 'Clean Code');
    assert.equal(book.author, 'Robert C. Martin');
    assert.equal(book.genre, 'Software Architecture');
  });

  await t.test('getBooks returns stored catalog', async () => {
    const books = await bookService.getBooks();
    assert.equal(books.length, 1);
    assert.equal(books[0].title, 'Clean Code');
  });

  await t.test('getBookById fetches existing book', async () => {
    const books = await bookService.getBooks();
    const targetId = books[0].id;
    const found = await bookService.getBookById(targetId);
    assert.ok(found);
    assert.equal(found.id, targetId);
    assert.equal(found.title, 'Clean Code');
  });

  await t.test('searchBooks finds books matching author or title', async () => {
    const byTitle = await bookService.searchBooks('Clean');
    assert.equal(byTitle.length, 1);

    const byAuthor = await bookService.searchBooks('Martin');
    assert.equal(byAuthor.length, 1);

    const noMatch = await bookService.searchBooks('NonExistentTitleXYZ');
    assert.equal(noMatch.length, 0);
  });

  await t.test('updateBook updates existing book', async () => {
    const books = await bookService.getBooks();
    const targetId = books[0].id;
    const updated = await bookService.updateBook(targetId, {
      title: 'Clean Code: Second Edition',
      genre: 'Software Craftsmanship',
    });

    assert.equal(updated.title, 'Clean Code: Second Edition');
    assert.equal(updated.name, 'Clean Code: Second Edition');
    assert.equal(updated.genre, 'Software Craftsmanship');
  });

  await t.test('deleteBook removes book from catalog', async () => {
    const books = await bookService.getBooks();
    const targetId = books[0].id;
    await bookService.deleteBook(targetId);

    const remaining = await bookService.getBooks();
    assert.equal(remaining.length, 0);
  });
});

test('BorrowService loan and return lifecycle', async (t) => {
  localStorage.clear();

  // Create a test book first
  const testBook = await bookService.addBook({
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt & David Thomas',
    genre: 'Programming',
  });

  const testUserId = 'user-test-123';
  const testUserName = 'Jane Doe';

  await t.test('borrowBook creates an active loan', async () => {
    const loan = await borrowService.borrowBook({
      bookId: testBook.id,
      userId: testUserId,
      days: 14,
      bookFallback: testBook,
    });

    assert.ok(loan.id, 'Loan record should have an ID');
    assert.equal(loan.bookId, testBook.id);
    assert.equal(loan.userId, testUserId);
    assert.ok(loan.dueDate);
  });

  await t.test('getActiveBorrowings lists active user loans', async () => {
    const active = await borrowService.getActiveBorrowings(testUserId);
    assert.equal(active.length, 1);
    assert.equal(active[0].name || active[0].title, 'The Pragmatic Programmer');
  });

  await t.test('returnBook moves loan from active to returned', async () => {
    const active = await borrowService.getActiveBorrowings(testUserId);
    const loanId = active[0].id;

    const returned = await borrowService.returnBook({
      borrowingId: loanId,
      bookFallback: active[0],
    });
    assert.ok(returned);

    // Active should now be empty
    const remainingActive = await borrowService.getActiveBorrowings(testUserId);
    assert.equal(remainingActive.length, 0);

    // Returned history should contain the record
    const returnedHistory = await borrowService.getReturnedBorrowings(testUserId);
    assert.equal(returnedHistory.length, 1);
    assert.equal(returnedHistory[0].name || returnedHistory[0].title, 'The Pragmatic Programmer');
    assert.ok(returnedHistory[0].returnDate);
  });
});

test('ProfileService user roles and admin check', (t) => {
  assert.equal(profileService.isAdmin({ role: 'admin' }), true);
  assert.equal(profileService.isAdmin({ role: 'user' }), false);
  assert.equal(profileService.isAdmin(null), false);
  assert.equal(profileService.isAdmin(undefined), false);
});
