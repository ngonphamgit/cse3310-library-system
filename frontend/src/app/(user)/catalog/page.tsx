import { BookTable } from "@/components/books/BookTable"

const mockBooks = [
  { bookId: 1, isbn: "isbn1", title: "Book 1", author: "Author 1", description: "Description 1", category: "Category 1", quantity: 1 },
  { bookId: 2, isbn: "isbn2", title: "Book 2", author: "Author 2", description: "Description 2", category: "Category 2", quantity: 2 },
  { bookId: 3, isbn: "isbn3", title: "Book 3", author: "Author 3", description: "Description 3", category: "Category 3", quantity: 3 },
  { bookId: 4, isbn: "isbn4", title: "Book 4", author: "Author 4", description: "Description 4", category: "Category 4", quantity: 4 },
  { bookId: 5, isbn: "isbn5", title: "Book 5", author: "Author 5", description: "Description 5", category: "Category 5", quantity: 0 },
]

export default function catalog() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <BookTable books={mockBooks} />
    </div>
  )
}