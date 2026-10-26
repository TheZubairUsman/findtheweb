const fs = require('fs');
const path = require('path');

const categories = {
  'AI & Automation': [
    'How to Build a Reliable AI Agent Workflow in 2026', 'AI Automation vs AI Agents: Choosing the Right Architecture', 'A Practical Evaluation Checklist for LLM Features', 'How to Add Human Review to Automated Decisions', 'RAG Systems Explained: Retrieval That Actually Helps', 'Prompt Engineering for Repeatable Technical Work', 'How to Monitor AI Costs, Latency, and Quality', 'Designing Safe Browser Automation for Real Work', 'Multi-Agent Systems: Where Coordination Helps and Hurts', 'A Small-Team Playbook for Shipping AI Features'
  ],
  'Automation & No-Code': [
    'The No-Code Automation Stack for a One-Person Team', 'How to Map a Workflow Before Automating It', 'Webhooks, APIs, and Triggers: A Clear Beginner Guide', 'When No-Code Automation Becomes Technical Debt', 'How to Build Approval Steps into Business Automations', 'Reliable Spreadsheet Automation Without Data Chaos', 'Automation Testing for Non-Developers', 'How to Connect SaaS Tools Without Leaking Secrets', 'A Practical Comparison of Workflow Orchestration Patterns', 'From Manual Task to Measurable Automation in Seven Days'
  ],
  'Cloud & DevOps': [
    'A Production-Ready Cloud Deployment Checklist', 'Containers Explained for Teams Shipping Their First Service', 'How to Design Health Checks That Find Real Failures', 'CI/CD Pipelines: Fast Feedback Without Unsafe Releases', 'Blue-Green vs Canary Deployments for Small Teams', 'Secrets Management Without Putting Keys in Git', 'How to Cut Cloud Waste Without Cutting Reliability', 'Observability Basics: Logs, Metrics, and Traces Together', 'Backups and Rollbacks for Stateful Web Applications', 'Infrastructure as Code: A Safer Path from Laptop to Cloud'
  ],
  'Cybersecurity': [
    'OWASP Top 10 2025: A Developer-Friendly Action Plan', 'Threat Modeling a Modern Web Application', 'How to Secure Admin Panels and Privileged Routes', 'Password Reset and Email Verification Done Safely', 'API Rate Limiting That Protects Users Without Breaking UX', 'Practical Session and Token Security for JavaScript Apps', 'Supply-Chain Security for Open-Source Dependencies', 'How to Read a Security Finding and Fix the Root Cause', 'Privacy-Safe Analytics for Product Teams', 'A Small Business Incident Response Runbook'
  ],
  'Developer Tools': [
    'TypeScript in 2026: Why Types Help AI-Assisted Development', 'A Practical Guide to AI Coding Assistants and Code Review', 'Fast Python Tooling: Reproducible Environments with uv', 'How to Choose a Code Editor for Large Projects', 'Testing Generated Code Before It Reaches Production', 'Git Workflows That Keep Small Teams Moving', 'API Documentation That Developers Actually Use', 'Debugging JavaScript Across Browser and Server', 'Monorepo or Multi-Repo: A Decision Guide', 'How to Turn a Script into a Maintainable Tool'
  ],
  'Learning & Research': [
    'How to Learn a Technical Skill with Deliberate Practice', 'A Research Workflow for Finding Trustworthy Technical Sources', 'How to Read a Technical Paper Without Getting Lost', 'Building a Personal Knowledge Base That Stays Findable', 'Evidence, Inference, and Opinion: A Better Research Habit', 'How to Compare Tools Without Falling for Marketing Claims', 'A Practical Note-Taking System for Developers', 'How to Turn a Tutorial into Real Working Skill', 'Research Reproducibility for Small Engineering Projects', 'The 30-Day Plan for Becoming Better at Technical Writing'
  ],
  'Privacy & Data': [
    'Privacy by Design for Small Web Products', 'What Data Should Your Analytics Actually Collect?', 'A Practical Guide to Data Minimization', 'Cookies, Consent, and Honest Product UX', 'How to Review a SaaS Tool’s Data Practices', 'Encryption at Rest and in Transit Explained', 'Designing Deletion and Export Workflows Users Can Trust', 'Privacy Risks in AI Features and RAG Pipelines', 'Pseudonymization vs Anonymization: What Changes?', 'A Developer Checklist for Responsible Data Handling'
  ],
  'Remote Work': [
    'Designing a Remote Workspace That Reduces Context Switching', 'Async Communication: What to Write Down and What to Meet About', 'A Practical Remote Team Operating Manual', 'How to Run Better Technical Meetings', 'Remote Onboarding That Does Not Depend on Tribal Knowledge', 'Managing Deep Work Across Time Zones', 'Documentation as a Remote Team Superpower', 'How to Measure Remote Work Without Surveillance', 'Building Trust When the Team Rarely Meets Live', 'The Small-Team Toolkit for Calm Distributed Delivery'
  ],
  'Web Discovery': [
    'The FindTheWeb Method for Searching Less and Finding Better', 'How to Evaluate a Website Before You Bookmark It', 'A Better Way to Organize Useful Links', 'Search Intent: Turning a Question into a Better Result', 'How to Build a Personal Start Here Page', 'Curating Resources Without Creating Another Link Dump', 'A Practical Guide to Comparing Similar Websites', 'How to Discover Small Tools That Solve Specific Problems', 'Bookmarking for Teams: From Links to Shared Knowledge', 'The Anatomy of a Trustworthy Online Resource'
  ],
  'Web Performance & SEO': [
    'Core Web Vitals in Practice: LCP, INP, and CLS', 'Technical SEO for a JavaScript Website', 'How to Write Search Snippets People Want to Click', 'Structured Data for Articles, Breadcrumbs, and Organizations', 'A Practical Internal Linking Strategy for Growing Blogs', 'Image Optimization Without Sacrificing Editorial Quality', 'How to Audit a Sitemap and Robots File', 'Search Intent Mapping for a New Content Library', 'Page Experience: Performance, Accessibility, and Trust', 'How to Update Old Articles Without Losing Their Value'
  ],
};

const sources = {
  'AI & Automation': [['Gartner 2026 technology trends', 'https://www.gartner.com/en/articles/top-technology-trends-2026'], ['GitHub AI developer research', 'https://github.blog/news-insights/octoverse/the-new-identity-of-a-developer-what-changes-and-what-doesnt-in-the-ai-era/']],
  'Automation & No-Code': [['MDN Web APIs', 'https://developer.mozilla.org/en-US/docs/Web/API'], ['OWASP API Security', 'https://owasp.org/API-Security/']],
  'Cloud & DevOps': [['Google SRE workbook', 'https://sre.google/workbook/monitoring/'], ['AWS Well-Architected', 'https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html']],
  'Cybersecurity': [['OWASP Top 10 2025', 'https://owasp.org/Top10/2025/'], ['NIST Cybersecurity Framework', 'https://www.nist.gov/cyberframework']],
  'Developer Tools': [['GitHub Octoverse', 'https://octoverse.github.com/'], ['TypeScript handbook', 'https://www.typescriptlang.org/docs/handbook/intro.html']],
  'Learning & Research': [['Google Scholar search help', 'https://scholar.google.com/intl/en/scholar/help.html'], ['ACM Code of Professional Ethics', 'https://www.acm.org/code-of-ethics']],
  'Privacy & Data': [['NIST Privacy Framework', 'https://www.nist.gov/privacy-framework'], ['ICO data protection principles', 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles-a-guide-to-the-data-protection-principles/']],
  'Remote Work': [['GitLab remote handbook', 'https://handbook.gitlab.com/handbook/company/culture/all-remote/'], ['Microsoft Work Trend Index', 'https://www.microsoft.com/en-us/worklab/work-trend-index']],
  'Web Discovery': [['Google Search Central helpful content', 'https://developers.google.com/search/docs/fundamentals/creating-helpful-content'], ['Mozilla web literacy', 'https://foundation.mozilla.org/en/initiatives/web-literacy/']],
  'Web Performance & SEO': [['Google Search Central helpful content', 'https://developers.google.com/search/docs/fundamentals/creating-helpful-content'], ['web.dev performance', 'https://web.dev/learn/performance/']],
};

function slugify(value) { return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function escapeXml(value) { return String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[ch]); }
function cover(title, category) {
  const hue = Math.abs([...category].reduce((n, c) => n + c.charCodeAt(0), 0)) % 360;
  const words = title.split(' '); const lines = []; let line = '';
  words.forEach((word) => { if ((line + ' ' + word).trim().length > 26) { lines.push(line.trim()); line = word; } else line = (line + ' ' + word).trim(); }); if (line) lines.push(line);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="hsl(${hue},65%,22%)"/><stop offset="1" stop-color="hsl(${(hue + 55) % 360},70%,38%)"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/><circle cx="1030" cy="90" r="220" fill="rgba(255,255,255,.10)"/><circle cx="1080" cy="610" r="290" fill="rgba(255,255,255,.08)"/><path d="M760 430h260M860 330v200" stroke="#c7f36b" stroke-width="10" stroke-linecap="round" opacity=".8"/><text x="72" y="92" fill="#c7f36b" font-family="Arial" font-size="24" font-weight="700" letter-spacing="4">FINDTHEWEB · ${escapeXml(category.toUpperCase())}</text><text x="72" y="225" fill="white" font-family="Arial" font-size="52" font-weight="700">${lines.map((line, i) => `<tspan x="72" dy="${i ? 68 : 0}">${escapeXml(line)}</tspan>`).join('')}</text><text x="72" y="560" fill="rgba(255,255,255,.78)" font-family="Arial" font-size="22">Original field guide · 2026</text></svg>`;
}

const root = path.join(__dirname, '..');
const manifest = [];
Object.entries(categories).forEach(([category, titles]) => titles.forEach((title, index) => {
  const slug = slugify(title); manifest.push({ title, slug, category, index, sources: sources[category] });
  fs.mkdirSync(path.join(root, 'dist', 'editorial-covers'), { recursive: true });
  fs.writeFileSync(path.join(root, 'dist', 'editorial-covers', `${slug}.svg`), cover(title, category));
}));
fs.writeFileSync(path.join(root, 'backend', 'data', 'editorial-manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`Built ${manifest.length} editorial topics and covers.`);
