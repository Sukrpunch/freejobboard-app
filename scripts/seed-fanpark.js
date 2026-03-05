const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  'https://wtbmvwpuuakxujoccpwd.supabase.co',
  'REDACTED_SERVICE_KEY'
);

const BOARD_ID = '8984832b-9a5f-4d0c-a031-4255a478b48a';

function slug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') +
    '-' + Math.random().toString(36).slice(2, 7);
}

const jobs = [
  {
    title: 'Live Event Presenter',
    job_type: 'freelance',
    location: 'London, UK',
    salary_min: 200,
    salary_max: 500,
    salary_currency: 'GBP',
    apply_email: 'hello@fanpark.co.uk',
    featured: true,
    description: `## About FANPARK
FANPARK is the UK's most immersive fan zone experience — festival-style watchalongs, live entertainment, street food, and thousands of passionate sports fans across the UK, Dubai, and Australia.

## The Role
We're looking for charismatic, high-energy **Live Event Presenters** to host our fan zones during major sporting events. You'll be the voice and energy of the room — keeping the crowd engaged, running competitions, and making every fan feel like they're at the match.

## What You'll Do
- Host live fan zone events during major sporting fixtures (Premier League, Champions League, NFL, etc.)
- Engage and energize crowds of 200–2,000+ fans
- Run games, competitions, and prize giveaways throughout the event
- Interview fans, VIP guests, and talent on the main stage
- Work closely with our production and events team on event flow and scripting

## What We're Looking For
- Proven experience as a presenter, MC, or broadcaster (events, TV, radio, or online)
- Confident on a microphone in front of large, lively crowds
- Genuine passion for sport — you need to live and breathe it
- Flexible availability across evenings and weekends during the sporting calendar
- Excellent improvisation skills — no two events are the same

## Compensation
£200–£500 per event (negotiable based on experience and event scale)`,
    requirements: 'Previous presenting/MC experience required. Sports knowledge essential. Flexible availability for evenings and weekends.',
  },
  {
    title: 'Fan Zone Host',
    job_type: 'part-time',
    location: 'Multiple Locations, UK',
    salary_min: 12,
    salary_max: 16,
    salary_currency: 'GBP',
    apply_email: 'hello@fanpark.co.uk',
    featured: true,
    description: `## About FANPARK
FANPARK creates the UK's most electric fan zones — think festival vibes meets match day atmosphere. We operate across the UK and internationally, turning major sporting events into unforgettable live experiences.

## The Role
Fan Zone Hosts are the face of FANPARK on the ground. You'll greet fans, manage the guest experience, run activations, and ensure every person walking through the door has the time of their life.

## What You'll Do
- Welcome and register fans on arrival
- Manage queues, seating, and crowd flow throughout the event
- Run fan engagement activities and sponsor activations
- Assist with competitions, giveaways, and interactive games
- Handle guest queries and ensure a premium fan experience
- Support the events team with setup and breakdown

## What We're Looking For
- Outgoing, energetic personality — you love people
- Customer-facing experience (hospitality, retail, events, or similar)
- Strong team player who thrives in fast-paced environments
- Available evenings and weekends across the sporting season
- Reliable, punctual, and professional

## Compensation
£12–£16 per hour depending on role and experience`,
    requirements: 'Customer-facing experience preferred. Must be available evenings and weekends.',
  },
  {
    title: 'Event Volunteer',
    job_type: 'internship',
    location: 'Multiple Locations, UK',
    salary_min: null,
    salary_max: null,
    salary_currency: 'GBP',
    apply_email: 'hello@fanpark.co.uk',
    featured: false,
    description: `## Volunteer at FANPARK

FANPARK fan zones are powered by an incredible community of passionate sports fans who want to be part of something special. As a volunteer, you'll get behind-the-scenes access, free entry to events, and the satisfaction of helping create unforgettable fan experiences.

## What Volunteers Do
- Support the FANPARK team on the ground at events
- Help with fan registration, seating, and general crowd management
- Assist with sponsor activations and merchandise
- Capture content (photos/videos) to share on social media
- Be an ambassador for the FANPARK brand

## What You Get
- Free entry to all events you volunteer at
- FANPARK volunteer kit (t-shirt + lanyard)
- References for future employment in events or hospitality
- Access to exclusive fan zone areas
- The experience of working on major sporting events

## Who We're Looking For
- Genuine sports fans (any sport!)
- Energetic, reliable, and a team player
- Comfortable in large, busy crowd environments
- 18+ years old

No experience necessary — just enthusiasm and a love of sport.`,
    requirements: 'Must be 18+. Sports fan essential. No prior experience required.',
  },
  {
    title: 'Content Creator (Sports & Events)',
    job_type: 'freelance',
    location: 'Remote / On-Site UK',
    salary_min: 300,
    salary_max: 800,
    salary_currency: 'GBP',
    apply_email: 'hello@fanpark.co.uk',
    featured: true,
    description: `## About FANPARK
FANPARK is one of the UK's fastest-growing fan zone brands — operating electric live events across the UK, Dubai, and Australia. Our events are visual, emotional, and shareable. We need a content creator who gets that.

## The Role
We're looking for a talented **Content Creator** to capture and produce content at our live events and remotely. You'll document the atmosphere, interview fans, create event highlights, and produce scroll-stopping social content that puts you right in the heart of the action.

## What You'll Do
- Film and photograph live events (fan reactions, atmosphere, key moments)
- Produce short-form video content for TikTok, Instagram Reels, and YouTube Shorts
- Create behind-the-scenes content showing the FANPARK experience
- Work with the marketing team to plan content calendars around the sporting fixture list
- Edit footage to a broadcast-quality standard with fast turnaround (same-day posting preferred)
- Develop original content ideas to grow FANPARK's online presence

## What We're Looking For
- Strong portfolio of sports, events, or lifestyle content
- Proficient in video editing (CapCut, Premiere Pro, or similar)
- Deep understanding of TikTok and Instagram trends and algorithms
- Ability to work fast — live events mean same-day content requirements
- Own equipment preferred (camera, gimbal, audio)
- Genuine sports fan who understands the emotion of big sporting moments

## Compensation
£300–£800 per project/event (based on scope and deliverables)`,
    requirements: 'Strong content portfolio required. Video editing skills essential. Own equipment preferred.',
  },
  {
    title: 'Social Media Manager',
    job_type: 'part-time',
    location: 'Remote (UK-based)',
    salary_min: 1500,
    salary_max: 2500,
    salary_currency: 'GBP',
    apply_email: 'hello@fanpark.co.uk',
    featured: false,
    description: `## About FANPARK
FANPARK is the UK's biggest fan zone brand — and we're growing fast. We operate across the UK, Dubai, and Australia, and our social presence needs to match our ambition.

## The Role
We need a sharp **Social Media Manager** to own FANPARK's channels, grow our audience, and turn every event into a social moment. This is a remote-first role with occasional on-site attendance at events.

## What You'll Do
- Manage and grow FANPARK's presence on TikTok, Instagram, Facebook, X, and YouTube
- Plan and publish content calendars aligned with the sporting fixture schedule
- Engage with fans, respond to comments, and build community
- Collaborate with content creators to edit and schedule event content
- Run paid social campaigns (Facebook/Instagram ads) for event promotion
- Track analytics and report on growth, reach, and engagement monthly
- Identify trends and execute reactive content around major sporting moments

## What We're Looking For
- 2+ years managing social media for a brand or agency
- Strong understanding of sports fan culture and how sports fans consume content
- Proven track record of growing engaged audiences
- Experience with paid social advertising (Meta Ads Manager)
- Excellent copywriting skills with a distinctive brand voice
- Self-motivated, organised, and comfortable working remotely with minimal supervision

## Compensation
£1,500–£2,500/month (part-time, ~20 hrs/week)`,
    requirements: '2+ years social media management experience. Sports fan culture knowledge essential.',
  },
  {
    title: 'Marketing Executive',
    job_type: 'full-time',
    location: 'London, UK (Hybrid)',
    salary_min: 28000,
    salary_max: 38000,
    salary_currency: 'GBP',
    apply_email: 'hello@fanpark.co.uk',
    featured: false,
    description: `## About FANPARK
FANPARK is the UK's most immersive fan zone experience with events across the UK, Dubai, and Australia. We're scaling fast and building a marketing team to match.

## The Role
We're hiring a **Marketing Executive** to support FANPARK's growth across event promotion, brand partnerships, and digital channels. This is a hands-on generalist role where you'll work directly with senior leadership to grow the FANPARK brand.

## What You'll Do
- Plan and execute event marketing campaigns across email, social, and paid channels
- Manage ticket sales and registration campaigns for upcoming events
- Build and maintain relationships with venue partners, sponsors, and media partners
- Write compelling copy for event pages, email campaigns, and press releases
- Coordinate with content creators, designers, and external agencies
- Track campaign performance and report on KPIs weekly
- Support the team at live events as required (evenings and weekends during the sporting calendar)

## What We're Looking For
- 1–3 years in a marketing role (events, hospitality, sports, or entertainment preferred)
- Experience running email campaigns (Mailchimp, Klaviyo, or similar)
- Comfortable with paid digital advertising (Meta, Google)
- Strong copywriting skills
- Highly organised with excellent project management skills
- A genuine passion for sport — this is non-negotiable

## Compensation
£28,000–£38,000 per annum depending on experience`,
    requirements: '1-3 years marketing experience. Events or sports background preferred. Hybrid role based in London.',
  },
  {
    title: 'Graphic Designer (Events & Brand)',
    job_type: 'freelance',
    location: 'Remote',
    salary_min: 300,
    salary_max: 600,
    salary_currency: 'GBP',
    apply_email: 'hello@fanpark.co.uk',
    featured: false,
    description: `## About FANPARK
FANPARK runs the UK's most visually striking fan zone events. From stage backdrops to social graphics to sponsor activations — everything we produce needs to look world-class.

## The Role
We're looking for a talented **Graphic Designer** to create visual assets across our events and brand channels. This is a freelance/project-based role with the potential for an ongoing relationship as we grow.

## What You'll Do
- Design event promotional materials — posters, social graphics, digital ads, email headers
- Create on-site event assets — stage graphics, banners, signage, and activation materials
- Produce sponsor and partner brand integration materials
- Design merchandise concepts (t-shirts, caps, lanyards, etc.)
- Maintain and evolve the FANPARK visual identity across all touchpoints
- Turn around assets quickly around the sporting fixture calendar

## What We're Looking For
- Strong portfolio with events, sports, or entertainment design work
- Proficient in Adobe Creative Suite (Illustrator, Photoshop, InDesign) or Figma
- Understanding of print production and digital design specs
- Fast turnaround — events don't wait
- A feel for bold, energetic design that works in loud, visual environments
- Motion graphics experience (After Effects) is a bonus

## Compensation
£300–£600 per project depending on scope and deliverables`,
    requirements: 'Portfolio required. Adobe Creative Suite or Figma proficiency essential. Events/sports design experience preferred.',
  },
];

(async () => {
  console.log(`Seeding ${jobs.length} jobs for FANPARK board ${BOARD_ID}...`);
  let success = 0;
  for (const job of jobs) {
    const { data, error } = await sb.from('jobs').insert({
      board_id: BOARD_ID,
      title: job.title,
      slug: slug(job.title),
      company: 'FANPARK',
      company_logo_url: null,
      location: job.location,
      remote: job.location.toLowerCase().includes('remote'),
      job_type: job.job_type,
      salary_min: job.salary_min || null,
      salary_max: job.salary_max || null,
      salary_currency: job.salary_currency || 'GBP',
      description: job.description,
      requirements: job.requirements,
      apply_email: job.apply_email,
      apply_url: null,
      status: 'active',
      featured: job.featured || false,
    }).select('id, title');
    if (error) {
      console.error(`❌ ${job.title}: ${error.message}`);
    } else {
      console.log(`✅ ${job.title}`);
      success++;
    }
  }
  console.log(`\nDone: ${success}/${jobs.length} jobs seeded.`);
  console.log(`Board URL: https://fanpark.freejobboard.ai`);
})();
