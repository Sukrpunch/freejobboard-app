'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Briefcase, Users, FileText, BarChart2, AppWindow, Settings, ExternalLink, LogOut, Menu, X, ShieldCheck, Code2 } from 'lucide-react';

const ADMIN_EMAILS = ['sukrpunch@yahoo.com', 'chris@bessjobs.com', 'agenticmason@gmail.com'];

const NAV = [
  { href: '/dashboard',            label: 'Overview',  icon: LayoutDashboard },
  { href: '/dashboard/jobs',       label: 'Jobs',      icon: Briefcase },
  { href: '/dashboard/employers',  label: 'Employers', icon: Users },
  { href: '/dashboard/applicants', label: 'Applicants', icon: Users },
  { href: '/dashboard/resumes',    label: 'Resumes', icon: FileText },
  { href: '/dashboard/analytics',  label: 'Analytics', icon: BarChart2 },
  { href: '/dashboard/apps',       label: 'App Store', icon: AppWindow },
  { href: '/dashboard/embed',      label: 'Embed',     icon: Code2 },
  { href: '/dashboard/settings',   label: 'Settings',  icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [open, setOpen]       = useState(false);
  const [board, setBoard]     = useState<{ name: string; slug: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace('/login'); return; }
      const { data } = await supabase.from('boards').select('name, slug').eq('owner_id', user.id).single();
      setBoard(data);
      setIsAdmin(ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? ''));
      setLoading(false);
    });
  }, [router]);

  // Close sidebar on route change (mobile)
  useEffect(() => { setOpen(false); }, [pathname]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const Sidebar = () => (
    <aside className="w-56 bg-[#0a0a0f] text-white flex flex-col h-full">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <Link href="/" className="text-base font-black">
            FreeJobBoard<span className="text-indigo-400">.ai</span>
          </Link>
          {board && (
            <div className="mt-2">
              <p className="text-xs text-slate-500 truncate">{board.name}</p>
              <a href={`https://${board.slug}.freejobboard.ai`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 mt-0.5">
                View Board <ExternalLink size={10} />
              </a>
            </div>
          )}
        </div>
        {/* Close button — mobile only */}
        <button onClick={() => setOpen(false)} className="lg:hidden text-slate-400 hover:text-white p-1">
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}>
              <Icon size={16} />{label}
            </Link>
          );
        })}
        {isAdmin && (
          <>
            <div className="border-t border-white/10 my-2" />
            <Link href="/admin"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-amber-400 hover:text-amber-300 hover:bg-white/10 transition-colors">
              <ShieldCheck size={16} /> Platform Admin
            </Link>
          </>
        )}
      </nav>

      <div className="p-3 border-t border-white/10">
        <button onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/8 transition-colors w-full">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );

  if (loading) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop sidebar — fixed */}
      <div className="hidden lg:flex fixed inset-y-0 left-0 z-20 flex-col" style={{ width: '14rem' }}>
        <Sidebar />
      </div>

      {/* Mobile sidebar — overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          {/* Drawer */}
          <div className="relative z-50 flex flex-col" style={{ width: '14rem' }}>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 lg:ml-56 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between bg-[#0a0a0f] text-white px-4 py-3 sticky top-0 z-30">
          <Link href="/" className="text-sm font-black">
            FreeJobBoard<span className="text-indigo-400">.ai</span>
          </Link>
          <button onClick={() => setOpen(true)} className="text-slate-400 hover:text-white p-1">
            <Menu size={22} />
          </button>
        </div>

        <div className="flex-1 p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
