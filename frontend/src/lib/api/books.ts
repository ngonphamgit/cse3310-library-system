import { Book } from "@/types/book";
import { Page } from "@/types/page";

const BASE_URL = process.env.BACKEND_API_URL;

export async function getBookById(id: number): Promise<Book> {
  const res = await fetch(`${BASE_URL}/book/${id}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch book ${id}: ${res.status}`);
  }

  return res.json();
}

export async function getBooksByTitle(query: string, page = 0, size = 10): Promise<Page<Book>> {
  const params = new URLSearchParams({ query, page: String(page), size: String(size)});
  const res = await fetch(`${BASE_URL}/book/search?${params}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch books with ${query}: ${res.status}`);
  }

  return res.json();
}
