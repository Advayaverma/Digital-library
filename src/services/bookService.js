import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

/**
 * Normalizes book object so both `title` and `name` are supported
 * to ensure 100% backward compatibility with existing dashboard code.
 */
const normalizeBook = (b) => ({
  id: b.id,
  name: b.title || b.name || 'Untitled Book',
  title: b.title || b.name || 'Untitled Book',
  author: b.author || 'Unknown Author',
  genre: b.genre || 'General',
  isbn: b.isbn || null,
  cover_image_url: b.cover_image_url || null,
  created_at: b.created_at || null,
});

/**
 * READ all books
 * Fetches from Supabase `public.books` table, with graceful fallback to localStorage if unconfigured.
 */
export async function getBooks() {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error('Error fetching books from Supabase:', error.message);
        throw error;
      }

      if (data && data.length > 0) {
        return data.map(normalizeBook);
      }
    } catch (err) {
      console.warn('Falling back to local storage books:', err.message);
    }
  }

  // Fallback to localStorage
  const local = JSON.parse(localStorage.getItem('books')) || [];
  return local.map(normalizeBook);
}

/**
 * READ single book by ID
 */
export async function getBookById(id) {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return normalizeBook(data);
    } catch (err) {
      console.error(`Error fetching book with id ${id}:`, err.message);
    }
  }

  const local = JSON.parse(localStorage.getItem('books')) || [];
  const found = local.find((b) => b.id == id);
  return found ? normalizeBook(found) : null;
}

/**
 * CREATE a new book
 */
export async function addBook({ title, name, author, genre, isbn, cover_image_url }) {
  const bookTitle = title || name;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('books')
        .insert([
          {
            title: bookTitle,
            author,
            genre,
            isbn: isbn || null,
            cover_image_url: cover_image_url || null,
          },
        ])
        .select();

      if (error) throw error;
      if (data && data[0]) {
        return normalizeBook(data[0]);
      }
    } catch (err) {
      console.error('Error adding book to Supabase:', err.message);
      throw err;
    }
  }

  // Fallback persistence
  const local = JSON.parse(localStorage.getItem('books')) || [];
  const newBook = normalizeBook({
    id: Date.now(),
    title: bookTitle,
    author,
    genre,
    isbn,
    cover_image_url,
  });
  local.push(newBook);
  localStorage.setItem('books', JSON.stringify(local));
  return newBook;
}

/**
 * UPDATE an existing book
 */
export async function updateBook(id, { title, name, author, genre, isbn, cover_image_url }) {
  const bookTitle = title || name;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('books')
        .update({
          title: bookTitle,
          author,
          genre,
          isbn: isbn || null,
          cover_image_url: cover_image_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select();

      if (error) throw error;
      if (data && data[0]) {
        return normalizeBook(data[0]);
      }
    } catch (err) {
      console.error(`Error updating book ${id} in Supabase:`, err.message);
      throw err;
    }
  }

  // Fallback persistence
  const local = JSON.parse(localStorage.getItem('books')) || [];
  const index = local.findIndex((b) => b.id == id);
  if (index !== -1) {
    local[index] = normalizeBook({
      ...local[index],
      title: bookTitle,
      author,
      genre,
      isbn,
      cover_image_url,
    });
    localStorage.setItem('books', JSON.stringify(local));
    return local[index];
  }
  return null;
}

/**
 * DELETE a book
 */
export async function deleteBook(id) {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('books').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error(`Error deleting book ${id} in Supabase:`, err.message);
      throw err;
    }
  }

  // Fallback persistence
  const local = JSON.parse(localStorage.getItem('books')) || [];
  const filtered = local.filter((b) => b.id != id);
  localStorage.setItem('books', JSON.stringify(filtered));
  return true;
}

/**
 * DELETE ALL books (Admin catalog reset)
 */
export async function deleteAllBooks() {
  if (isSupabaseConfigured()) {
    try {
      // In Supabase, delete with neq filter deletes all rows
      const { error } = await supabase.from('books').delete().neq('id', 0);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error clearing books in Supabase:', err.message);
      throw err;
    }
  }

  localStorage.setItem('books', JSON.stringify([]));
  return true;
}

/**
 * SEARCH books across title, author, and genre
 */
export async function searchBooks(query) {
  if (!query || !query.trim()) {
    return getBooks();
  }

  const q = query.trim();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .or(`title.ilike.%${q}%,author.ilike.%${q}%,genre.ilike.%${q}%`)
        .order('id', { ascending: true });

      if (error) throw error;
      if (data) return data.map(normalizeBook);
    } catch (err) {
      console.warn('Supabase search error, falling back to local search:', err.message);
    }
  }

  const all = await getBooks();
  const lower = q.toLowerCase();
  return all.filter(
    (b) =>
      b.name.toLowerCase().includes(lower) ||
      b.author.toLowerCase().includes(lower) ||
      b.genre.toLowerCase().includes(lower)
  );
}
