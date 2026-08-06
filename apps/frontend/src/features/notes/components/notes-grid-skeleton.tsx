import { Skeleton } from "#/components/ui/skeleton";

const SKELETON_ITEMS = [
	{ key: "a", height: "h-24" },
	{ key: "b", height: "h-32" },
	{ key: "c", height: "h-28" },
	{ key: "d", height: "h-40" },
	{ key: "e", height: "h-20" },
	{ key: "f", height: "h-36" },
	{ key: "g", height: "h-24" },
	{ key: "h", height: "h-32" },
];

export function NotesGridSkeleton() {
	return (
		<div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
			{SKELETON_ITEMS.map(({ key, height }) => (
				<div key={key} className="mb-4 w-full break-inside-avoid">
					<Skeleton className={`${height} w-full rounded-lg`} />
				</div>
			))}
		</div>
	);
}
