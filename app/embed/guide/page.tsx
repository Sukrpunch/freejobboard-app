// Installation guide for the FJB embed widget
// Accessible at: app.freejobboard.ai/embed/guide

export const metadata = {
  title: 'Embed Installation Guide — FreeJobBoard.ai',
  description: 'Step-by-step instructions for adding your FreeJobBoard.ai job listings to WordPress, Squarespace, Wix, Webflow, Framer, and any custom website.',
};

const EMBED_CODE = `<div id="fjb-jobs"></div>
<script
  src="https://app.freejobboard.ai/embed/v1.js"
  data-board="YOUR-BOARD-SLUG">
</script>`;

const platforms = [
  {
    name: 'WordPress',
    icon: '🔷',
    steps: [
      'Log in to your WordPress dashboard.',
      'Go to Pages → find your careers or jobs page → click Edit.',
      'Click the blue + button to add a new block.',
      'Search for "Custom HTML" and select it.',
      'Paste your embed code into the HTML block.',
      'Click Update (or Publish) to save.',
      'Visit the page — your job listings will appear.',
    ],
    note: 'Using Elementor or Divi? Look for an "HTML" or "Code" widget and paste your embed code there instead.',
  },
  {
    name: 'Squarespace',
    icon: '⬛',
    steps: [
      'Open your Squarespace site editor.',
      'Navigate to the page where you want jobs to appear.',
      'Click the + button to add a content block.',
      'Choose "Code" from the block menu.',
      'Paste your embed code into the code block.',
      'Click Apply, then Save.',
    ],
    note: 'Squarespace requires a Business plan or higher to use Code blocks.',
  },
  {
    name: 'Wix',
    icon: '🔶',
    steps: [
      'Open your Wix Editor.',
      'Click + Add Elements in the left panel.',
      'Select "Embed & Social" → "Embed a Widget" (HTML iframe).',
      'Click "Enter Code" in the widget that appears on your page.',
      'Paste your embed code and click Apply.',
      'Resize and reposition the widget as needed.',
      'Publish your site.',
    ],
    note: 'In Wix Studio, use an "HTML Embed" element from the Add Panel.',
  },
  {
    name: 'Webflow',
    icon: '💠',
    steps: [
      'Open your Webflow Designer.',
      'In the left panel, click the + (Add Elements) icon.',
      'Find "Embed" under Components and drag it onto your page.',
      'Double-click the Embed element to open the code editor.',
      'Paste your embed code and click Save & Close.',
      'Publish your site.',
    ],
    note: 'The Embed element is only available on paid Webflow plans.',
  },
  {
    name: 'Framer',
    icon: '🔮',
    steps: [
      'Open your Framer project.',
      'From the left panel, click Insert (+).',
      'Select "Embed" from the components list.',
      'Click on the Embed component on your canvas.',
      'In the right panel, paste your embed code into the "HTML" field.',
      'Publish your site.',
    ],
    note: 'Framer embeds work on all plans.',
  },
  {
    name: 'Showit',
    icon: '🟣',
    steps: [
      'Open your Showit design canvas.',
      'Click on the page where you want the jobs to appear.',
      'Add a new canvas element → select "Widget/Embed".',
      'Paste your embed code into the HTML field.',
      'Save and publish.',
    ],
    note: 'Popular with photographers and event businesses — great fit for FANPARK-style companies.',
  },
  {
    name: 'Raw HTML / Custom Site',
    icon: '🖥️',
    steps: [
      'Open the HTML file for your careers or jobs page.',
      'Find the location in the page body where you want the jobs to appear.',
      'Paste your embed code directly into the HTML at that location.',
      'Save the file and upload/deploy it to your server.',
    ],
    note: 'Works with any HTML page, static site generator (Hugo, Jekyll, Eleventy, Astro), or CMS with custom HTML support.',
  },
];

export default function EmbedGuidePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-slate-900 text-white px-6 py-12 print:bg-white print:text-slate-900 print:border-b print:border-slate-200">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🔌</span>
            <span className="text-slate-400 text-sm font-medium print:text-slate-500">FreeJobBoard.ai</span>
          </div>
          <h1 className="text-3xl font-bold mb-3">Embed Installation Guide</h1>
          <p className="text-slate-300 text-lg print:text-slate-600">
            Add your job listings to any website in minutes. Pick your platform below for step-by-step instructions.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">

        {/* Your embed code */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3 print:break-inside-avoid">
          <h2 className="font-bold text-slate-900 text-lg">Your embed code</h2>
          <p className="text-sm text-slate-500">
            Replace <code className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-xs font-mono">YOUR-BOARD-SLUG</code> with your board slug (the part before <code className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-xs font-mono">.freejobboard.ai</code> in your board URL).
          </p>
          <pre className="bg-slate-900 text-emerald-400 text-sm font-mono rounded-xl p-4 overflow-x-auto whitespace-pre-wrap print:bg-slate-100 print:text-slate-800">
            {EMBED_CODE}
          </pre>
          <p className="text-xs text-slate-400">
            💡 <strong>Example:</strong> If your board is at <code className="bg-slate-100 px-1 rounded text-xs">fanpark.freejobboard.ai</code>, your slug is <code className="bg-slate-100 px-1 rounded text-xs">fanpark</code>.
          </p>
        </div>

        {/* Platform guides */}
        <div>
          <h2 className="font-bold text-slate-900 text-xl mb-6">Installation by platform</h2>
          <div className="space-y-8">
            {platforms.map((platform, i) => (
              <div key={platform.name} className="border border-slate-200 rounded-2xl overflow-hidden print:break-inside-avoid">
                {/* Platform header */}
                <div className="bg-slate-50 px-6 py-4 flex items-center gap-3 border-b border-slate-200">
                  <span className="text-xl">{platform.icon}</span>
                  <h3 className="font-bold text-slate-900">{platform.name}</h3>
                  <span className="ml-auto text-xs text-slate-400">{platform.steps.length} steps</span>
                </div>
                {/* Steps */}
                <div className="px-6 py-5">
                  <ol className="space-y-3">
                    {platform.steps.map((step, j) => (
                      <li key={j} className="flex gap-3 text-sm">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                          {j + 1}
                        </span>
                        <span className="text-slate-700 leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                  {platform.note && (
                    <div className="mt-4 flex gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                      <span className="text-amber-500 flex-shrink-0">💡</span>
                      <p className="text-xs text-amber-800 leading-relaxed">{platform.note}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="border border-slate-200 rounded-2xl p-6 space-y-4 print:break-inside-avoid">
          <h2 className="font-bold text-slate-900 text-lg">Troubleshooting</h2>
          <div className="space-y-4">
            {[
              ['Jobs aren\'t showing', 'Make sure your board slug is correct and that you have at least one active job listing in your dashboard.'],
              ['The embed looks broken', 'Some website builders sanitize HTML and strip <script> tags. Try switching to a dedicated "Code" or "Embed" block type rather than a text editor.'],
              ['Jobs show but styling looks off', 'The embed injects its own styles. If your site\'s CSS is conflicting, contact us and we\'ll add a custom style override for you.'],
              ['I need the jobs to open in a new tab', 'By default, Apply buttons link directly to the application URL or job detail page. This behavior is correct.'],
            ].map(([q, a]) => (
              <div key={q as string} className="space-y-1">
                <p className="text-sm font-semibold text-slate-800">❓ {q}</p>
                <p className="text-sm text-slate-500 ml-5">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="text-center py-6 border-t border-slate-100 print:break-inside-avoid">
          <p className="text-slate-500 text-sm">Still stuck? We're happy to help.</p>
          <a
            href="mailto:chris@freejobboard.ai"
            className="text-indigo-600 font-semibold text-sm hover:underline"
          >
            chris@freejobboard.ai
          </a>
          <p className="text-slate-400 text-xs mt-4">FreeJobBoard.ai — Free job boards for everyone.</p>
        </div>

      </div>
    </div>
  );
}
