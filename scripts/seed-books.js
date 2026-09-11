/**
 * Automated Database Seeding Script
 * Populates PostgreSQL public.books table using Supabase client
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env file manually
const envPath = path.resolve(__dirname, '../.env');
let supabaseUrl = process.env.VITE_SUPABASE_URL;
let supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...rest] = trimmed.split('=');
      const val = rest.join('=').trim();
      if (key.trim() === 'VITE_SUPABASE_URL') supabaseUrl = val;
      if (key.trim() === 'VITE_SUPABASE_ANON_KEY') supabaseAnonKey = val;
    }
  }
}

const seedBooks = [
  {
    title: "Harry Potter and the Sorcerer's Stone",
    author: 'J.K. Rowling',
    genre: 'Fantasy',
    isbn: '059035342X',
    cover_image_url: 'https://bukovero.com/wp-content/uploads/2016/07/Harry_Potter_and_the_Cursed_Child_Special_Rehearsal_Edition_Book_Cover.jpg',
  },
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    genre: 'Fiction',
    isbn: '0061120081',
    cover_image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: '1984',
    author: 'George Orwell',
    genre: 'Sci-Fi',
    isbn: '0451524934',
    cover_image_url: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    genre: 'Fiction',
    isbn: '0743273565',
    cover_image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    genre: 'Romance',
    isbn: '0141439513',
    cover_image_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    genre: 'Fantasy',
    isbn: '054792822X',
    cover_image_url: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Classical Mythology',
    author: 'Mark P. O. Morford',
    genre: 'Mythology',
    isbn: '0195153448',
    cover_image_url: 'http://images.amazon.com/images/P/0195153448.01.LZZZZZZZ.jpg',
  },
  {
    title: 'Clara Callan',
    author: 'Richard Bruce Wright',
    genre: 'Fiction',
    isbn: '0002005018',
    cover_image_url: 'http://images.amazon.com/images/P/0002005018.01.LZZZZZZZ.jpg',
  },
  {
    title: 'Decision in Normandy',
    author: "Carlo D'Este",
    genre: 'History',
    isbn: '0060973129',
    cover_image_url: 'http://images.amazon.com/images/P/0060973129.01.LZZZZZZZ.jpg',
  },
  {
    title: 'Flu: Great Influenza Pandemic of 1918',
    author: 'Gina Bari Kolata',
    genre: 'Science',
    isbn: '0374157065',
    cover_image_url: 'http://images.amazon.com/images/P/0374157065.01.LZZZZZZZ.jpg',
  },
  {
    title: 'The Mummies of Urumchi',
    author: 'E. J. W. Barber',
    genre: 'History',
    isbn: '0393045218',
    cover_image_url: 'http://images.amazon.com/images/P/0393045218.01.LZZZZZZZ.jpg',
  },
  {
    title: 'The Kitchen God’s Wife',
    author: 'Amy Tan',
    genre: 'Fiction',
    isbn: '0399135782',
    cover_image_url: 'http://images.amazon.com/images/P/0399135782.01.LZZZZZZZ.jpg',
  },
];

async function runSeed() {
  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes('your-project-ref')
  ) {
    console.log(
      'ℹ️ Note: Supabase credentials are not yet configured in .env.\n' +
      '   You can either add your credentials to .env and re-run "npm run seed",\n' +
      '   or copy the SQL script from "supabase/seed.sql" and run it in the Supabase SQL Editor directly.'
    );
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log(`📡 Connecting to Supabase at: ${supabaseUrl}`);
  console.log(`📦 Inserting ${seedBooks.length} books into public.books...`);

  const { data, error } = await supabase.from('books').insert(seedBooks).select();

  if (error) {
    console.error('❌ Error inserting books:', error.message);
  } else {
    console.log(`✅ Successfully seeded ${data.length} books into PostgreSQL!`);
  }
}

runSeed();
