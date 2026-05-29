export default function BusinessPageLoading() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="max-w-lg mx-auto px-4 py-8 animate-pulse">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-gray-200 rounded-full mb-4" />
          <div className="h-8 bg-gray-200 rounded-lg w-48 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-32" />
        </div>

        {/* Sections */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-8">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="bg-white rounded-xl p-4 border border-gray-100">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
