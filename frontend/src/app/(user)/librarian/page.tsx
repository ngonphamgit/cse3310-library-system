"use client";

import { Suspense, useEffect, useState, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { InventoryTable } from "@/components/librarian/InventoryTable";
import { BookPagination } from "@/components/books/BookPagination";
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
          <Suspense fallback={<p className="p-4 text-center">Loading books...</p>}>
            <Inventory />
          </Suspense>
        </section>
      </div>
    </main>
  );
}

type InventoryResult =
  | { page: number; data: Page<Book> }
  | { page: number; error: string };

// loads one page of every book (active and inactive) for the inventory table
function Inventory()
{
  const searchParams = useSearchParams();
  const page = Math.max(1, Math.floor(Number(searchParams.get("page"))) || 1); // page number from the url
  const [result, setResult] = useState<InventoryResult | null>(null);

  useEffect(() => {
    let cancelled = false; // ignore old responses if the page changes before they arrive

    // sort by id so rows stay in the same order between pages and after edits
    const params = new URLSearchParams({ page: String(page - 1), size: "20", sort: "bookId" });

    fetch(`http://localhost:8080/book?${params}`)
      .then((response) => {
        if (!response.ok)
        { //check backend response is valid
          throw new Error(`Could not load books (${response.status}).`);
        }
        return response.json();
      })
      .then((data: Page<Book>) => {
        if (!cancelled) setResult({ page, data });
      })
      .catch((err) => { //backend not running or bad response
        console.error("Error loading books:", err);
        if (!cancelled) setResult({ page, error: "Could not load books. Check that the backend is running." });
      });

    return () => {
      cancelled = true;
    };
  }, [page]);

  //still loading this page
  if (!result || result.page !== page)
  {
    return <p className="p-4 text-center">Loading books...</p>;
  }

  if ("error" in result)
  {
    return <p role="alert" className="text-red-600 dark:text-red-400">{result.error}</p>;
  }

  return (
    <>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {result.data.totalElements} books in inventory
      </p>
      <InventoryTable books={result.data.content} />
      <div className="p-4">
        <BookPagination page={page} totalPages={result.data.totalPages} />
      </div>
    </>
  );
}
