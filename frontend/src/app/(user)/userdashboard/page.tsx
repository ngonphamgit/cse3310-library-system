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

interface Reservation 
{
    reservationId: number;
    book: 
    {
        bookId: number;
        title: string;
        author: string;
        isbn: string;
    };
    reservedAt: string;
    status: "ACTIVE" | "READY" | "FULFILLED" | "CANCELLED";
}





export default function Dashboard() 
{
  //states for book loans
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

//states for book return
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [returnMessage, setReturnMessage] = useState("");
  const [returning, setReturning] = useState(false);


  //states for book reservation
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservationError, setReservationError] = useState("");
  const [reservationMessage, setReservationMessage] = useState("");
  const [processingReservationId, setProcessingReservationId] = useState<number | null>(null);
  const [reservationLoading, setReservationLoading] = useState(true);
   const [selectedReservationCancel, setSelectedReservationCancel] = useState<Reservation | null>(null);



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
      setLoans((currentLoans) => currentLoans.filter((loan) => loan !== selectedLoan));

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




useEffect(() => {
  async function fetchReservations(token: string)  //fetch reservations
  {
    try 
    {
      const response = await fetch( //get reservations from backend
        "http://localhost:8080/reservation/my-reservations",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) //check if backend response is valid
      {
        throw new Error("Could not load your reservations.");
      }

      const data: Reservation[] = await response.json();

      setReservations(data);
    } 
    catch (err) //catch error
    {
      console.error("Error loading reservations:", err);
      setReservationError("Could not load your reservations.");
    }
    finally 
    {
  setReservationLoading(false);
    }
  }

const token = localStorage.getItem("token");

  if (!token) //check if token is vlaid
    {
    setReservationError("Please log in to view your reservations.");
    setReservationLoading(false);
    return;
  }
  fetchReservations(token);
}, []);

const activeReservations = reservations.filter((reservation) => 
    reservation.status === "ACTIVE" ||
    reservation.status === "READY"
  );


  // Cancel an active reservation
  async function cancelReservation(reservation: Reservation) 
  {
    setSelectedReservationCancel(null);
    if (processingReservationId !== null) //check if reservation is valid
    {
      return;
    }

    setProcessingReservationId(reservation.reservationId);
    setReservationMessage("Cancelling reservation..."); //processing message

    try 
    {
      const token = localStorage.getItem("token"); //get user token

      if (!token)  //check if token is valid
        {
        setReservationMessage("Please log in before cancelling a reservation.");
        return;
      }

      const response = await fetch( //get backend cancel reservation endpoint
        "http://localhost:8080/reservation/cancel",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            bookId: reservation.book.bookId,
          }),
        });

      if (!response.ok) //check backend response
        {
        setReservationMessage(
          `Cancellation failed (${response.status}). Please try again.`
        );
        return;
      }

          // Remove the reserved book from the dashboard
      setReservations((currentReservations) => currentReservations.filter(
    (res) => res.reservationId !== reservation.reservationId));

      //reservation success msg
      setReservationMessage(`Successfully cancelled "${reservation.book.title}".`);
    } 
    catch (err)  //catch error
    {
      console.error("Cancellation error:", err);
      setReservationMessage("Could not connect to the server.");
    } 
    finally 
    {
      setProcessingReservationId(null);
      setSelectedReservationCancel(null);
    }
  }

// Fulfill a ready reservation
  async function fulfillReservation(reservation: Reservation) 
  {
    if (processingReservationId !== null) //check if reservation is valid
    {
      return;
    }

    setProcessingReservationId(reservation.reservationId);
    setReservationMessage("Fulfilling reservation...");

    try 
    {
      const token = localStorage.getItem("token"); //get user token

      if (!token) //check if token is valid
        {
        setReservationMessage("Please log in before fulfilling a reservation.");
        return;
      }

      const response = await fetch("http://localhost:8080/reservation/fulfill", //get backend fulfill endpoint
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            bookId: reservation.book.bookId,
          }),
        }
      );

      if (!response.ok) //check if backend response is valid
        {
        const errorText = await response.text();

        setReservationMessage(errorText || `Fulfillment failed (${response.status}).` );
        return;
      }

      //add to loans and remove from reservations


    // Refresh the frontend tables to reflect new checkout
    //get all loans
const loanResponse = await fetch("http://localhost:8080/loan/my-loans",
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

if (!loanResponse.ok) //check if backend response is valid
{
  throw new Error("Could not refresh borrowed books.");
}

const updatedLoans: Loan[] = await loanResponse.json();
setLoans(updatedLoans);

// Refresh reservations to account for removal of fulfilled reservation
const reservationResponse = await fetch(
  "http://localhost:8080/reservation/my-reservations",
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

if (!reservationResponse.ok) //check if backend response is vlaid
{
  throw new Error("Could not refresh reservations.");
}

const updatedReservations: Reservation[] = await reservationResponse.json();

setReservations(updatedReservations);




    //checkout fulfillment success msg
    setReservationMessage(`Successfully checked out "${reservation.book.title}"!`);
    } 
    catch (err) //catch error
    {
      console.error("Fulfillment error:", err);
      setReservationMessage(
        "Could not connect to the server. Please try again."
      );
    } 
    finally 
    {
      setProcessingReservationId(null);
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

 {/* Reservations Table */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">
            My Book Reservations
          </h2>

 {/* loading msg and check for 0 reservations */}
          {reservationLoading ? (
            <p className="text-zinc-500">Loading reservations...</p>
          ) : reservationError ? (
            <p role="alert" className="text-red-600 dark:text-red-400">
              {reservationError}
            </p>
            
          ) : activeReservations.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <p className="font-medium">
                You have no active reservations.
              </p>
            </div>
            
          ) : (
            
            <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800">
                  <tr>
                     {/* table headings */}
                    <th className="p-4">Title</th>
                    <th className="p-4">Author</th>
                    <th className="p-4">Reserved Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                {/* Map reservations book info to table */}
                <tbody>
                  {activeReservations.map((reservation) => (
                    <tr
                      key={reservation.reservationId}
                      className="border-b border-zinc-200 last:border-0 dark:border-zinc-800"
                    >
                      <td className="p-4 font-medium">
                        {reservation.book.title}
                      </td>

                      <td className="p-4">
                        {reservation.book.author}
                      </td>

                      <td className="p-4">
                        {new Date(reservation.reservedAt).toLocaleDateString()}
                      </td>

                      <td className="p-4">
                        {reservation.status}
                      </td>
                      
                      <td className="p-4">
                         {/* cancel reservation button */}
                        {reservation.status === "ACTIVE" && (
                          <button
                            type="button"
                            disabled={processingReservationId !== null}
                            onClick={() => setSelectedReservationCancel(reservation)}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                            {processingReservationId === reservation.reservationId
                              ? "Cancelling..."
                              : "Cancel Reservation"}
                          </button>
                        )}
                         {/* fullfill reservation button */}
                        {reservation.status === "READY" && (
                          <button
                            type="button"
                            disabled={processingReservationId !== null}
                            onClick={() => fulfillReservation(reservation)}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                            {processingReservationId === reservation.reservationId
                              ? "Processing..."
                              : "Fulfill Reservation"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Reservation action messages */}
          {reservationMessage && (
            <p role="status" className="text-sm text-blue-600 dark:text-blue-400">
              {reservationMessage}
            </p>
          )}
        </section>






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






      {/*cancel reservation confirmation screen*/}
    {selectedReservationCancel && (
    <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        onClick={() => {
        if (processingReservationId === null)
        {
        setSelectedReservationCancel(null);
        } 
        }}>
          {/*confirmation screen text*/}
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md space-y-5 rounded-xl bg-white p-6 text-zinc-900 shadow-xl dark:bg-zinc-900 dark:text-white"
            onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold">
              Confirm Reservation Cancellation
            </h2>

            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Are you sure you want to cancel your reservation for "{selectedReservationCancel.book.title}"?
            </p>

            {reservationMessage && (
              <p role="status" className="text-sm text-blue-600 dark:text-blue-400">
                {reservationMessage}
              </p>)}
            {/*cancel reservation confirmation button*/}
            <div className="flex gap-3">
              <button
                type="button"
                disabled={processingReservationId !== null}
                onClick={() => cancelReservation(selectedReservationCancel)}
                className="flex-1 rounded-lg bg-red-600 px-4 py-3 font-medium text-white hover:bg-red-700 disabled:opacity-50">
                {processingReservationId ? "Cancelling..." : "Yes, Cancel Reservation"}
              </button>
                {/*close button*/}
              <button
                type="button"
                disabled={processingReservationId !== null}
                onClick={() => setSelectedReservationCancel(null)}
                className="flex-1 rounded-lg border border-zinc-300 px-4 py-3 font-medium hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800 disabled:opacity-50">
                Keep Reservation
              </button>
            </div>
          </div>
        </div>
      )}
    </main>

  );
}