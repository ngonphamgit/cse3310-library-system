"use client";

import { Table } from "@heroui/react";
import type { Book } from "@/types/book";

interface InventoryTableProps
{
  books: Book[];
  onSelectBook: (bookId: number) => void; // called when a title is clicked
}

//librarian view of every book, including inactive (removed) ones
export function InventoryTable({ books = [], onSelectBook }: InventoryTableProps)
{
  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="book inventory">
          <Table.Header>
            {/*table layout*/}
            <Table.Column>ID</Table.Column>
            <Table.Column isRowHeader>Title</Table.Column>
            <Table.Column>Author</Table.Column>
            <Table.Column>ISBN</Table.Column>
            <Table.Column>Category</Table.Column>
            <Table.Column>Description</Table.Column>
            <Table.Column>Quantity</Table.Column>
            <Table.Column>Status</Table.Column>
          </Table.Header>
          <Table.Body>
            {books.map((book) => ( //maps the rows to the books in database
              <Table.Row key={book.bookId} id={String(book.bookId)}>
                <Table.Cell>{book.bookId}</Table.Cell>
                {/*click title to open book details*/}
                <Table.Cell>
                  <button
                    type="button"
                    className="cursor-pointer text-left text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                    onClick={() => onSelectBook(book.bookId)}
                  >
                    {book.title}
                  </button>
                </Table.Cell>
                <Table.Cell>{book.author}</Table.Cell>
                <Table.Cell>{book.isbn}</Table.Cell>
                <Table.Cell>{book.category}</Table.Cell>
                {/*description is cut short, hover to see all of it*/}
                <Table.Cell>
                  <p className="max-w-xs truncate" title={book.description}>
                    {book.description}
                  </p>
                </Table.Cell>
                {/*highlight books with no copies left*/}
                <Table.Cell>
                  <span className={book.quantity === 0 ? "font-semibold text-red-600 dark:text-red-400" : ""}>
                    {book.quantity}
                  </span>
                </Table.Cell>
                {/*active/inactive badge*/}
                <Table.Cell>
                  {book.isActive ? (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300">
                      Active
                    </span>
                  ) : (
                    <span className="rounded-full bg-zinc-200 px-2 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                      Inactive
                    </span>
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
