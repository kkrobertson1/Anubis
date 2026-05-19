import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardNav from "@/components/dashboard/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { count: unreadCount }] = await Promise.all([
    supabase
      .from("profiles")
      .select("first_name, last_name, account_status, payment_status")
      .eq("id", user.id)
      .single(),
    supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false),
  ]);

  if (!profile || profile.payment_status === "unpaid") {
    redirect("/checkout?reason=unpaid");
  }

  return (
    <div className="dashboard-theme min-h-screen flex">
      <DashboardNav profile={profile} unreadCount={unreadCount ?? 0} />
      <div className="flex-1 lg:ml-64 flex flex-col">
        <main className="flex-1 p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
