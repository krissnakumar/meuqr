import { redirect } from "next/navigation";

export default async function PagesRedirectRoute({ params }: { params: Promise<{ id: string }> }) {
  // The pages management is handled directly on the Business Overview screen
  // in the new Business OS architecture.
  const { id } = await params;
  redirect(`/dashboard/business/${id}`);
}
