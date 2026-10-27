import { BookTable } from "@/components/books/BookTable";
import { BookSearch } from "@/components/books/BookSearch";
import { BookPagination } from "@/components/books/BookPagination";
import { getBooks, searchBooks, type SearchBy } from "@/lib/api/books";

interface CatalogProps {
	searchParams: Promise<{ query?: string; by?: SearchBy; page?: string }>;
}

export default async function Catalog({ searchParams }: CatalogProps) {
	const { query, by = "title", page: pageParam } = await searchParams;
	const page = Math.max(1, Math.floor(Number(pageParam)) || 1);
	const data = query ? await searchBooks(by, query, page - 1) : await getBooks(page - 1);

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
    	<div className="flex p-4">
        <BookSearch />
      </div>
      <BookTable books={data.content} />
      <div className="p-4">
        <BookPagination page={page} totalPages={data.totalPages} />
      </div>
    </div>
  )
}
