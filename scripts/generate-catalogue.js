// scripts/generate-catalogue.js
const fs = require('fs');
const path = require('path');

const CONFIG = {
  repoName: 'Solution-architecture-skill-repository',
  username: 'baradhili',
  creator: 'Bret Watson',
  publisher: 'IT Interim Management',
  license: 'CC-BY-4.0',
  baseUrl: 'https://baradhili.github.io/Solution-architecture-skill-repository'
};

const BASE_URL = `https://${CONFIG.username}.github.io/${CONFIG.repoName}`;

// Read and parse all skill files
function loadSkills() {
  const skillsDir = path.join(__dirname, '..', 'skills');
  const files = fs.readdirSync(skillsDir).filter(f => f.endsWith('.jsonld'));
  
  return files.map(file => {
    const content = JSON.parse(fs.readFileSync(path.join(skillsDir, file), 'utf8'));
    return {
      id: content.identifier,
      name: content.abbreviatedStatement,
      description: content.fullStatement,
      keywords: content.conceptKeywords || [],
      file: file,
      url: `${BASE_URL}/skills/${file}`,
      subject: content.subject,
      educationLevel: content.educationLevel || []
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
}

// Generate Open Graph / Twitter Card meta tags
function generateMetaTags(title, description, url, image = null) {
  const siteUrl = BASE_URL;
  const imgUrl = image || `${BASE_URL}/og-image.png`; // Fallback image
  
  return `
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${imgUrl}">
    <meta property="og:site_name" content="${CONFIG.publisher}">
    <meta property="og:locale" content="en_US">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${url}">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${imgUrl}">
    
    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Dataset",
      "name": "${title}",
      "description": "${description}",
      "creator": {
        "@type": "Person",
        "name": "${CONFIG.creator}"
      },
      "publisher": {
        "@type": "Organization",
        "name": "${CONFIG.publisher}"
      },
      "license": "https://creativecommons.org/licenses/by/4.0/",
      "url": "${url}",
      "distribution": {
        "@type": "DataDownload",
        "encodingFormat": "application/ld+json",
        "contentUrl": "${BASE_URL}/skills.json"
      }
    }
    </script>`;
}

// Generate HTML catalogue page
function generateCatalogueHTML(skills, isSubdirectory = false) {
  const title = isSubdirectory 
    ? 'Skills Catalogue • IT Solution Architect Framework' 
    : 'IT Solution Architect Competency Framework';
  
  const description = isSubdirectory
    ? `Browse ${skills.length} Rich Skill Descriptors for IT Solution Architects in CASE-LD v1.1 format.`
    : `A MECE skill catalogue for IT Solution Architects using Rich Skill Descriptors (RSD) and CASE-LD v1.1. ${skills.length} skills covering architecture, cloud, data, security, and leadership.`;
  
  const currentPath = isSubdirectory ? '../' : '';
  const skillsJsonPath = isSubdirectory ? '../skills.json' : 'skills.json';
  
  const skillsHtml = skills.map(skill => `
    <article class="skill-card" data-search="${(skill.name + ' ' + skill.id + ' ' + skill.keywords.join(' ')).toLowerCase()}">
      <header>
        <h3 class="skill-title">${skill.name}</h3>
        <code class="skill-id">${skill.id}</code>
      </header>
      <p class="skill-desc">${skill.description}</p>
      ${skill.keywords.length > 0 ? `
        <div class="skill-keywords">
          ${skill.keywords.slice(0, 4).map(k => `<span class="keyword">${k}</span>`).join('')}
          ${skill.keywords.length > 4 ? `<span class="keyword more">+${skill.keywords.length - 4}</span>` : ''}
        </div>` : ''}
      <footer class="skill-links">
        <a href="${currentPath}skills/${skill.file}" class="btn btn-primary" target="_blank" rel="noopener">View JSON-LD</a>
        <a href="${skill.url}" class="btn btn-outline" target="_blank" rel="noopener">Direct URL</a>
        <button class="btn btn-copy" data-clipboard="${skill.url}">Copy URL</button>
      </footer>
    </article>
  `).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  ${generateMetaTags(title, description, isSubdirectory ? `${BASE_URL}/skills/` : BASE_URL)}
  <style>
    :root { --bg: #0d1117; --text: #e6edf3; --accent: #58a6ff; --border: #30363d; --card: #161b22; --success: #3fb950; --warning: #d29922; }
    @media (prefers-color-scheme: light) { :root { --bg: #fff; --text: #1f2328; --accent: #0969da; --border: #d0d7de; --card: #f6f8fa; } }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; background: var(--bg); color: var(--text); line-height: 1.5; padding: 1.5rem; }
    .container { max-width: 1400px; margin: 0 auto; }
    header { border-bottom: 1px solid var(--border); padding-bottom: 1.5rem; margin-bottom: 2rem; }
    h1 { font-size: 1.8rem; margin-bottom: 0.5rem; }
    .meta { color: #8b949e; font-size: 0.9rem; display: flex; flex-wrap: wrap; gap: 1rem; }
    .meta strong { color: var(--text); }
    .search-section { margin: 1.5rem 0; display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; }
    #searchInput { flex: 1; min-width: 200px; padding: 0.6rem 1rem; border: 1px solid var(--border); border-radius: 6px; background: var(--card); color: var(--text); font-size: 1rem; }
    #searchInput:focus { outline: 2px solid var(--accent); border-color: transparent; }
    .filters { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .filter-btn { padding: 0.4rem 0.8rem; border: 1px solid var(--border); border-radius: 6px; background: var(--card); color: var(--text); cursor: pointer; font-size: 0.85rem; transition: all 0.2s; }
    .filter-btn:hover, .filter-btn.active { border-color: var(--accent); background: var(--accent); color: #fff; }
    .stats { color: #8b949e; font-size: 0.9rem; margin: 1rem 0; }
    .skills-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem; }
    .skill-card { background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 1.25rem; transition: border-color 0.2s, transform 0.1s; display: flex; flex-direction: column; gap: 0.75rem; }
    .skill-card:hover { border-color: var(--accent); transform: translateY(-2px); }
    .skill-card header { border: none; padding: 0; margin: 0; }
    .skill-title { font-weight: 600; color: var(--accent); font-size: 1.1rem; margin: 0; }
    .skill-id { font-family: ui-monospace, SFMono-Regular, monospace; font-size: 0.8rem; color: #8b949e; background: rgba(136,144,156,0.1); padding: 0.2rem 0.5rem; border-radius: 4px; display: inline-block; }
    .skill-desc { font-size: 0.95rem; color: #8b949e; margin: 0; flex-grow: 1; }
    .skill-keywords { display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .keyword { font-size: 0.75rem; padding: 0.2rem 0.5rem; background: rgba(88,166,255,0.15); color: var(--accent); border-radius: 4px; }
    .keyword.more { background: rgba(136,144,156,0.2); color: #8b949e; }
    .skill-links { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: auto; }
    .btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.9rem; border-radius: 6px; font-size: 0.85rem; font-weight: 500; text-decoration: none; cursor: pointer; border: none; transition: all 0.2s; }
    .btn-primary { background: var(--accent); color: #fff; }
    .btn-primary:hover { opacity: 0.9; }
    .btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text); }
    .btn-outline:hover { border-color: var(--accent); }
    .btn-copy { background: transparent; border: 1px solid var(--border); color: #8b949e; font-size: 0.8rem; padding: 0.4rem 0.7rem; }
    .btn-copy:hover { border-color: var(--success); color: var(--success); }
    .btn-copy.copied { color: var(--success); border-color: var(--success); }
    footer { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid var(--border); font-size: 0.85rem; color: #8b949e; display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; justify-content: space-between; }
    footer a { color: var(--accent); text-decoration: none; }
    footer a:hover { text-decoration: underline; }
    .hidden { display: none !important; }
    .toast { position: fixed; bottom: 2rem; right: 2rem; background: var(--success); color: #fff; padding: 0.75rem 1.25rem; border-radius: 8px; font-size: 0.9rem; box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideIn 0.3s ease; z-index: 1000; }
    @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @media (max-width: 768px) { .skills-grid { grid-template-columns: 1fr; } .search-section { flex-direction: column; align-items: stretch; } }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${isSubdirectory ? '📚 Skills Catalogue' : '🏗️ IT Solution Architect Competency Framework'}</h1>
      <div class="meta">
        <span><strong>ID:</strong> ITSA-FW-2026</span>
        <span><strong>Version:</strong> 1.0.0</span>
        <span><strong>License:</strong> <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank">${CONFIG.license}</a></span>
        <span><strong>Format:</strong> CASE-LD v1.1</span>
      </div>
      <div class="meta">
        <span><strong>Creator:</strong> ${CONFIG.creator}</span>
        <span><strong>Publisher:</strong> ${CONFIG.publisher}</span>
        <span><strong>Skills:</strong> ${skills.length}</span>
      </div>
    </header>

    <section class="search-section">
      <input type="text" id="searchInput" placeholder="🔍 Search skills by name, ID, or keyword..." aria-label="Search skills">
      <div class="filters" id="filterContainer">
        <button class="filter-btn active" data-filter="all">All</button>
        <button class="filter-btn" data-filter="cloud">Cloud</button>
        <button class="filter-btn" data-filter="data">Data</button>
        <button class="filter-btn" data-filter="security">Security</button>
        <button class="filter-btn" data-filter="integration">Integration</button>
        <button class="filter-btn" data-filter="leadership">Leadership</button>
      </div>
    </section>

    <div class="stats" id="statsBar">Showing <strong>${skills.length}</strong> of <strong>${skills.length}</strong> skills</div>

    <main class="skills-grid" id="skillsGrid">
      ${skillsHtml}
    </main>

    <footer>
      <div>
        <strong>Framework:</strong> 
        <a href="${currentPath}framework/it-solution-architect-framework.jsonld" target="_blank">JSON-LD</a> • 
        <a href="${currentPath}skills.json" target="_blank">Skills API</a> • 
        <a href="https://github.com/${CONFIG.username}/${CONFIG.repoName}" target="_blank">GitHub</a>
      </div>
      <div>
        Generated: <time datetime="${new Date().toISOString()}">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</time>
      </div>
    </footer>
  </div>

  <script>
    const skills = ${JSON.stringify(skills, null, 2)};
    const baseUrl = "${BASE_URL}";
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const skillsGrid = document.getElementById('skillsGrid');
    const statsBar = document.getElementById('statsBar');
    
    function filterSkills(query = '', category = 'all') {
      const cards = skillsGrid.querySelectorAll('.skill-card');
      let visibleCount = 0;
      
      cards.forEach(card => {
        const searchData = card.dataset.search || '';
        const matchesQuery = !query || searchData.includes(query.toLowerCase());
        const matchesCategory = category === 'all' || 
          card.querySelector('.skill-title').textContent.toLowerCase().includes(category) ||
          card.querySelector('.skill-desc').textContent.toLowerCase().includes(category) ||
          Array.from(card.querySelectorAll('.keyword')).some(k => k.textContent.toLowerCase().includes(category));
        
        if (matchesQuery && matchesCategory) {
          card.classList.remove('hidden');
          visibleCount++;
        } else {
          card.classList.add('hidden');
        }
      });
      
      statsBar.innerHTML = \`Showing <strong>\${visibleCount}</strong> of <strong>\${skills.length}</strong> skills\`;
    }
    
    searchInput.addEventListener('input', (e) => {
      const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
      filterSkills(e.target.value, activeFilter);
    });
    
    // Category filters
    document.getElementById('filterContainer').addEventListener('click', (e) => {
      if (e.target.classList.contains('filter-btn')) {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        filterSkills(searchInput.value, e.target.dataset.filter);
      }
    });
    
    // Copy URL functionality
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-copy')) {
        const url = e.target.dataset.clipboard;
        navigator.clipboard.writeText(url).then(() => {
          const btn = e.target;
          btn.textContent = '✓ Copied!';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.textContent = 'Copy URL';
            btn.classList.remove('copied');
          }, 2000);
        });
      }
    });
    
    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
      filterSkills();
      
      // Add keyboard shortcut: Ctrl/Cmd + K to focus search
      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          searchInput.focus();
          searchInput.select();
        }
      });
    });
  </script>
</body>
</html>`;
}

// Generate skills.json API export
function generateSkillsJson(skills) {
  return {
    "@context": "https://purl.imsglobal.org/spec/case/v1p1/context/imscasev1p1_context_v1p1.jsonld",
    type: "CFItem",
    id: `${BASE_URL}/skills.json`,
    identifier: "ITSA-SKILLS-INDEX",
    abbreviatedStatement: "IT Solution Architect Skills Index",
    fullStatement: `Machine-readable index of ${skills.length} Rich Skill Descriptors in CASE-LD v1.1 format for API consumption and programmatic access.`,
    conceptKeywords: ["index", "catalogue", "CASE-LD", "RSD", "API", "IT Solution Architecture"],
    language: "en",
    licenseURI: {
      title: "Creative Commons Attribution 4.0",
      identifier: CONFIG.license,
      uri: "https://creativecommons.org/licenses/by/4.0/"
    },
    CFDocumentURI: {
      type: "LinkURI",
      title: "IT Solution Architect Competency Framework",
      identifier: "ITSA-FW-2026",
      targetId: `${BASE_URL}/framework/it-solution-architect-framework.jsonld`
    },
    isChildOf: {
      type: "LinkURI",
      targetId: '${BASE_URL}/framework/it-solution-architect-framework.jsonld'
    },
    skills: skills.map(skill => ({
      identifier: skill.id,
      abbreviatedStatement: skill.name,
      fullStatement: skill.description,
      conceptKeywords: skill.keywords,
      subject: skill.subject,
      educationLevel: skill.educationLevel,
      url: skill.url,
      file: skill.file
    })),
    lastChangeDateTime: new Date().toISOString(),
    version: "1.0.0"
  };
}

// Main execution
function main() {
  console.log('🚀 Generating CASE-LD catalogue assets...');
  
  const skills = loadSkills();
  console.log('✅ Loaded ${skills.length} skills from skills/*.jsonld');
  
  // Generate root index.html with Open Graph metadata
  const rootIndex = generateCatalogueHTML(skills, false);
  fs.writeFileSync(path.join(__dirname, '..', 'index.html'), rootIndex, 'utf8');
  console.log('✅ Generated index.html (root)');
  
  // Generate skills/index.html for subdirectory browsing
  const skillsIndex = generateCatalogueHTML(skills, true);
  const skillsDir = path.join(__dirname, '..', 'skills');
  if (!fs.existsSync(skillsDir)) fs.mkdirSync(skillsDir, { recursive: true });
  fs.writeFileSync(path.join(skillsDir, 'index.html'), skillsIndex, 'utf8');
  console.log('✅ Generated skills/index.html');
  
  // Generate skills.json API export
  const skillsJson = generateSkillsJson(skills);
  fs.writeFileSync(path.join(__dirname, '..', 'skills.json'), JSON.stringify(skillsJson, null, 2), 'utf8');
  console.log('✅ Generated skills.json');
  
  console.log('✨ Catalogue assets generated successfully!');
  console.log('🌐 Preview at: ${BASE_URL}');
}

main();