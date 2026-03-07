// Demo page showing how to use the FJB embed widget
// Accessible at: app.freejobboard.ai/embed/demo

export default function EmbedDemoPage() {
  const exampleCode = `<!-- Add this where you want jobs to appear on your website -->
<div id="fjb-jobs"></div>
<script 
  src="https://app.freejobboard.ai/embed/v1.js" 
  data-board="YOUR-BOARD-SLUG">
</script>`;

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Embed Your Job Board</h1>
          <p className="text-slate-500 text-lg">
            Add a careers section to any website with one line of code. Free, forever.
          </p>
        </div>

        {/* How it works */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">How to embed</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
              <div>
                <p className="font-medium text-slate-800">Copy the code below</p>
                <p className="text-sm text-slate-500 mt-1">Replace <code className="bg-slate-100 px-1 rounded text-xs">YOUR-BOARD-SLUG</code> with your board&apos;s slug (found in your dashboard URL).</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
              <div>
                <p className="font-medium text-slate-800">Paste it on your website</p>
                <p className="text-sm text-slate-500 mt-1">Works with any website builder — WordPress, Squarespace, Webflow, Wix, custom HTML. Paste in your careers/jobs page.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
              <div>
                <p className="font-medium text-slate-800">That&apos;s it</p>
                <p className="text-sm text-slate-500 mt-1">Your live job listings appear instantly. When you update jobs in your dashboard, the embed updates automatically.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Code block */}
        <div className="bg-slate-900 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-400 text-xs font-mono">embed code</span>
          </div>
          <pre className="text-emerald-400 text-sm font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
            {exampleCode}
          </pre>
        </div>

        {/* Options */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Options</h2>
          <div className="space-y-3">
            <div className="flex gap-4 text-sm">
              <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono text-slate-700 flex-shrink-0">data-board</code>
              <span className="text-slate-600"><strong>Required.</strong> Your board slug (e.g. <code className="bg-slate-100 px-1 rounded text-xs">fanpark</code>).</span>
            </div>
            <div className="flex gap-4 text-sm">
              <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono text-slate-700 flex-shrink-0">data-container</code>
              <span className="text-slate-600"><strong>Optional.</strong> ID of the element to render jobs into. Defaults to <code className="bg-slate-100 px-1 rounded text-xs">fjb-jobs</code>.</span>
            </div>
          </div>
        </div>

        {/* Live preview */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Live preview</h2>
          <p className="text-sm text-slate-500 mb-6">This is what the embed looks like on your site — using the FANPARK board as a demo.</p>
          <div id="fjb-jobs-demo" className="min-h-[100px]">
            <div className="text-slate-400 text-sm text-center py-8">Loading preview...</div>
          </div>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                fetch('/api/embed/fanpark')
                  .then(r => r.json())
                  .then(data => {
                    var s = document.createElement('script');
                    s.src = '/embed/v1.js';
                    s.setAttribute('data-board', 'fanpark');
                    s.setAttribute('data-container', 'fjb-jobs-demo');
                    document.body.appendChild(s);
                  })
                  .catch(() => {
                    document.getElementById('fjb-jobs-demo').innerHTML = '<p style="color:#94a3b8;text-align:center;font-size:14px;">Preview unavailable</p>';
                  });
              `
            }}
          />
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          Need help?{' '}
          <a href="mailto:chris@freejobboard.ai" className="text-indigo-500 hover:underline">
            chris@freejobboard.ai
          </a>
        </p>
      </div>
    </div>
  );
}
