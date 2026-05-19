import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Bell, MapPin, Users, BookOpen, CreditCard } from "lucide-react";
import { sendConnectionRequest } from "@/app/actions/connections";

const ICON_MAP: Record<string, React.ElementType> = {
  location_match: MapPin,
  connection_request: Users,
  connection_accepted: Users,
  guestbook_entry: BookOpen,
  payment_confirmed: CreditCard,
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getActionLink(n: { type: string; data: Record<string, string> | null }) {
  if (!n.data) return null;
  if (n.type === "location_match" && n.data.matched_gravesite_id) {
    return {
      href: `/memorial/${n.data.matched_gravesite_id}`,
      label: "View Nearby Memorial",
    };
  }
  if (n.type === "guestbook_entry" && n.data.gravesite_id) {
    return {
      href: `/dashboard/gravesite/${n.data.gravesite_id}`,
      label: "View Guest Book",
    };
  }
  if (
    (n.type === "connection_request" || n.type === "connection_accepted") &&
    n.data.from_user_id
  ) {
    return { href: `/dashboard/connections`, label: "View Connections" };
  }
  return null;
}

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  // Mark all as read
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user!.id)
    .eq("is_read", false);

  // Existing connections (excluding declined) so we don't show a duplicate request button
  const { data: myConnections } = await supabase
    .from("connections")
    .select("requester_id, recipient_id, status")
    .or(`requester_id.eq.${user!.id},recipient_id.eq.${user!.id}`)
    .neq("status", "declined");

  const connectedOrPending = new Set(
    (myConnections ?? []).flatMap((c) => [c.requester_id, c.recipient_id])
  );

  return (
    <div className="pt-16 lg:pt-0 max-w-2xl">
      <div className="mb-8">
        <p className="text-xs tracking-[0.4em] text-[#C9A84C] uppercase mb-2">Activity</p>
        <h1 className="font-display text-3xl font-light text-[#EDE8DC]">Notifications</h1>
        <div className="gold-divider max-w-[160px] mt-4" />
      </div>

      {!notifications?.length ? (
        <div className="luxury-card p-12 text-center">
          <Bell size={28} className="text-[#2A3A4E] mx-auto mb-4" />
          <p className="text-[#6B82A0] text-sm">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const Icon = ICON_MAP[n.type] ?? Bell;
            const action = getActionLink(n);

            // matched_owner_id is embedded in the notification data by the trigger,
            // so no secondary DB query is needed and RLS on gravesite_profiles can't block it.
            const ownerId = n.data?.matched_owner_id as string | undefined;
            const canConnect =
              n.type === "location_match" &&
              ownerId &&
              ownerId !== user!.id &&
              !connectedOrPending.has(ownerId);

            return (
              <div
                key={n.id}
                className={`luxury-card p-5 flex items-start gap-4 ${
                  !n.is_read ? "border-[#C9A84C]/20" : ""
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-[#0F1A2E] border border-[#1E2A3D] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={14} className="text-[#C9A84C]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#EDE8DC] font-medium mb-0.5">{n.title}</p>
                  <p className="text-xs text-[#6B82A0] leading-relaxed mb-2">{n.message}</p>
                  <div className="flex items-center gap-4 flex-wrap">
                    {action && (
                      <Link
                        href={action.href}
                        className="text-xs text-[#C9A84C] hover:text-[#D4AF37] transition-colors"
                      >
                        {action.label} →
                      </Link>
                    )}
                    {canConnect && (
                      <form
                        action={async () => {
                          "use server";
                          await sendConnectionRequest(ownerId!);
                        }}
                      >
                        <button
                          type="submit"
                          className="text-xs text-[#6B82A0] hover:text-[#C9A84C] transition-colors border border-[#1E2A3D] hover:border-[#C9A84C]/30 px-3 py-1"
                        >
                          Connect with Family
                        </button>
                      </form>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-[#3A4A5E] flex-shrink-0">{timeAgo(n.created_at)}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
