import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Briefcase, Users, BarChart2, AppWindow, Settings, ExternalLink, LogOut } from 'lucide-react';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/dashboard/employers', label: 'Employers', icon: Users },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/dashboard/apps', label: 'App Store', icon: AppWindow },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: board } = await supabase
    .from('boards').select('*').eq('owner_id', user.id).single();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-[#0a0a0f] text-white flex flex-col fixed inset-y-0 left-0 z-20">
        <div className="p-4 border-b border-white/10">
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
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/8 transition-colors">
              <Icon size={16} />{label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <form action="/api/auth/signout" method="post">
            <button type="submit" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/8 transition-colors w-full">
              <LogOut size={16} /> Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-56 p-8">
        {children}
      </main>
    </div>
  );
}
