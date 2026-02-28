import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';

  // Subdomain routing — detect {slug}.freejobboard.ai
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'freejobboard.ai';
  const RESERVED = ['www', 'app', 'api', 'admin', 'staging'];
  const subdomain = host.endsWith(`.${rootDomain}`) ? host.replace(`.${rootDomain}`, '') : null;
  const isSubdomain = subdomain !== null && !RESERVED.includes(subdomain);
  const slug = isSubdomain ? subdomain : null;

  // If subdomain → rewrite to /board/[slug]/...
  if (slug && !pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
    const url = request.nextUrl.clone();
    url.pathname = `/board/${slug}${pathname}`;
    return NextResponse.rewrite(url);
  }

  // Auth session refresh
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cs) {
          cs.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cs.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Protect dashboard
  if (pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
