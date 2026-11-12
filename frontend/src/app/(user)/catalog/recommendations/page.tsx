"use client";

import { useEffect, useState } from "react";
import { BookTable } from "@/components/books/BookTable";
import Link from "next/link";
import type { Book } from "@/types/book";

export default function Recommendations() 
{
    //states for books
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  //load upon page load
  useEffect(() => {
    async function getRecommendations() {
      try {
        const token = localStorage.getItem("token"); //get users login token

        if (!token) //check if users token is valid
        {
          setError("Please log in to view recommendations.");
          return;
        }

        const response = await fetch( //fetch backend endpoint for recommendations
          "http://localhost:8080/loan/recommendations",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok)  //check if backend response is valid
        {
          throw new Error("Failed to load recommendations.");
        }

        const data = await response.json();
        setBooks(data);
      } 
      catch (err) 
      { //handle errors
        setError("Could not load recommendations.");
      } 
      finally 
      { //set loading state to false
        setLoading(false);
      }
    }

    getRecommendations();
  }, []);

  {/* ui */}
  return (
    
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between p-4">
        <h1 className="text-2xl font-bold">
          Recommended Books
        </h1>

        {/* back to catalog button */} 
          <div className="flex gap-3">
             <Link href="/catalog"className=
             "rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Back to Catalog
                 </Link>
                </div>

          {/* user dashboard button */}
        <Link
          href="/userdashboard"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          My Dashboard
        </Link>
      </div>

      {/* loading state */}
      {loading ? (
        <p className="p-4 text-center">Loading recommendations...</p>
      ) : error ? (
        <p className="p-4 text-center text-red-500">{error}</p>
      ) : books.length === 0 ? (
        <p className="p-4 text-center">
          No recommendations available yet.
        </p>
      ) : (
        <BookTable books={books} />
      )}
    </div>
  );
}