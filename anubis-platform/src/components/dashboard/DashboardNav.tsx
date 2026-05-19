"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import {
  LayoutDashboard,
  MapPin,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Users,
  Zap,
  Globe,
  GitBranch,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/tree", label: "Family Tree", icon: GitBranch },
  { href: "/community", label: "Community", icon: Globe },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/connections", label: "Connections", icon: Users },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

type Profile = {
  first_name: string;
  last_name: string;
};

export default function DashboardNav({
  profile,
  unreadCount,
}: {
  profile: Profile;
  unreadCount: number;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3 bg-[#0A0F1A] border-b border-[#1E2A3D]">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/logo.png" alt="ANUBIS" width={32} height={10} className="object-contain" />
          <span className="font-display text-lg font-light tracking-[0.2em] text-[#C9A84C]">ANUBIS</span>
        </Link>
        <button onClick={() => setOpen(!open)} className="text-[#EDE8DC] p-1">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#0A0F1A] border-r border-[#1E2A3D] z-40 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-[#1E2A3D]">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="ANUBIS" width={38} height={12} className="object-contain" />
            <span className="font-display text-xl font-light tracking-[0.2em] text-[#C9A84C]">ANUBIS</span>
          </Link>
        </div>

        {/* User */}
        <div className="px-6 py-4 border-b border-[#1E2A3D]">
          <p className="text-[10px] tracking-[0.3em] text-white uppercase mb-1">Member</p>
          <p className="text-white font-semibold text-sm">
            {profile.first_name} {profile.last_name}
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            const showBadge = href === "/dashboard/notifications" && unreadCount > 0;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 ${
                  active
                    ? "text-white bg-white/15 border-l-2 border-[#C9A84C]"
                    : "text-white hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon size={15} />
                <span className="flex-1">{label}</span>
                {showBadge && (
                  <span className="ml-auto min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-medium px-1">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-4 pb-1">
            <p className="text-[10px] tracking-[0.3em] text-white uppercase px-4">Memorial Slots</p>
          </div>

          <Link
            href="/dashboard/gravesite/new"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 ${
              pathname === "/dashboard/gravesite/new"
                ? "text-white bg-white/15 border-l-2 border-[#C9A84C]"
                : "text-white hover:text-white hover:bg-white/10"
            }`}
          >
            <MapPin size={15} />
            Add Memorial
          </Link>

          <Link
            href="/dashboard/upgrade"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 ${
              pathname === "/dashboard/upgrade"
                ? "text-white bg-white/15 border-l-2 border-[#C9A84C]"
                : "text-white hover:text-white hover:bg-white/10"
            }`}
          >
            <Zap size={15} />
            Upgrade Slots
          </Link>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-[#1E2A3D]">
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:text-red-300 transition-colors duration-200"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-30"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
