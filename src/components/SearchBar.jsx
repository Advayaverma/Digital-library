import React from 'react';

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search Books by Name, Author, or Genre',
}) {
  return (
    <input
      className="form-control mb-4"
      id="searchTxt"
      type="search"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
