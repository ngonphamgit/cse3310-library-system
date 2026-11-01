"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Loan 
{ //interface for showing currently loaned books
  book: {
    bookId: number;
    title: string;
    author: string;
    isbn: string;
  };
  borrowDate: string;
  dueDate: string;
}


export default function Dashboard() 
{
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

//states for book return
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [returnMessage, setReturnMessage] = useState("");
  const [returning, setReturning] = useState(false);

  useEffect(() => {
    async function fetchLoans() {
      try 
      {
        const token = localStorage.getItem("token"); //get users login token

        if (!token) 
        { //if token invalid then user isnt logged in
          setError("Please log in to view your borrowed books.");
          return;
        }

        const response = await fetch("http://localhost:8080/loan/my-loans",
          { //fetch users loans
            headers: 
            {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) 
        { //check if backend response is valid
          setError("Could not load your borrowed books.");
          return;
        }

        const data: Loan[] = await response.json();  //get loan data
        setLoans(data);
      } 
      catch (err) //catch backend error and display it to user
      {
        console.error("Error loading loans:", err);
        setError("Could not connect to the server. Please try again.");
      } 
      finally
      { //done loading
        setLoading(false);
      }
    }

    fetchLoans();
  }, []);


  async function returnBook()
  {
    if (!selectedLoan || returning) //check if book returning is valid
        {
        return;
        } 

    setReturning(true);
    setReturnMessage("Returning book...");

    try
    {
      const token = localStorage.getItem("token"); //get user token

      if (!token) //check if user is valid
      {
        setReturnMessage("Please log in before returning a book.");
        return;
      }

      const response = await fetch("http://localhost:8080/loan/return", { //get backend return endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({bookId: selectedLoan.book.bookId,}),
      });

      if (!response.ok) //check if backend response is valid
      {
        setReturnMessage(`Return failed (${response.status}). Please try again.`);
        return;
      }

      // Remove the returned book from the dashboard
      setLoans((currentLoans) => currentLoans.filter((loan) => loan !== selectedLoan)
      );

      setSelectedLoan(null);
      setReturnMessage("");
    }
    catch (err)
    {
      console.error("Return error:", err);
      setReturnMessage("Could not connect to the server. Please try again.");
    }
    finally
    {
      setReturning(false);
    }
  }



  //ui
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-900 dark:bg-black dark:text-white">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">My Borrowed Books</h1>
        {/*button to return to catalog*/}
          <Link
            href="/catalog"
            className="shrink-0 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Back to Catalog
          </Link>
        </header>

          {/*book loading msg and no books msg*/}
        {loading ? (<p className="text-zinc-500">Loading borrowed books...</p>) 
        : error ? (<p role="alert" className="text-red-600 dark:text-red-400">
        {error}
          </p>) 
          : loans.length === 0 ? 
          (<div className="rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <p className="font-medium">
              You have no borrowed books.
            </p>

          </div>
        ) : (
            
          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800">
                <tr>
                  <th className="p-4">Title</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Borrow Date</th>
                  <th className="p-4">Due Date</th>
                </tr>
              </thead>
              <tbody>
                  {/*map users loans to dashboard table*/}
                {loans.map((loan, index) => (
                  <tr
                    key={`${loan.book.bookId}-${loan.borrowDate}-${index}`}
                    className="border-b border-zinc-200 last:border-0 dark:border-zinc-800">
                    <td className="p-4 font-medium">
                      {loan.book.title}
                    </td>
                    <td className="p-4">{loan.book.author}</td>
                    <td className="p-4">{loan.borrowDate}</td>
                    <td className="p-4">{loan.dueDate}</td>


                    {/*return book button*/}
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLoan(loan);
                          setReturnMessage("");
                        }}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                        Return Book
                      </button>
                    </td>
                  </tr>))}

              </tbody>
            </table>
          </div>
        )}

    <div className="flex justify-center pt-4">
    <button

    onClick={() => { //remove users token and redirect to the login page
      localStorage.removeItem("token");

      window.location.href = "/login";
    }}
    className="rounded-lg bg-red-600 px-6 py-2 text-sm font-medium text-white hover:bg-red-700"
  > Log Out
  </button>
</div>
      </div>

  {/*return book confirmation screen*/}
    {selectedLoan && (
    <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        onClick={() => {
        if (!returning)
        {
        setSelectedLoan(null);
        } 
        }
    }>
          {/*confirmation screen text*/}
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md space-y-5 rounded-xl bg-white p-6 text-zinc-900 shadow-xl dark:bg-zinc-900 dark:text-white"
            onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold">
              Confirm Book Return
            </h2>

            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Are you sure you want to return "{selectedLoan.book.title}"?
            </p>

            {returnMessage && (
              <p role="status" className="text-sm text-blue-600 dark:text-blue-400">
                {returnMessage}
              </p>)}
            {/*return book confirmation button*/}
            <div className="flex gap-3">
              <button
                type="button"
                disabled={returning}
                onClick={returnBook}
                className="flex-1 rounded-lg bg-red-600 px-4 py-3 font-medium text-white hover:bg-red-700 disabled:opacity-50">
                {returning ? "Returning..." : "Yes, Return Book"}
              </button>
                {/*cancel return button*/}
              <button
                type="button"
                disabled={returning}
                onClick={() => setSelectedLoan(null)}
                className="flex-1 rounded-lg border border-zinc-300 px-4 py-3 font-medium hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800 disabled:opacity-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}