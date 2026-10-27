import { BookTable } from "@/components/books/BookTable";
import { BookSearch } from "@/components/books/BookSearch";
import { getBooks, searchBooks, type SearchBy } from "@/lib/api/books";

interface CatalogProps {
	searchParams: Promise<{ query?: string; by?: SearchBy }>;
}

export default async function Catalog({ searchParams }: CatalogProps) {
	const { query, by = "title" } = await searchParams;
	const data = query ? await searchBooks(by, query): await getBooks();
   
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
    	<div className="flex p-4">
        <BookSearch />
      </div>
      <BookTable books={data.content} />
    </div>
  )
}
