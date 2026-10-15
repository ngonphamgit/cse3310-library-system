import { Table } from "@heroui/react";

interface Book {
    bookId: number,
    isbn: string,
    title: string,
    author: string,
    description: string,
    category: string,
    quantity: number
}

interface BookTableProps {
    books: Book[];
}

export function BookTable({ books = [] }: BookTableProps) {
  return (
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
            {books.map(({ bookId, title, author, isbn, category, quantity }) => (
              <Table.Row key={bookId} id={bookId}>
                <Table.Cell>{title}</Table.Cell>
                <Table.Cell>{author}</Table.Cell>
                <Table.Cell>{isbn}</Table.Cell>
                <Table.Cell>{category}</Table.Cell>
                <Table.Cell>{quantity}</Table.Cell>
              </Table.Row>
            ))}
            
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}