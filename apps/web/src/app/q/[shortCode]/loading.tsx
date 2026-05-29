import { Loader2 } from "lucide-react";

export default function QRLoading() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-[#111827] mx-auto" />
        <p className="text-gray-500">Redirecionando...</p>
      </div>
    </div>
  );
}
