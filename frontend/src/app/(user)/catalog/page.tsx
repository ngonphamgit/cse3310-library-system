"use client";

import { useEffect, useState } from "react";
import { BookTable } from "@/components/books/BookTable";
import type { Book } from "@/types/book";



export default function catalog() {
   const [books, setBooks] = useState<Book[]>([]);
    useEffect(() => {
    fetch("http://localhost:8080/book?page=0&size=50000")
      .then((res) => res.json())
      .then((data) => setBooks(data.content))
      .catch((err) => console.error("Failed to load books:", err));
  }, []);
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <BookTable books={books} />
    </div>
  )
}