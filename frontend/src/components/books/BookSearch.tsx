"use client";

import { Label, ListBox, SearchField, Select } from "@heroui/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { SearchBy } from "@/lib/api/books";

const SEARCH_BY_OPTIONS: { id: SearchBy; label: string }[] = [
	{ id: "title", label: "Title" },
	{ id: "author", label: "Author" },
	{ id: "category", label: "Category" },
	{ id: "isbn", label: "ISBN" },
];

export function BookSearch() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const byParam = searchParams.get("by");
	const by = SEARCH_BY_OPTIONS.some((option) => option.id === byParam) ? (byParam as SearchBy) : "title";

	function updateParams(updates: Record<string, string>) {
		const params = new URLSearchParams(searchParams);
		for (const [key, value] of Object.entries(updates)) {
			if (value) {
				params.set(key, value);
			}
			else {
				params.delete(key);
			}
		}
		router.replace(`${pathname}?${params}`);
	}

	function search(query: string) {
		updateParams({ query: query.trim() });
	}

	return (
		<div className="flex items-end gap-2">
			<Select
				className="w-36"
				value={by}
				onChange={(key) => updateParams({ by: String(key) })}
			>
				<Label>Search by</Label>
				<Select.Trigger>
					<Select.Value />
					<Select.Indicator />
				</Select.Trigger>
				<Select.Popover>
					<ListBox>
						{SEARCH_BY_OPTIONS.map((option) => (
							<ListBox.Item key={option.id} id={option.id} textValue={option.label}>
								{option.label}
								<ListBox.ItemIndicator />
							</ListBox.Item>
						))}
					</ListBox>
				</Select.Popover>
			</Select>
			<SearchField
				name="search"
				defaultValue={searchParams.get("query") ?? ""}
				onSubmit={(query) => {
					search(query);
					(document.activeElement as HTMLElement | null)?.blur();
				}}
				onClear={() => search("")}
			>
				<Label>Search</Label>
				<SearchField.Group>
					<SearchField.SearchIcon />
					<SearchField.Input className="w-70" placeholder={`Search by ${by}...`} />
					<SearchField.ClearButton />
				</SearchField.Group>
			</SearchField>
		</div>
	);
}
