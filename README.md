# Digital Library

A modern, responsive web application for managing and browsing a digital library. The application features a dynamic landing page with rich animations, and distinct dashboards for users (to browse and borrow books) and admins (to manage the library catalog and track borrowings).

---

## 🛠️ Tech Stack

* **Frontend**: HTML5, Vanilla CSS, JavaScript (ES6+)
* **Styling Framework**: Bootstrap 4.3.1 (used for dashboards)
* **Icons**: FontAwesome 6.0.0
* **Animations**: 
  * [GSAP (GreenSock Animation Platform)](https://greensock.com/gsap/) for advanced timelines and dynamic animations.
  * [Locomotive Scroll](https://locomotivemtl.github.io/locomotive-scroll/) for smooth scrolling and scroll-bound animations.
* **Storage & Persistence**: `localStorage` (stores users, admins, books list, borrowed books, and returned books details directly in the browser).
* **Seed Data**: A partial HTTP `Range` request is used to download a random **500 KB chunk** of a large 77.8 MB CSV file (`public/books.csv`) to initialize the book list dynamically without heavy page loads.

---

## 🚀 How the Project Works

1. **Landing Page**: Located at [index.html](index.html). It serves as the entrance, styled using Locomotive Scroll for custom smooth scroll dynamics and GSAP for entry animations.
2. **Preloading Seed Data**:
   * When either dashboard is loaded, the application checks if the `books` array exists in `localStorage`.
   * If it is empty, the application sends a `fetch` request targeting `public/books.csv` with a random byte `Range` header (e.g. `bytes=startByte-endByte`).
   * It downloads a lightweight 500 KB section, parses the CSV content, assigns genres using a string hash of the book's ISBN, and saves the set to `localStorage`.
   * If this request fails, the application falls back to a preset list of popular books.
3. **Data Flows**:
   * Any action—adding, borrowing, returning, editing, or deleting a book—mutates the state stored in `localStorage`, which immediately updates the UI tables in real-time.

---

## 🔑 Authentication Guide

### How to Sign Up
To register a new user account:
1. Navigate to the **Sign Up** page ([lib/signup.html](lib/signup.html)).
2. Fill in a unique username, your email, and choose a password.
3. Submit the form. This adds your account credentials directly to the `"users"` array stored in `localStorage`.
4. You will be redirected to the Login page.

---

### How to Log In

Navigate to the **Login** page ([lib/login.html](lib/login.html)). There are two login tabs available at the top of the form:

#### 1. Login as User
* Select the **Login as User** tab.
* Enter your registered username and password.
* **Default Credentials (if you haven't signed up yet)**:
  * **Username**: `user123`
  * **Password**: `userpass`
* Successful login redirects you to the [User Dashboard](lib/user-dashboard.html).

#### 2. Login as Admin
* Select the **Login as Admin** tab.
* Enter your admin credentials.
* **Default Credentials**:
  * **Username**: `admin123`
  * **Password**: `adminpass`
* Successful login redirects you to the [Admin Dashboard](lib/admin-dashboard.html).

---

## 📋 Features

### 👤 User Dashboard
* **Search Books**: Search books by Name, Author, or Genre instantly.
* **Borrow Books**: Click **Borrow** on any available book. This moves it to your **Borrowed Books** list and sets a due date.
* **Return Books**: Click **Return** to place a borrowed book back in the library catalog.
* **View History**: Look at the history of returned books under the **Returned Books** list.

### 👑 Admin Dashboard
* **Add Books**: Form to insert a new book (requires Name, Author, and comma-separated Genres).
* **Edit/Delete Books**: Modify existing catalog entries or delete them individually.
* **Delete All Books**: Clear the entire book catalog from `localStorage` at once to start adding fresh custom books without auto-reloading from CSV.
* **Load CSV Books**: Manually trigger loading a new random set of books from the CSV file.
* **Track Transactions**: Read-only tracking tables showing which users have borrowed and returned which books, along with their due and return dates.
