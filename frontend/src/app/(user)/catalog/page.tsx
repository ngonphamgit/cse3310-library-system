import { Suspense } from "react";
import { BookTable } from "@/components/books/BookTable";
import { BookSearch } from "@/components/books/BookSearch";
import { BookPagination } from "@/components/books/BookPagination";
import { getBooks, searchBooks, type SearchBy } from "@/lib/api/books";
import Link from "next/link";

type CatalogSearchParams = Promise<{ query?: string; by?: SearchBy; page?: string }>;

interface CatalogProps {
	searchParams: CatalogSearchParams;
}

async function CatalogResults({ searchParams }: CatalogProps) {
	const { query, by = "title", page: pageParam } = await searchParams;
	const page = Math.max(1, Math.floor(Number(pageParam)) || 1);
	const data = query ? await searchBooks(by, query, page - 1) : await getBooks(page - 1);

	return (
		<>
			<BookTable books={data.content} />
			<div className="p-4">
				<BookPagination page={page} totalPages={data.totalPages} />
			</div>
		</>
	);
}

export default function Catalog({ searchParams }: CatalogProps) {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
    	<div className="flex items-center justify-between gap-4 p-4">
        <div className="min-w-0 flex-1">
        <Suspense>
          <BookSearch />
        </Suspense>
		 </div>

	<Link
          href="/userdashboard"
          className="shrink-0 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          My Dashboard
        </Link>

		  <div className="flex gap-3">
             <Link href="/catalog/recommendations"className=
             "rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Book Recommendations
                 </Link>
                </div>
	</div>


	  <Suspense fallback={<p className="p-4 text-center">Loading books...</p>}>
        <CatalogResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
