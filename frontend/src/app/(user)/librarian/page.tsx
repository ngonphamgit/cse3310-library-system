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
  const [showAddBook, setShowAddBook] = useState(false); // add book popup open or closed
  const [inventoryVersion, setInventoryVersion] = useState(0); // bump to reload the inventory table
  const [notice, setNotice] = useState(""); // success message shown above the inventory
  const [editingBook, setEditingBook] = useState<Book | null>(null); // book shown in the edit popup
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
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Book Inventory</h2>
            {/*add book button (opens add book popup)*/}
            <button
              type="button"
              onClick={() => {
                setShowAddBook(true);
                setNotice("");
              }}
              className="shrink-0 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
            >
              Add Book
            </button>
          </div>
          {notice && (
            <p role="status" className="text-sm text-green-600 dark:text-green-400">
              {notice}
            </p>
          )}
          {/*search bar*/}
          <Suspense>
            <BookSearch />
          </Suspense>
          <Suspense fallback={<p className="p-4 text-center">Loading books...</p>}>
            <Inventory key={inventoryVersion} onSelectBook={setSelectedBookId} />
          </Suspense>
        </section>
      </div>

      {/*book details popup (from clicking a title)*/}
      {selectedBookId !== null && (
        <BookDetails
          bookId={selectedBookId}
          onClose={() => setSelectedBookId(null)}
          onEdit={(book) => { // swap the details popup for the edit popup
            setSelectedBookId(null);
            setEditingBook(book);
          }}
        />
      )}

      {/*edit book popup*/}
      {editingBook && (
        <EditBookForm
          book={editingBook}
          onClose={() => setEditingBook(null)}
          onSaved={(book) => {
            setEditingBook(null);
            setNotice(`Saved changes to "${book.title}" (ID ${book.bookId}).`);
            setInventoryVersion((version) => version + 1); // reload table so the changes show up
          }}
        />
      )}

      {/*add book popup*/}
      {showAddBook && (
        <AddBookForm
          onClose={() => setShowAddBook(false)}
          onAdded={(book) => {
            setShowAddBook(false);
            setNotice(`Added "${book.title}" (ID ${book.bookId}).`);
            setInventoryVersion((version) => version + 1); // reload table so the new book shows up
          }}
        />
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
function BookDetails({ bookId, onClose, onEdit }: { bookId: number; onClose: () => void; onEdit: (book: Book) => void })
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

        {/*edit button (opens edit popup with this books info filled in)*/}
        {book && (
          <button
            type="button"
            onClick={() => onEdit(book)}
            className="w-full rounded-lg bg-blue-700 px-4 py-3 font-medium text-white hover:bg-blue-800"
          >
            Edit Book
          </button>
        )}
      </div>
    </div>
  );
}

const EMPTY_BOOK_FORM = { isbn: "", title: "", author: "", category: "", quantity: "1", description: "" };

// popup form for adding a new book to the catalog
function AddBookForm({ onClose, onAdded }: { onClose: () => void; onAdded: (book: Book) => void })
{
  const [form, setForm] = useState(EMPTY_BOOK_FORM);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // updates one field of the form
  function updateField(field: keyof typeof EMPTY_BOOK_FORM, value: string)
  {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function addBook(e: React.SyntheticEvent<HTMLFormElement>)
  {
    e.preventDefault();
    if (saving)
    {
      return;
    }

    // every field is required by the backend
    const book = {
      isbn: form.isbn.trim(),
      title: form.title.trim(),
      author: form.author.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      quantity: Number(form.quantity),
    };

    if (!book.isbn || !book.title || !book.author || !book.category || !book.description)
    {
      setError("Please fill in every field.");
      return;
    }

    if (!/^[0-9-]+X?$/i.test(book.isbn))
    { // isbns are digits and dashes (isbn-10 can end in X)
      setError("ISBN can only contain numbers and dashes.");
      return;
    }

    if (!Number.isInteger(book.quantity) || book.quantity < 0)
    {
      setError("Quantity must be a whole number of 0 or more.");
      return;
    }

    setError("");
    setSaving(true);

    try
    {
      const token = localStorage.getItem("token"); // get librarians login token

      const response = await fetch("http://localhost:8080/book/admin/addBook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(book),
      });

      if (!response.ok)
      { // check backend response is valid
        if (response.status === 401 || response.status === 403)
        {
          setError("You are not allowed to add books. Try logging out and back in.");
        }
        else
        { // backend rejects duplicate isbns and titles
          setError(`Could not add book (${response.status}). A book with this ISBN or title may already exist.`);
        }
        return;
      }

      const added: Book = await response.json();
      onAdded(added);
    }
    catch (err)
    { // backend not running
      console.error("Add book error:", err);
      setError("Could not connect to the server. Please try again.");
    }
    finally
    {
      setSaving(false);
    }
  }

  const inputClass = "w-full rounded-lg border border-zinc-300 bg-transparent p-2 dark:border-zinc-600";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={() => {
        if (!saving) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-book-title"
        className="max-h-full w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 text-zinc-900 shadow-xl dark:bg-zinc-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={addBook} className="space-y-4">
          <h2 id="add-book-title" className="text-2xl font-bold">Add Book</h2>

          {/*book info fields*/}
          <label className="block space-y-1 text-sm font-medium">
            <span>ISBN</span>
            <input className={inputClass} value={form.isbn} onChange={(e) => updateField("isbn", e.target.value)} />
          </label>
          <label className="block space-y-1 text-sm font-medium">
            <span>Title</span>
            <input className={inputClass} value={form.title} onChange={(e) => updateField("title", e.target.value)} />
          </label>
          <label className="block space-y-1 text-sm font-medium">
            <span>Author</span>
            <input className={inputClass} value={form.author} onChange={(e) => updateField("author", e.target.value)} />
          </label>
          <div className="flex gap-3">
            <label className="block flex-1 space-y-1 text-sm font-medium">
              <span>Category</span>
              <input className={inputClass} value={form.category} onChange={(e) => updateField("category", e.target.value)} />
            </label>
            <label className="block w-28 space-y-1 text-sm font-medium">
              <span>Quantity</span>
              <input
                type="number"
                min={0}
                step={1}
                className={inputClass}
                value={form.quantity}
                onChange={(e) => updateField("quantity", e.target.value)}
              />
            </label>
          </div>
          <label className="block space-y-1 text-sm font-medium">
            <span>Description</span>
            <textarea
              rows={4}
              className={inputClass}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </label>

          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          {/*save and cancel buttons*/}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-blue-700 px-4 py-3 font-medium text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {saving ? "Adding..." : "Add Book"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="flex-1 rounded-lg border border-zinc-300 px-4 py-3 font-medium hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// popup form for editing an existing book, starts filled in with the books current info
function EditBookForm({ book, onClose, onSaved }: { book: Book; onClose: () => void; onSaved: (book: Book) => void })
{
  const [form, setForm] = useState({
    title: book.title,
    author: book.author,
    category: book.category,
    quantity: String(book.quantity),
    description: book.description,
  });
  const [isActive, setIsActive] = useState(book.isActive);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // updates one field of the form
  function updateField(field: keyof typeof form, value: string)
  {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function saveBook(e: React.SyntheticEvent<HTMLFormElement>)
  {
    e.preventDefault();
    if (saving)
    {
      return;
    }

    // every field is required by the backend
    const updated = {
      bookId: book.bookId,
      title: form.title.trim(),
      author: form.author.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      quantity: Number(form.quantity),
      isActive,
    };

    if (!updated.title || !updated.author || !updated.category || !updated.description)
    {
      setError("Please fill in every field.");
      return;
    }

    if (!Number.isInteger(updated.quantity) || updated.quantity < 0)
    {
      setError("Quantity must be a whole number of 0 or more.");
      return;
    }

    setError("");
    setSaving(true);

    try
    {
      const token = localStorage.getItem("token"); // get librarians login token

      // backend overwrites every field, so the whole book is sent
      const response = await fetch("http://localhost:8080/book/admin/updateBook", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });

      if (!response.ok)
      { // check backend response is valid
        if (response.status === 401 || response.status === 403)
        {
          setError("You are not allowed to edit books. Try logging out and back in.");
        }
        else
        { // backend rejects duplicate titles
          setError(`Could not save changes (${response.status}). Another book may already have this title.`);
        }
        return;
      }

      const saved: Book = await response.json();
      onSaved(saved);
    }
    catch (err)
    { // backend not running
      console.error("Edit book error:", err);
      setError("Could not connect to the server. Please try again.");
    }
    finally
    {
      setSaving(false);
    }
  }

  const inputClass = "w-full rounded-lg border border-zinc-300 bg-transparent p-2 dark:border-zinc-600";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={() => {
        if (!saving) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-book-title"
        className="max-h-full w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 text-zinc-900 shadow-xl dark:bg-zinc-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={saveBook} className="space-y-4">
          <h2 id="edit-book-title" className="text-2xl font-bold">Edit Book</h2>

          {/*isbn cant be changed, so it is shown but not editable*/}
          <label className="block space-y-1 text-sm font-medium">
            <span>ISBN (cannot be changed)</span>
            <input className={`${inputClass} opacity-60`} value={book.isbn} disabled />
          </label>

          {/*book info fields*/}
          <label className="block space-y-1 text-sm font-medium">
            <span>Title</span>
            <input className={inputClass} value={form.title} onChange={(e) => updateField("title", e.target.value)} />
          </label>
          <label className="block space-y-1 text-sm font-medium">
            <span>Author</span>
            <input className={inputClass} value={form.author} onChange={(e) => updateField("author", e.target.value)} />
          </label>
          <div className="flex gap-3">
            <label className="block flex-1 space-y-1 text-sm font-medium">
              <span>Category</span>
              <input className={inputClass} value={form.category} onChange={(e) => updateField("category", e.target.value)} />
            </label>
            <label className="block w-28 space-y-1 text-sm font-medium">
              <span>Quantity</span>
              <input
                type="number"
                min={0}
                step={1}
                className={inputClass}
                value={form.quantity}
                onChange={(e) => updateField("quantity", e.target.value)}
              />
            </label>
          </div>
          <label className="block space-y-1 text-sm font-medium">
            <span>Description</span>
            <textarea
              rows={4}
              className={inputClass}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </label>

          {/*active checkbox (unchecked hides the book from the student catalog)*/}
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <span>Active (shown in the student catalog)</span>
          </label>

          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          {/*save and cancel buttons*/}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-blue-700 px-4 py-3 font-medium text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="flex-1 rounded-lg border border-zinc-300 px-4 py-3 font-medium hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
