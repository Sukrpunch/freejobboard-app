export type JobType = 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
export type JobStatus = 'draft' | 'active' | 'filled' | 'expired';
export type BoardTheme = 'light' | 'dark' | 'auto';

export interface Board {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  custom_domain: string | null;
  owner_id: string;
  logo_url: string | null;
  primary_color: string;
  theme: BoardTheme;
  category: string | null;
  approved: boolean;
  created_at: string;
}

export interface Job {
  id: string;
  board_id: string;
  employer_id: string | null;
  title: string;
  slug: string;
  company: string;
  company_logo_url: string | null;
  location: string;
  remote: boolean;
  job_type: JobType;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  description: string;
  requirements: string | null;
  apply_url: string | null;
  apply_email: string | null;
  status: JobStatus;
  featured: boolean;
  views: number;
  expires_at: string | null;
  created_at: string;
}

export interface Employer {
  id: string;
  board_id: string;
  user_id: string;
  company_name: string;
  website: string | null;
  logo_url: string | null;
  description: string | null;
  verified: boolean;
  created_at: string;
}

export interface Candidate {
  id: string;
  board_id: string;
  user_id: string;
  name: string;
  email: string;
  resume_url: string | null;
  headline: string | null;
  created_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string | null;
  name: string;
  email: string;
  resume_url: string | null;
  cover_note: string | null;
  status: 'new' | 'reviewed' | 'shortlisted' | 'rejected';
  created_at: string;
}

export interface JobAlert {
  id: string;
  board_id: string;
  email: string;
  keywords: string | null;
  categories: string[] | null;
  confirmed: boolean;
  created_at: string;
}

export interface BoardApp {
  id: string;
  board_id: string;
  app_slug: string;
  stripe_subscription_id: string | null;
  active: boolean;
  created_at: string;
}

export interface AppDefinition {
  slug: string;
  name: string;
  description: string;
  icon: string;
  price_monthly: number;
  price_id: string | null;
}

export const AVAILABLE_APPS: AppDefinition[] = [
  {
    slug: 'featured-listings',
    name: 'Featured Listings',
    description: 'Let employers pay to pin their jobs to the top of your board.',
    icon: '⭐',
    price_monthly: 29,
    price_id: null,
  },
  {
    slug: 'resume-database',
    name: 'Resume Database',
    description: 'Monetize your candidate pool. Employers pay to access resumes.',
    icon: '📄',
    price_monthly: 49,
    price_id: null,
  },
  {
    slug: 'advanced-analytics',
    name: 'Advanced Analytics',
    description: 'Deep traffic, conversion, and listing performance data.',
    icon: '📈',
    price_monthly: 19,
    price_id: null,
  },
  {
    slug: 'alert-campaigns',
    name: 'Alert Campaigns',
    description: 'Blast job alerts to your full subscriber list on demand.',
    icon: '📣',
    price_monthly: 29,
    price_id: null,
  },
  {
    slug: 'custom-domain',
    name: 'White-Label Domain',
    description: 'Connect your own domain — jobs.yoursite.com instead of yourboard.freejobboard.ai.',
    icon: '🌐',
    price_monthly: 9,
    price_id: null,
  },
];
