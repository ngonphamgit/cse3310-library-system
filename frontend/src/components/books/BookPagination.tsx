"use client";

import { Pagination } from "@heroui/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface BookPaginationProps {
	page: number;
	totalPages: number;
}

function getPageItems(page: number, totalPages: number): (number | null)[] {
	const items: (number | null)[] = [];
	for (let i = 1; i <= totalPages; i++) {
		if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
			items.push(i);
		}
		else if (items[items.length - 1] !== null) {
			items.push(null);
		}
	}
	return items;
}

export function BookPagination({ page, totalPages }: BookPaginationProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	if (totalPages <= 1) return null;

	function goToPage(newPage: number) {
		const params = new URLSearchParams(searchParams);
		if (newPage > 1) {
			params.set("page", String(newPage));
		}
		else {
			params.delete("page");
		}
		router.push(`${pathname}?${params}`);
	}

	return (
		<Pagination className="justify-center">
			<Pagination.Content>
				<Pagination.Item>
					<Pagination.Previous isDisabled={page <= 1} onPress={() => goToPage(page - 1)}>
						<Pagination.PreviousIcon />
						Previous
					</Pagination.Previous>
				</Pagination.Item>
				{getPageItems(page, totalPages).map((item, index) => (
					<Pagination.Item key={item ?? `gap-${index}`}>
						{item === null ? (
							<Pagination.Ellipsis />
						) : (
							<Pagination.Link isActive={item === page} onPress={() => goToPage(item)}>
								{item}
							</Pagination.Link>
						)}
					</Pagination.Item>
				))}
				<Pagination.Item>
					<Pagination.Next isDisabled={page >= totalPages} onPress={() => goToPage(page + 1)}>
						Next
						<Pagination.NextIcon />
					</Pagination.Next>
				</Pagination.Item>
			</Pagination.Content>
		</Pagination>
	);
}
