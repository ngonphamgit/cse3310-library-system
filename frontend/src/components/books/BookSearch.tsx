"use client";

import { Label, SearchField } from "@heroui/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function BookSearch() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	function search(query: string) {
		const params = new URLSearchParams(searchParams);
		if (query.trim()) {
			params.set("query", query.trim());
		}
		else {
			params.delete("query");
		}
		router.replace(`${pathname}?${params}`);
	}
	
	return (
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
				<SearchField.Input className="w-70" placeholder="Search..." />
				<SearchField.ClearButton />
			</SearchField.Group>
		</SearchField>
	);
}
