import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { Users, UserCheck, Clock, Mail } from "lucide-react";
import { respondToConnection } from "@/app/actions/connections";

type Profile = { first_name: string; last_name: string };

type Connection = {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: string;
  created_at: string;
  requester: Profile | null;
  recipient: Profile | null;
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default async function ConnectionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rawConnections } = await supabase
    .from("connections")
    .select(
      `id, requester_id, recipient_id, status, created_at,
       requester:profiles!requester_id(first_name, last_name),
       recipient:profiles!recipient_id(first_name, last_name)`
    )
    .or(`requester_id.eq.${user!.id},recipient_id.eq.${user!.id}`)
    .order("created_at", { ascending: false });

  const connections = (rawConnections ?? []) as unknown as Connection[];

  const received = connections.filter(
    (c) => c.recipient_id === user!.id && c.status === "pending"
  );
  const accepted = connections.filter((c) => c.status === "accepted");
  const sent = connections.filter(
    (c) => c.requester_id === user!.id && c.status === "pending"
  );

  // Fetch peer name + email via service role — profiles RLS blocks the join for other users
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const emailMap: Record<string, string> = {};
  const nameMap: Record<string, string> = {};

  if (accepted.length > 0) {
    const peerIds = accepted.map((c) =>
      c.requester_id === user!.id ? c.recipient_id : c.requester_id
    );
    await Promise.all(
      peerIds.map(async (id) => {
        const [{ data: authData }, { data: profile }] = await Promise.all([
          serviceClient.auth.admin.getUserById(id),
          serviceClient
            .from("profiles")
            .select("first_name, last_name")
            .eq("id", id)
            .single(),
        ]);
        if (authData.user?.email) emailMap[id] = authData.user.email;
        if (profile) nameMap[id] = `${profile.first_name} ${profile.last_name}`.trim();
      })
    );
  }

  function peerId(c: Connection): string {
    return c.requester_id === user!.id ? c.recipient_id : c.requester_id;
  }

  function peerName(c: Connection): string {
    if (c.requester_id === user!.id) {
      return c.recipient
        ? `${c.recipient.first_name} ${c.recipient.last_name}`
        : "Unknown Member";
    }
    return c.requester
      ? `${c.requester.first_name} ${c.requester.last_name}`
      : "Unknown Member";
  }

  return (
    <div className="pt-16 lg:pt-0 max-w-2xl">
      <div className="mb-8">
        <p className="text-xs tracking-[0.4em] text-[#C9A84C] uppercase mb-2">Community</p>
        <h1 className="font-display text-3xl font-light text-[#EDE8DC]">Connections</h1>
        <div className="gold-divider max-w-[160px] mt-4" />
      </div>

      {/* Received requests */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <UserCheck size={14} className="text-[#C9A84C]" />
          <p className="text-xs tracking-[0.3em] text-[#A09880] uppercase">Pending Requests</p>
          {received.length > 0 && (
            <span className="ml-auto text-[10px] bg-[#C9A84C]/10 text-[#C9A84C] px-2 py-0.5 rounded-full">
              {received.length}
            </span>
          )}
        </div>

        {received.length === 0 ? (
          <div className="luxury-card p-6 text-center">
            <p className="text-xs text-[#3A4A5E]">No pending requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {received.map((c) => (
              <div key={c.id} className="luxury-card p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-[#EDE8DC] font-medium">{peerName(c)}</p>
                  <p className="text-[10px] text-[#3A4A5E] mt-0.5">{timeAgo(c.created_at)}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <form
                    action={async () => {
                      "use server";
                      await respondToConnection(c.id, true);
                    }}
                  >
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#C9A84C] text-[#0A0F1A] text-xs tracking-wider uppercase font-medium hover:bg-[#D4AF37] transition-colors"
                    >
                      Accept
                    </button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await respondToConnection(c.id, false);
                    }}
                  >
                    <button
                      type="submit"
                      className="px-4 py-1.5 border border-[#1E2A3D] text-xs text-[#6B82A0] hover:text-red-400 hover:border-red-800/40 transition-colors"
                    >
                      Decline
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Accepted connections */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Users size={14} className="text-[#C9A84C]" />
          <p className="text-xs tracking-[0.3em] text-[#A09880] uppercase">My Connections</p>
        </div>

        {accepted.length === 0 ? (
          <div className="luxury-card p-8 text-center">
            <Users size={24} className="text-[#2A3A4E] mx-auto mb-3" />
            <p className="text-xs text-[#6B82A0] mb-1">No connections yet</p>
            <p className="text-[10px] text-[#3A4A5E]">
              Connect with families whose memorials are near yours via your Notifications.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {accepted.map((c) => {
              const id = peerId(c);
              const email = emailMap[id];
              const name = nameMap[id] ?? peerName(c);
              return (
                <div key={c.id} className="luxury-card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#0F1A2E] border border-[#1E2A3D] flex items-center justify-center flex-shrink-0">
                        <Users size={13} className="text-[#C9A84C]" />
                      </div>
                      <div>
                        <p className="text-sm text-[#EDE8DC] font-medium">{name}</p>
                        {email && (
                          <a
                            href={`mailto:${email}`}
                            className="flex items-center gap-1.5 text-[11px] text-[#6B82A0] hover:text-[#C9A84C] transition-colors mt-0.5"
                          >
                            <Mail size={10} />
                            {email}
                          </a>
                        )}
                      </div>
                    </div>
                    <p className="text-[10px] text-[#3A4A5E] flex-shrink-0">{timeAgo(c.created_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Sent requests */}
      {sent.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={14} className="text-[#6B82A0]" />
            <p className="text-xs tracking-[0.3em] text-[#A09880] uppercase">Sent — Awaiting Response</p>
          </div>
          <div className="space-y-3">
            {sent.map((c) => (
              <div
                key={c.id}
                className="luxury-card p-5 flex items-center justify-between opacity-70"
              >
                <p className="text-sm text-[#EDE8DC]">{peerName(c)}</p>
                <span className="text-[10px] text-[#6B82A0] border border-[#1E2A3D] px-2 py-0.5">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
