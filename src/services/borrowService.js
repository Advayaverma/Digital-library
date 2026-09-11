import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

/**
 * Normalizes a joined borrowing record from PostgreSQL / Supabase
 */
const normalizeBorrowing = (b) => {
  return {
    id: b.id,
    bookId: b.book_id,
    userId: b.user_id,
    name: b.books?.title || b.name || 'Untitled Book',
    author: b.books?.author || b.author || 'Unknown Author',
    genre: b.books?.genre || b.genre || 'General',
    user: b.profiles?.username || b.user || 'Unknown User',
    borrowDate: b.borrow_date || null,
    dueDate: b.due_date || null,
    returnDate: b.return_date || null,
    status: b.status || 'borrowed',
  };
};

/**
 * Get active borrowed books (status = 'borrowed')
 * If userId is provided, filters for that user. If omitted, returns all (for admin audit).
 */
export async function getActiveBorrowings(userId = null) {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase
        .from('borrowings')
        .select(`
          id,
          book_id,
          user_id,
          borrow_date,
          due_date,
          return_date,
          status,
          books ( id, title, author, genre ),
          profiles ( id, username )
        `)
        .eq('status', 'borrowed')
        .order('borrow_date', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(normalizeBorrowing);
    } catch (err) {
      console.error('Error fetching active borrowings:', err.message);
    }
  }

  // Fallback to localStorage
  const local = JSON.parse(localStorage.getItem('borrowedBooks')) || [];
  return local.map(normalizeBorrowing);
}

/**
 * Get returned borrowing history (status = 'returned')
 */
export async function getReturnedBorrowings(userId = null) {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase
        .from('borrowings')
        .select(`
          id,
          book_id,
          user_id,
          borrow_date,
          due_date,
          return_date,
          status,
          books ( id, title, author, genre ),
          profiles ( id, username )
        `)
        .eq('status', 'returned')
        .order('return_date', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(normalizeBorrowing);
    } catch (err) {
      console.error('Error fetching returned borrowings:', err.message);
    }
  }

  const local = JSON.parse(localStorage.getItem('returnedBooks')) || [];
  return local.map(normalizeBorrowing);
}

/**
 * Borrow a book
 * Enforces PostgreSQL unique constraint (unique_active_book_borrowing) to prevent race conditions.
 */
export async function borrowBook({ userId, bookId, days = 7, bookFallback }) {
  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(today.getDate() + Number(days));

  const borrowDateStr = today.toISOString().split('T')[0];
  const dueDateStr = dueDate.toISOString().split('T')[0];

  if (isSupabaseConfigured() && userId) {
    try {
      const { data, error } = await supabase
        .from('borrowings')
        .insert([
          {
            user_id: userId,
            book_id: bookId,
            borrow_date: borrowDateStr,
            due_date: dueDateStr,
            status: 'borrowed',
          },
        ])
        .select(`
          id,
          book_id,
          user_id,
          borrow_date,
          due_date,
          status,
          books ( id, title, author, genre )
        `)
        .single();

      if (error) {
        // Handle PostgreSQL unique partial index conflict (book already borrowed)
        if (error.code === '23505' || error.message?.includes('unique_active_book_borrowing')) {
          throw new Error('This book is currently unavailable (already borrowed by another user).');
        }
        throw error;
      }

      return normalizeBorrowing(data);
    } catch (err) {
      console.error('Supabase borrow error:', err.message);
      throw err;
    }
  }

  // Fallback persistence
  const borrowed = JSON.parse(localStorage.getItem('borrowedBooks')) || [];
  const item = {
    id: Date.now(),
    book_id: bookId,
    user_id: userId || 'local-user',
    name: bookFallback?.name || bookFallback?.title || 'Untitled Book',
    author: bookFallback?.author || 'Unknown Author',
    genre: bookFallback?.genre || 'General',
    user: JSON.parse(localStorage.getItem('currentUser'))?.username || 'user123',
    borrow_date: borrowDateStr,
    due_date: dueDateStr,
    status: 'borrowed',
  };
  borrowed.push(item);
  localStorage.setItem('borrowedBooks', JSON.stringify(borrowed));
  return normalizeBorrowing(item);
}

/**
 * Return a borrowed book
 */
export async function returnBook({ borrowingId, bookFallback }) {
  const today = new Date();
  const returnDateStr = today.toISOString().split('T')[0];

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('borrowings')
        .update({
          return_date: returnDateStr,
          status: 'returned',
          updated_at: new Date().toISOString(),
        })
        .eq('id', borrowingId)
        .select(`
          id,
          book_id,
          user_id,
          borrow_date,
          due_date,
          return_date,
          status,
          books ( id, title, author, genre )
        `)
        .single();

      if (error) throw error;
      return normalizeBorrowing(data);
    } catch (err) {
      console.error('Supabase return error:', err.message);
      throw err;
    }
  }

  // Fallback persistence
  const borrowed = JSON.parse(localStorage.getItem('borrowedBooks')) || [];
  const returned = JSON.parse(localStorage.getItem('returnedBooks')) || [];

  const foundIndex = borrowed.findIndex((b) => b.id == borrowingId);
  let item = null;

  if (foundIndex !== -1) {
    item = { ...borrowed[foundIndex], return_date: returnDateStr, status: 'returned' };
    borrowed.splice(foundIndex, 1);
  } else if (bookFallback) {
    item = { ...bookFallback, return_date: returnDateStr, status: 'returned' };
  }

  if (item) {
    returned.push(item);
    localStorage.setItem('borrowedBooks', JSON.stringify(borrowed));
    localStorage.setItem('returnedBooks', JSON.stringify(returned));
    return normalizeBorrowing(item);
  }
  return null;
}

/**
 * Delete a returned borrowing record from history
 */
export async function deleteReturnedBorrowing(borrowingId) {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('borrowings')
        .delete()
        .eq('id', borrowingId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Supabase delete returned borrowing error:', err.message);
      throw err;
    }
  }

  const returned = JSON.parse(localStorage.getItem('returnedBooks')) || [];
  const filtered = returned.filter((b) => b.id != borrowingId);
  localStorage.setItem('returnedBooks', JSON.stringify(filtered));
  return true;
}
