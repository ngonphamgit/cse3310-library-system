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
  const [removingBook, setRemovingBook] = useState<Book | null>(null); // book shown in the remove confirmation popup
  // "loading" on the server since localStorage only exists in the browser
  const access = useSyncExternalStore(subscribe, getAccess, () => "loading" as Access);

  const [dashboardView, setDashboardView] = useState<"inventory" | "checkouts" | "reservations" | "users">
  ("inventory");

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
  <h2>
  {dashboardView === "inventory"? "Book Inventory": dashboardView === "checkouts"
      ? "Active Checkouts"
      : dashboardView === "reservations"
      ? "All Reservations"
      : "Manage Users"}
</h2>

  <div className="flex flex-wrap gap-3">
<button
className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
 onClick={() => setDashboardView("inventory")}>
  View Inventory
</button>

<button 
className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
onClick={() => setDashboardView("checkouts")}>
  View Active Checkouts
</button>

<button 
className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
onClick={() => setDashboardView("reservations")}>
  View All Reservations
</button>

<button
className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
onClick={() => setDashboardView("users")}>
  Manage Users
</button>
        </div>
      </div>


          {notice && (
            <p role="status" className="text-sm text-green-600 dark:text-green-400">
              {notice}
            </p>
          )}



          
          {/*search bar*/}
          
          {dashboardView === "checkouts" ? (
  <ActiveCheckouts />
) : dashboardView === "reservations" ? (
  <AllReservations />
) : dashboardView === "users" ? (
  <ManageUsers />
) : (
  <>
  <div className="flex items-center justify-between gap-4">
    <Suspense>
      <BookSearch />
    </Suspense>

{dashboardView === "inventory" && (
  <button
  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
   onClick={() => setShowAddBook(true)}>
    Add Book
    
  </button>)}
  </div>
  

    <Suspense fallback={<p className="p-4 text-center">Loading books...</p>}>
      <Inventory
        key={inventoryVersion}
        onSelectBook={setSelectedBookId}/>
    </Suspense>
  </>
)}

      {/*book details popup (from clicking a title)*/}
      {selectedBookId !== null && (
        <BookDetails
          bookId={selectedBookId}
          onClose={() => setSelectedBookId(null)}
          onEdit={(book) => { // swap the details popup for the edit popup
            setSelectedBookId(null);
            setEditingBook(book);
          }}
          onRemove={(book) => { // swap the details popup for the remove confirmation
            setSelectedBookId(null);
            setRemovingBook(book);
          }}
        />
      )}

      {/*remove book confirmation popup*/}
      {removingBook && (
        <RemoveBookConfirm
          book={removingBook}
          onClose={() => setRemovingBook(null)}
          onRemoved={(book) => {
            setRemovingBook(null);
            setNotice(`Marked "${book.title}" (ID ${book.bookId}) as inactive.`);
            setInventoryVersion((version) => version + 1); // reload table so the status changes
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
       </section>
    </div>
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
function BookDetails({ bookId, onClose, onEdit, onRemove }: { bookId: number; onClose: () => void; onEdit: (book: Book) => void; onRemove: (book: Book) => void })
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
              {book.isActive ? "Active" : "Inactive (hidden from catalog search)"}
            </p>
            <div>
              <p className="font-semibold">Description</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-300">
                {book.description || "No description available."}
              </p>
            </div>
          </div>
        )}

        {book && (
          <div className="flex flex-col gap-3 sm:flex-row">
            {/*edit button*/}
            <button
              type="button"
              onClick={() => onEdit(book)}
              className="flex-1 rounded-lg bg-blue-700 px-4 py-3 font-medium text-white hover:bg-blue-800"
            >
              Edit Book
            </button>
            {/*remove button*/}
            {book.isActive && (
              <button
                type="button"
                onClick={() => onRemove(book)}
                className="flex-1 rounded-lg bg-red-600 px-4 py-3 font-medium text-white hover:bg-red-700"
              >
                Remove Book
              </button>
            )}
          </div>
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

          {/*active checkbox*/}
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <span>Active (inactive books are hidden from catalog search)</span>
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

// confirmation popup for removing a book, the book is marked inactive instead of deleted
function RemoveBookConfirm({ book, onClose, onRemoved }: { book: Book; onClose: () => void; onRemoved: (book: Book) => void })
{
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState(false);

  async function removeBook()
  {
    if (removing)
    {
      return;
    }

    setError("");
    setRemoving(true);

    try
    {
      const token = localStorage.getItem("token"); // get librarians login token

      const response = await fetch("http://localhost:8080/book/admin/removeBook", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId: book.bookId }),
      });

      if (!response.ok)
      { // check backend response is valid
        if (response.status === 401 || response.status === 403)
        {
          setError("You are not allowed to remove books. Try logging out and back in.");
        }
        else
        {
          setError(`Could not remove book (${response.status}). Please try again.`);
        }
        return;
      }

      const removed: Book = await response.json();
      onRemoved(removed);
    }
    catch (err)
    { // backend not running
      console.error("Remove book error:", err);
      setError("Could not connect to the server. Please try again.");
    }
    finally
    {
      setRemoving(false);
    }
  }



  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={() => {
        if (!removing) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="remove-book-title"
        className="w-full max-w-md space-y-5 rounded-xl bg-white p-6 text-zinc-900 shadow-xl dark:bg-zinc-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="remove-book-title" className="text-xl font-bold">
          Confirm Remove Book
        </h2>

        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Are you sure you want to remove &quot;{book.title}&quot;?
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          It will be marked Inactive and hidden from catalog search results. It stays in the inventory, and you can
          bring it back by editing it and checking Active.
        </p>

        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        {/*confirm and cancel buttons*/}
        <div className="flex gap-3">
          <button
            type="button"
            disabled={removing}
            onClick={removeBook}
            className="flex-1 rounded-lg bg-red-600 px-4 py-3 font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {removing ? "Removing..." : "Yes, Remove Book"}
          </button>
          <button
            type="button"
            disabled={removing}
            onClick={onClose}
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-3 font-medium hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

  type ActiveLoan = 
  {
  user: 
  {
    username: string;
  };
  book: 
  {
    title: string;
  };
  borrowDate: string;
  dueDate: string;
};

function ActiveCheckouts() //function to look for active checkouts
{
  const [loans, setLoans] = useState<ActiveLoan[]>([]); //state to hold loans
  const [loading, setLoading] = useState(true); //state for loading
  const [error, setError] = useState(""); //state for error status

  useEffect(() => {
    async function loadLoans() //load loan function
    {
      try 
      {
        const token = localStorage.getItem("token"); //get users login token

        if (!token) //if token is not found user is not logged in
        {
          throw new Error("You are not logged in.");
        }

        const response = await fetch( //fetch the active loans from the backend
          "http://localhost:8080/loan/all-active",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok)  //check backend response
          {
          throw new Error(
            `Could not load active checkouts (${response.status}).`
          );
        }

        const data: ActiveLoan[] = await response.json();
        setLoans(data);
      } 
      catch (err)  //catch any errors from backend
      {
        console.error("Error loading active checkouts:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Could not load active checkouts."
        );
      } 
      finally 
      {
        setLoading(false);
      }
    }
  loadLoans();
  }, []);

  if (loading)  //check if the data is loading
    {
    return (
      <p className="p-4 text-center">
        Loading active checkouts...
      </p>
    );
  }

  if (error)  //check if there was an error
    {
    return (
      <p role="alert" className="p-4 text-center text-red-600">
        {error}
      </p>
    );
  }

  if (loans.length === 0)  //check if there are any loans in the system
    {
    return (
      <p className="p-4 text-center text-zinc-500">
        There are currently no active checkouts.
      </p>
    );
  }
// create ui
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-100 dark:bg-zinc-800">
          {/* Table headers */}
          <tr>
            <th className="p-3">Borrower</th>
            <th className="p-3">Book Title</th>
            <th className="p-3">Borrow Date</th>
            <th className="p-3">Due Date</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>
      {/*  map loans and due date */}
        <tbody>
          {loans.map((loan) => {
            const overdue =
              new Date(loan.dueDate + "T00:00:00").getTime() <
              new Date().setHours(0, 0, 0, 0);


              {/* create table entries */}
            return (
              <tr
                key={`${loan.user.username}-${loan.book.title}-${loan.borrowDate}`}
                className="border-t border-zinc-200 dark:border-zinc-700"
              >
                <td className="p-3">{loan.user.username}</td>
                <td className="p-3">{loan.book.title}</td>
                <td className="p-3">{loan.borrowDate}</td>
                <td className="p-3">{loan.dueDate}</td>
                <td className="p-3">
                  <span
                    className={
                      overdue
                        ? "font-semibold text-red-500"
                        : "font-semibold text-green-600"
                    }>
                    {overdue ? "Overdue" : "Active"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

{/* display number of active checkouts */}
      <p className="border-t border-zinc-200 p-3 text-sm text-zinc-500 dark:border-zinc-700">
        Total active checkouts: {loans.length}
      </p>
    </div>
  );
}



type AllReservation = {
  reservationId: number;
  user: {
    username: string;
  };
  book: {
    title: string;
  };
  reservedAt: string;
  status: "ACTIVE" | "READY" | "FULFILLED" | "CANCELLED";
};

function AllReservations() // function to show every reservation
{
  //reservation states
  const [reservations, setReservations] = useState<AllReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { //load upon click
    async function loadReservations()
    {
      try
      {
        const token = localStorage.getItem("token");

        if (!token) //check if login token is valid
        {
          throw new Error("You are not logged in.");
        }

        const response = await fetch(
          "http://localhost:8080/reservation/all",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok)
        { //check backend response
          throw new Error(
            `Could not load reservations (${response.status}).`
          );
        }

        const data: AllReservation[] = await response.json();
        setReservations(data);
      }
      catch (err)
      {
        console.error("Error loading reservations:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Could not load reservations."
        );
      }
      finally
      {
        setLoading(false);
      }
    }

    loadReservations();
  }, []);

  if (loading)//make loading msg
  {
    return (
      <p className="p-4 text-center">
        Loading reservations...
      </p>
    );
  }

  if (error)
  {
    return (
      <p role="alert" className="p-4 text-center text-red-600">
        {error}
      </p>
    );
  }

  if (reservations.length === 0)
  { //check if there are any reservations
    return (
      <p className="p-4 text-center text-zinc-500">
        There are currently no reservations.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-100 dark:bg-zinc-800">
          <tr>
            <th className="p-3">Borrower</th>
            <th className="p-3">Book Title</th>
            <th className="p-3">Reservation Date</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>

        <tbody>
          {reservations.map((reservation) => (
            <tr
              key={reservation.reservationId}
              className="border-t border-zinc-200 dark:border-zinc-700"
            >
              <td className="p-3">{reservation.user.username}</td>
              <td className="p-3">{reservation.book.title}</td>
              <td className="p-3">
                {new Date(reservation.reservedAt).toLocaleString()}
              </td>
              <td className="p-3">
                <span
                  className={
                    reservation.status === "READY"
                      ? "font-semibold text-blue-600"
                      : reservation.status === "ACTIVE"
                        ? "font-semibold text-amber-600"
                        : reservation.status === "FULFILLED"
                          ? "font-semibold text-green-600"
                          : "font-semibold text-zinc-500"
                  }
                >
                  {reservation.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="border-t border-zinc-200 p-3 text-sm text-zinc-500 dark:border-zinc-700">
        Total reservations: {reservations.length}
      </p>
    </div>
  );
}


// user as it appears inside loan and reservation responses
type ListedUser = {
  id: number;
  username: string;
  email: string;
  role: "ROLE_STUDENT" | "ROLE_ADMIN";
  isBlocked: boolean;
};

function ManageUsers() // function to list users so librarians can block/unblock them
{
  const [users, setUsers] = useState<ListedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // error loading the list
  const [busyUserId, setBusyUserId] = useState<number | null>(null); // user whose block/unblock is running
  const [actionNotice, setActionNotice] = useState(""); // success message after block/unblock
  const [actionError, setActionError] = useState(""); // error message after block/unblock
  const [confirmingUser, setConfirmingUser] = useState<ListedUser | null>(null); // user shown in the block confirmation popup

  async function toggleBlock(user: ListedUser)
  { // block an active user or unblock a blocked user
    const action = user.isBlocked ? "unblock" : "block";
    setBusyUserId(user.id);
    setActionNotice("");
    setActionError("");

    try
    {
      const token = localStorage.getItem("token"); // get librarians login token

      if (!token)
      {
        throw new Error("You are not logged in.");
      }

      const response = await fetch(`http://localhost:8080/users/${action}/${user.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok)
      {
        throw new Error(`Could not ${action} "${user.username}" (${response.status}).`);
      }

      const updated: { userId: number; isBlocked: boolean } = await response.json();

      // update only this row so the table doesnt need to reload
      setUsers((current) =>
        current.map((u) => (u.id === updated.userId ? { ...u, isBlocked: updated.isBlocked } : u))
      );
      setActionNotice(`${updated.isBlocked ? "Blocked" : "Unblocked"} "${user.username}".`);
    }
    catch (err)
    {
      console.error(`Error trying to ${action} user:`, err);
      setActionError(err instanceof Error ? err.message : `Could not ${action} "${user.username}".`);
    }
    finally
    {
      setBusyUserId(null);
    }
  }

  useEffect(() => {
    // there is no endpoint that lists every user, so collect the users
    // found in active checkouts and reservations
    async function loadUsers()
    {
      try
      {
        const token = localStorage.getItem("token");

        if (!token) //check if login token is valid
        {
          throw new Error("You are not logged in.");
        }

        const headers = { Authorization: `Bearer ${token}` };
        const [loanResponse, reservationResponse] = await Promise.all([
          fetch("http://localhost:8080/loan/all-active", { headers }),
          fetch("http://localhost:8080/reservation/all", { headers }),
        ]);

        if (!loanResponse.ok || !reservationResponse.ok)
        { //check backend responses
          const status = !loanResponse.ok ? loanResponse.status : reservationResponse.status;
          throw new Error(`Could not load users (${status}).`);
        }

        const loans: { user: ListedUser }[] = await loanResponse.json();
        const reservations: { user: ListedUser }[] = await reservationResponse.json();

        // same user can show up many times, so keep one entry per user id
        const byId = new Map<number, ListedUser>();
        for (const item of [...loans, ...reservations])
        {
          byId.set(item.user.id, item.user);
        }

        setUsers([...byId.values()].sort((a, b) => a.username.localeCompare(b.username)));
      }
      catch (err)
      {
        console.error("Error loading users:", err);
        setError(err instanceof Error ? err.message : "Could not load users.");
      }
      finally
      {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  if (loading)
  {
    return <p className="p-4 text-center">Loading users...</p>;
  }

  if (error)
  {
    return (
      <p role="alert" className="p-4 text-center text-red-600">
        {error}
      </p>
    );
  }

  if (users.length === 0)
  {
    return (
      <p className="p-4 text-center text-zinc-500">
        No users found in active checkouts or reservations.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-zinc-500">
        Showing users with active checkouts or reservations.
      </p>

      {actionNotice && (
        <p role="status" className="text-sm text-green-600 dark:text-green-400">
          {actionNotice}
        </p>
      )}

      {actionError && (
        <p role="alert" className="text-sm text-red-600">
          {actionError}
        </p>
      )}

      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-100 dark:bg-zinc-800">
            <tr>
              <th className="p-3">Username</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-t border-zinc-200 dark:border-zinc-700"
              >
                <td className="p-3">{user.username}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.role === "ROLE_ADMIN" ? "Librarian" : "Student"}</td>
                <td className="p-3">
                  <span
                    className={
                      user.isBlocked
                        ? "font-semibold text-red-500"
                        : "font-semibold text-green-600"
                    }
                  >
                    {user.isBlocked ? "Blocked" : "Active"}
                  </span>
                </td>
                <td className="p-3">
                  {/*librarians cant block themselves or other librarians*/}
                  {user.role !== "ROLE_ADMIN" && (
                    <button
                      type="button"
                      // blocking asks for confirmation first, unblocking happens right away
                      onClick={() => (user.isBlocked ? toggleBlock(user) : setConfirmingUser(user))}
                      disabled={busyUserId === user.id}
                      className={`rounded-lg px-3 py-1 text-sm font-medium text-white disabled:opacity-50 ${
                        user.isBlocked
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {busyUserId === user.id
                        ? user.isBlocked ? "Unblocking..." : "Blocking..."
                        : user.isBlocked ? "Unblock" : "Block"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="border-t border-zinc-200 p-3 text-sm text-zinc-500 dark:border-zinc-700">
          Total users: {users.length}
        </p>
      </div>

      {/*block user confirmation popup*/}
      {confirmingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => {
            if (busyUserId === null) setConfirmingUser(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="block-user-title"
            className="w-full max-w-md space-y-5 rounded-xl bg-white p-6 text-zinc-900 shadow-xl dark:bg-zinc-900 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="block-user-title" className="text-xl font-bold">
              Confirm Block User
            </h2>

            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Are you sure you want to block &quot;{confirmingUser.username}&quot;?
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              They will not be able to check out books until they are unblocked. They can still log in and see
              their current checkouts.
            </p>

            {/*confirm and cancel buttons*/}
            <div className="flex gap-3">
              <button
                type="button"
                disabled={busyUserId !== null}
                onClick={async () => {
                  await toggleBlock(confirmingUser);
                  setConfirmingUser(null); // success or error message shows above the table
                }}
                className="flex-1 rounded-lg bg-red-600 px-4 py-3 font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {busyUserId !== null ? "Blocking..." : "Yes, Block User"}
              </button>
              <button
                type="button"
                disabled={busyUserId !== null}
                onClick={() => setConfirmingUser(null)}
                className="flex-1 rounded-lg border border-zinc-300 px-4 py-3 font-medium hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
