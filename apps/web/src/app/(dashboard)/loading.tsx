export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#111827] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-500">Carregando...</p>
      </div>
    </div>
  );
}
