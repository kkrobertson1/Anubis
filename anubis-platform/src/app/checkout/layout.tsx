import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("payment_status")
      .eq("id", user.id)
      .single();

    // Already paid — send them to the dashboard
    if (profile?.payment_status === "paid") {
      redirect("/dashboard");
    }
  }

  return <>{children}</>;
}
