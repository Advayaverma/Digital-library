-- ==============================================================================
-- Digital Library Seed Data
-- Phase 8: Migrate Book Dataset to PostgreSQL
-- ==============================================================================

-- Clear existing sample records if re-seeding (optional)
-- TRUNCATE TABLE public.books CASCADE;

INSERT INTO public.books (title, author, genre, isbn, cover_image_url)
VALUES
    -- Curated Library Classics & App Favorites
    ('Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', 'Fantasy', '059035342X', 'https://bukovero.com/wp-content/uploads/2016/07/Harry_Potter_and_the_Cursed_Child_Special_Rehearsal_Edition_Book_Cover.jpg'),
    ('To Kill a Mockingbird', 'Harper Lee', 'Fiction', '0061120081', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80'),
    ('1984', 'George Orwell', 'Sci-Fi', '0451524934', 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=600&q=80'),
    ('The Great Gatsby', 'F. Scott Fitzgerald', 'Fiction', '0743273565', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80'),
    ('Pride and Prejudice', 'Jane Austen', 'Romance', '0141439513', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80'),
    ('The Hobbit', 'J.R.R. Tolkien', 'Fantasy', '054792822X', 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80'),
    ('Moby-Dick', 'Herman Melville', 'Adventure', '1503280780', 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=600&q=80'),
    ('War and Peace', 'Leo Tolstoy', 'History', '1400079985', 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80'),
    ('Crime and Punishment', 'Fyodor Dostoevsky', 'Thriller', '0140449132', 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=80'),
    ('The Catcher in the Rye', 'J.D. Salinger', 'Fiction', '0316769487', 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&q=80'),

    -- App Default Seed Books from original codebase
    ('Classical Mythology', 'Mark P. O. Morford', 'Mythology', '0195153448', 'http://images.amazon.com/images/P/0195153448.01.LZZZZZZZ.jpg'),
    ('Clara Callan', 'Richard Bruce Wright', 'Fiction', '0002005018', 'http://images.amazon.com/images/P/0002005018.01.LZZZZZZZ.jpg'),
    ('Decision in Normandy', 'Carlo D''Este', 'History', '0060973129', 'http://images.amazon.com/images/P/0060973129.01.LZZZZZZZ.jpg'),
    ('Flu: Great Influenza Pandemic of 1918', 'Gina Bari Kolata', 'Science', '0374157065', 'http://images.amazon.com/images/P/0374157065.01.LZZZZZZZ.jpg'),

    -- Sampled Titles from books.csv Dataset
    ('The Mummies of Urumchi', 'E. J. W. Barber', 'History', '0393045218', 'http://images.amazon.com/images/P/0393045218.01.LZZZZZZZ.jpg'),
    ('The Kitchen God''s Wife', 'Amy Tan', 'Fiction', '0399135782', 'http://images.amazon.com/images/P/0399135782.01.LZZZZZZZ.jpg'),
    ('What If?: Foremost Military Historians Imagine', 'Robert Cowley', 'History', '0425176428', 'http://images.amazon.com/images/P/0425176428.01.LZZZZZZZ.jpg'),
    ('Pleading Guilty', 'Scott Turow', 'Thriller', '0671870432', 'http://images.amazon.com/images/P/0671870432.01.LZZZZZZZ.jpg'),
    ('Under the Black Flag: Romance and Reality of Pirates', 'David Cordingly', 'History', '0679425608', 'http://images.amazon.com/images/P/0679425608.01.LZZZZZZZ.jpg'),
    ('Where You''ll Find Me, and Other Stories', 'Ann Beattie', 'Fiction', '0743202699', 'http://images.amazon.com/images/P/0743202699.01.LZZZZZZZ.jpg')
ON CONFLICT DO NOTHING;
