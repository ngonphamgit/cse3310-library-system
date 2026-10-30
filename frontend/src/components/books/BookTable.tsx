"use client";

import { useEffect, useState } from "react"; //allows book table to be interacted with
import { Table } from "@heroui/react";
import type { Book } from "@/types/book";

interface BookTableProps 
{
  books: Book[];
}

export function BookTable({ books = [] }: BookTableProps) 
{
const [selectedBook, setSelectedBook] = useState<Book | null>(null);
const [actionMessage, setActionMessage] = useState("");
const [displayBooks, setDisplayBooks] = useState<Book[]>(books);
const [showCheckoutConfirmation, setShowCheckoutConfirmation] = useState(false);

useEffect(() => {
  setDisplayBooks(books);
}, [books]);

  function openBook(book: Book) //open books details into popup
  {
    setSelectedBook(book);
    setActionMessage("");
  }

  function closeBook()  //close the book popup
  {
    setSelectedBook(null);
    setActionMessage("");
  }



  async function checkoutBook() //run when checkout button pressed
  {
  if (!selectedBook) //check if selected book is valid
    {
    return;
    } 

  setActionMessage("Checking out book..."); //message to user telling them something is happening

  try {
    const token = localStorage.getItem("token"); //get the login token for user

    if (!token)  //if the token is invalid, the user isnt logged in so stop checkout
    {
      setActionMessage("Please log in before checking out a book.");
      return;
    }

    const response = await fetch("http://localhost:8080/loan/checkout", { //fetch checkout endpoint
      method: "POST",
      headers: 
      {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, //authorize user
      },
      body: JSON.stringify({ bookId: selectedBook.bookId,}),
    });

    if (!response.ok) //check backend response is valid
      {
      const errorText = await response.text();

    if (response.status === 409) 
    { //duplicate checkout error
    setActionMessage("You have already checked out this book.");
    } 
    else if(response.status === 403)
    {
      setActionMessage("You need to log in to check out a book.");
    }
    else
    { //otherwise other error
    setActionMessage(`Checkout failed (${response.status}). Please try again.`);
    }
      return;
    }

    const loan = await response.json();

    //update the quantity to reflect checkout
    const updatedBook = { ...selectedBook, quantity: Math.max(0, selectedBook.quantity - 1),};

    //update the book table to reflect the quantity
    setDisplayBooks((currentBooks) => currentBooks.map((book) =>
    book.bookId === updatedBook.bookId ? updatedBook : book));

    //update popup with new quantity
    setSelectedBook(updatedBook);

    //otherwise checkout succeeded, notify user that it succeeded
    setActionMessage(`Successfully checked out "${loan.book.title}". Due date: ${loan.dueDate}.`);

  } 
  catch (error) 
  {
    console.error("Checkout error:", error);
    setActionMessage("Could not connect to the server. Please try again."); //backend isnt connected
  }
}


  return (
    <>
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="books">
          <Table.Header>
            <Table.Column isRowHeader>Title</Table.Column>
            <Table.Column>Author</Table.Column>
            <Table.Column>ISBN</Table.Column>
            <Table.Column>Category</Table.Column>
            <Table.Column>Quantity</Table.Column>
          </Table.Header>
          <Table.Body>
            
            {displayBooks.map((book) => ( //maps the rows to the books in database
              <Table.Row key={book.bookId} id={String(book.bookId)} >     
                <Table.Cell>
                   <button 
                    type="button"
                    className="cursor-pointer text-left text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                    onClick={() => openBook(book)}>
                       {book.title}
                    </button>
                 </Table.Cell>
                <Table.Cell>{book.author}</Table.Cell>
                <Table.Cell>{book.isbn}</Table.Cell>
                <Table.Cell>{book.category}</Table.Cell>
                <Table.Cell>{book.quantity}</Table.Cell>
              </Table.Row>
            ))}
            
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>


  {
 selectedBook && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={closeBook} >

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="book-details-title"
            className="w-full max-w-lg space-y-5 rounded-xl bg-white p-6 text-zinc-900 shadow-xl dark:bg-zinc-900 dark:text-white"
            onClick={(e) => e.stopPropagation()} >

            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="book-details-title"
                  className="text-2xl font-bold">
                  {selectedBook.title}
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  by {selectedBook.author}
                </p>
              </div>

              <button
                type="button"
                onClick={closeBook}
                aria-label="Close book details"
                className="rounded-lg px-3 py-1 text-xl hover:bg-zinc-200 dark:hover:bg-zinc-700">
                &times;
              </button>
            </div>

            <div className="space-y-3 border-y border-zinc-200 py-4 dark:border-zinc-700">
              <p>
                <span className="font-semibold">ISBN:</span>{" "}
                {selectedBook.isbn}
              </p>
              <p>
                <span className="font-semibold">Category:</span>{" "}
                {selectedBook.category}
              </p>
              <p>
                <span className="font-semibold">Quantity:</span>{" "}
                {selectedBook.quantity}
              </p>
              <div>
                <p className="font-semibold">Description</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-300">
                  {selectedBook.description || "No description available."}
                </p>
              </div>
            </div>

            {actionMessage && (
              <p role="status" className="text-sm text-blue-600 dark:text-blue-400">
                {actionMessage}
              </p>
            )}



            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                  disabled={selectedBook.quantity === 0}
                onClick={() => setShowCheckoutConfirmation(true)}
                className="flex-1 rounded-lg bg-blue-700 px-4 py-3 font-medium text-white hover:bg-blue-800 disabled:opacity-20">
                Checkout
              </button>

              <button
                type="button"
                disabled={selectedBook.quantity > 0}
                onClick={() =>
                  setActionMessage("reservation not yet implemented")
                }
                className="flex-1 rounded-lg border border-zinc-300 px-4 py-3 font-medium hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800 disabled:opacity-20">
                Reserve
              </button>
            </div>
          </div>
        </div>
      )}

      {showCheckoutConfirmation && selectedBook && (
  <div
    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
    onClick={() => setShowCheckoutConfirmation(false)}>
    <div
      role="dialog"
      aria-modal="true"
      className="w-full max-w-md space-y-5 rounded-xl bg-white p-6 text-zinc-900 shadow-xl dark:bg-zinc-900 dark:text-white"
      onClick={(e) => e.stopPropagation()}>
      <h2 className="text-xl font-bold">
        Confirm Checkout
      </h2>

      <p className="text-sm text-zinc-600 dark:text-zinc-300">
        Are you sure you want to check out "{selectedBook.title}"?
         </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
         Due Date:{" "}
          <span className="font-semibold text-zinc-900 dark:text-white">
            {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}
             </span>  
      </p>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => {
            setShowCheckoutConfirmation(false);
            checkoutBook();
          }}
          className="flex-1 rounded-lg bg-blue-700 px-4 py-3 font-medium text-white hover:bg-blue-800">
          Yes, Checkout
        </button>

        <button
          type="button"
          onClick={() => setShowCheckoutConfirmation(false)}
          className="flex-1 rounded-lg border border-zinc-300 px-4 py-3 font-medium hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800">
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
        </>
  );
}