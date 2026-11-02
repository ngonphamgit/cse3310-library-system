"use client";

import { Suspense, useEffect, useState, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { InventoryTable } from "@/components/librarian/InventoryTable";
import { BookPagination } from "@/components/books/BookPagination";
import { BookSearch } from "@/components/books/BookSearch";
import type { SearchBy } from "@/lib/api/books";
import type { Book } from "@/types/book";
import type { Page } from "@/types/page";

type Access = "loading" | "loggedOut" | "notLibrarian" | "librarian";

// localStorage doesnt change while this page is open, so there is nothing to subscribe to
function subscribe()
{
  return () => {};
}

// checks the token and role saved at login
function getAccess(): Access
{
  if (!localStorage.getItem("token"))
  {
    return "loggedOut";
  }
  return localStorage.getItem("role") === "ROLE_ADMIN" ? "librarian" : "notLibrarian";
}

export default function LibrarianDashboard()
{
  const router = useRouter();
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null); // book shown in the details popup
  // "loading" on the server since localStorage only exists in the browser
  const access = useSyncExternalStore(subscribe, getAccess, () => "loading" as Access);

  useEffect(() => {
    if (access === "loggedOut")
    { // not logged in, send to login page
      router.replace("/login");
    }
    else if (access === "notLibrarian")
    { // logged in but not a librarian, send to catalog
      router.replace("/catalog");
    }
  }, [access, router]);

  function logout()
  { // remove users token and role and redirect to the login page
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.replace("/login");
  }

  // dont show anything until user is confirmed to be a librarian
  if (access !== "librarian")
  {
    return null;
  }

  // ui
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-900 dark:bg-black dark:text-white">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Librarian Dashboard</h1>
          {/*log out button*/}
          <button
            type="button"
            onClick={logout}
            className="shrink-0 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Log Out
          </button>
        </header>

        {/*book inventory section*/}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Book Inventory</h2>
          {/*search bar*/}
          <Suspense>
            <BookSearch />
          </Suspense>
          <Suspense fallback={<p className="p-4 text-center">Loading books...</p>}>
            <Inventory onSelectBook={setSelectedBookId} />
          </Suspense>
        </section>
      </div>

      {/*book details popup (from clicking a title)*/}
      {selectedBookId !== null && (
        <BookDetails bookId={selectedBookId} onClose={() => setSelectedBookId(null)} />
      )}
    </main>
  );
}

const SEARCH_TYPES: SearchBy[] = ["title", "author", "category", "isbn"];

type InventoryResult =
  | { url: string; data: Page<Book> }
  | { url: string; error: string };

// loads one page of books for the inventory table
// no search: every book (active and inactive), search: only matching active books
function Inventory({ onSelectBook }: { onSelectBook: (bookId: number) => void })
{
  const searchParams = useSearchParams();
  const page = Math.max(1, Math.floor(Number(searchParams.get("page"))) || 1); // page number from the url
  const query = searchParams.get("query") ?? ""; // search text from the url
  const byParam = searchParams.get("by");
  const by: SearchBy = SEARCH_TYPES.includes(byParam as SearchBy) ? (byParam as SearchBy) : "title"; // search type, defaults to title

  const params = new URLSearchParams({ page: String(page - 1), size: "20" });
  let url: string;
  if (query)
  { // search results come back ranked by best match
    params.set("query", query);
    url = `http://localhost:8080/book/search/${by}?${params}`;
  }
  else
  { // sort by id so rows stay in the same order between pages and after edits
    params.set("sort", "bookId");
    url = `http://localhost:8080/book?${params}`;
  }

  const [result, setResult] = useState<InventoryResult | null>(null);

  useEffect(() => {
    let cancelled = false; // ignore old responses if the search or page changes before they arrive

    fetch(url)
      .then((response) => {
        if (!response.ok)
        { // check backend response is valid
          throw new Error(`Could not load books (${response.status}).`);
        }
        return response.json();
      })
      .then((data: Page<Book>) => {
        if (!cancelled) setResult({ url, data });
      })
      .catch((err) => { // backend not running or bad response
        console.error("Error loading books:", err);
        if (!cancelled) setResult({ url, error: "Could not load books. Check that the backend is running." });
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  // still loading this page or search
  if (!result || result.url !== url)
  {
    return <p className="p-4 text-center">Loading books...</p>;
  }

  if ("error" in result)
  {
    return <p role="alert" className="text-red-600 dark:text-red-400">{result.error}</p>;
  }

  // search found nothing
  if (query && result.data.content.length === 0)
  {
    return (
      <p className="p-4 text-center text-zinc-500 dark:text-zinc-400">
        No active books match &quot;{query}&quot;. Removed (inactive) books only show up when not searching.
      </p>
    );
  }

  return (
    <>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {query
          ? `Results for "${query}" by ${by} (active books only)`
          : `${result.data.totalElements} books in inventory`}
      </p>
      <InventoryTable books={result.data.content} onSelectBook={onSelectBook} />
      <div className="p-4">
        <BookPagination page={page} totalPages={result.data.totalPages} />
      </div>
    </>
  );
}

type DetailsResult =
  | { bookId: number; book: Book }
  | { bookId: number; error: string };

// popup that loads the latest info for one book from the backend
function BookDetails({ bookId, onClose }: { bookId: number; onClose: () => void })
{
  const [result, setResult] = useState<DetailsResult | null>(null);

  useEffect(() => {
    let cancelled = false; // ignore old responses if another book is opened before they arrive

    fetch(`http://localhost:8080/book/${bookId}`)
      .then((response) => {
        if (!response.ok)
        { // check backend response is valid
          throw new Error(`Could not load book ${bookId} (${response.status}).`);
        }
        return response.json();
      })
      .then((book: Book) => {
        if (!cancelled) setResult({ bookId, book });
      })
      .catch((err) => { // backend not running or book doesnt exist
        console.error("Error loading book:", err);
        if (!cancelled) setResult({ bookId, error: "Could not load this book. Please try again." });
      });

    return () => {
      cancelled = true;
    };
  }, [bookId]);

  const loaded = result !== null && result.bookId === bookId ? result : null;
  const book = loaded && "book" in loaded ? loaded.book : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-details-title"
        className="w-full max-w-lg space-y-5 rounded-xl bg-white p-6 text-zinc-900 shadow-xl dark:bg-zinc-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/*title, author, and close button*/}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="book-details-title" className="text-2xl font-bold">
              {book ? book.title : "Book Details"}
            </h2>
            {book && (
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                by {book.author}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close book details"
            className="rounded-lg px-3 py-1 text-xl hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            &times;
          </button>
        </div>

        {!loaded ? (
          <p className="text-zinc-500">Loading book...</p>
        ) : !book ? (
          <p role="alert" className="text-red-600 dark:text-red-400">
            {"error" in loaded ? loaded.error : ""}
          </p>
        ) : (
          // all of the book's info
          <div className="space-y-3 border-y border-zinc-200 py-4 dark:border-zinc-700">
            <p>
              <span className="font-semibold">Book ID:</span>{" "}
              {book.bookId}
            </p>
            <p>
              <span className="font-semibold">ISBN:</span>{" "}
              {book.isbn}
            </p>
            <p>
              <span className="font-semibold">Category:</span>{" "}
              {book.category}
            </p>
            <p>
              <span className="font-semibold">Quantity:</span>{" "}
              {book.quantity}
            </p>
            <p>
              <span className="font-semibold">Status:</span>{" "}
              {book.isActive ? "Active" : "Inactive (removed from catalog)"}
            </p>
            <div>
              <p className="font-semibold">Description</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-300">
                {book.description || "No description available."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
