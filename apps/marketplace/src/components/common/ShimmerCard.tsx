export function ShimmerCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden animate-pulse mb-3">
      <div className="flex items-center gap-3 p-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 rounded w-1/3" />
          <div className="h-2 bg-gray-100 rounded w-1/4" />
        </div>
      </div>
      <div className="h-52 bg-gray-200 mx-4 rounded-xl" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="flex gap-4 mt-3">
          <div className="h-6 w-16 bg-gray-100 rounded" />
          <div className="h-6 w-16 bg-gray-100 rounded" />
          <div className="h-6 w-16 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
}

export function ShimmerList({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <ShimmerCard key={i} />
      ))}
    </>
  );
}
