export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-10 h-10 border-2 border-royal-violet/30 border-t-royal-violet rounded-full animate-spin"
          aria-hidden
        />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
}
