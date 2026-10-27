import { Book } from "@/types/book";
import { Page } from "@/types/page";

const BASE_URL = process.env.BACKEND_API_URL;

export type SearchBy = "title" | "author" | "category" | "isbn";

export async function getBookById(id: number): Promise<Book> {
	const res = await fetch(`${BASE_URL}/book/${id}`);

	if (!res.ok) {
		throw new Error(`Failed to fetch book ${id}: ${res.status}`);
	}

	return res.json();
}

export async function searchBooks(by: SearchBy, query: string, page = 0, size = 20): Promise<Page<Book>> {
	const params = new URLSearchParams({ query, page: String(page), size: String(size) });
	const res = await fetch(`${BASE_URL}/book/search/${by}?${params}`);
	if (!res.ok) throw new Error(`Search failed: ${res.status}`);
	return res.json();
}

export async function getBooks(page = 0, size = 20): Promise<Page<Book>> {
	const params = new URLSearchParams({ page: String(page), size: String(size) });
	const res = await fetch(`${BASE_URL}/book?${params}`);

	if (!res.ok) throw new Error(`Failed to fetch books: ${res.status}`);

	return res.json();
}
