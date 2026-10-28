"use client";

import { useState } from "react"; //allows book table to be interacted with
import { Table } from "@heroui/react";
import type { Book } from "@/types/book";

interface BookTableProps {
    books: Book[];
}

export function BookTable({ books = [] }: BookTableProps) {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [actionMessage, setActionMessage] = useState("");

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
            
            {books.map((book) => ( //maps the rows to the books in database
              <Table.Row key={book.bookId} id={String(book.bookId)} >     
                <Table.Cell>
                   <button 
                    type="button"
                    className="cursor-pointer text-left hover:underline"
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
                className="rounded-lg px-3 py-1 text-xl hover:bg-zinc-200 dark:hover:bg-zinc-700"
              >
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
                onClick={() =>
                  setActionMessage("checkout not yet implemented")
                }
                className="flex-1 rounded-lg bg-blue-700 px-4 py-3 font-medium text-white hover:bg-blue-800"
              >
                Checkout
              </button>

              <button
                type="button"
                onClick={() =>
                  setActionMessage("reservation not yet implemented")
                }
                className="flex-1 rounded-lg border border-zinc-300 px-4 py-3 font-medium hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800"
              >
                Reserve
              </button>
            </div>
          </div>
        </div>
      )}
        </>
  );
}