/**
 * Responsive overflow + layout smoke test across pages/widths.
 * Usage: npx --yes -p playwright node scripts/responsive-check.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:5173';
const pages = [
  'index.html', 'about.html', 'speakers.html', 'events.html', 'membership.html',
  'contact.html', 'venue.html', 'chapters.html', 'india-ecosystem.html',
  'proceedings.html', 'education.html', 'standards.html', 'tracks.html',
  'resources.html', 'committee.html'
];
const widths = [360, 480, 768, 1024, 1280, 1440];
const landscape = { width: 740, height: 360 };

const failures = [];
const notes = [];

async function measure(page, label) {
  return page.evaluate((lbl) => {
    document.body.style.setProperty('overflow-x', 'visible', 'important');
    document.documentElement.style.setProperty('overflow-x', 'visible', 'important');
    const cw = document.documentElement.clientWidth;
    const sw = document.documentElement.scrollWidth;
    const overflow = sw > cw + 1;
    let offender = null;
    if (overflow) {
      let worst = 0;
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (r.right > worst + 0.5) {
          worst = r.right;
          const cls = (el.className && typeof el.className === 'string')
            ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
            : '';
          offender = el.tagName.toLowerCase() + cls + `@${Math.round(r.right)}`;
        }
      }
    }

    const hero = document.querySelector('.hero-buttons');
    const glance = document.querySelector('.glance-grid');
    const sponsors = document.querySelector('.sponsor-strip');
    const search = document.querySelector('.header-search');
    const toggle = document.querySelector('.mobile-nav-toggle');
    const tabNav = document.querySelector('.ux-tab-nav');
    const pills = document.querySelector('.ux-filter-pills');
    const grid = document.querySelector('.ux-grid-compact');

    const cs = (el) => (el ? getComputedStyle(el) : null);
    return {
      label: lbl,
      cw, sw, overflow, offender,
      heroFlex: hero ? cs(hero).flexDirection : null,
      glanceCols: glance ? cs(glance).gridTemplateColumns.split(' ').filter(Boolean).length : null,
      sponsorFlex: sponsors ? cs(sponsors).flexDirection : null,
      searchDisplay: search ? cs(search).display : null,
      toggleDisplay: toggle ? cs(toggle).display : null,
      tabMaxWidth: tabNav ? cs(tabNav).maxWidth : null,
      pillsWrap: pills ? cs(pills).flexWrap : null,
      gridCols: grid ? cs(grid).gridTemplateColumns : null,
    };
  }, label);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

for (const w of widths) {
  await page.setViewportSize({ width: w, height: w <= 480 ? 800 : 900 });
  for (const p of pages) {
    const url = `${BASE}/${p === 'index.html' ? '' : p}`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const m = await measure(page, `${p}@${w}`);
    if (m.overflow) {
      failures.push(`${m.label} overflow sw=${m.sw} cw=${m.cw} offender=${m.offender}`);
    }
    // Desktop expectations
    if (w >= 1024 && p === 'index.html') {
      if (m.heroFlex !== 'row') failures.push(`${m.label} heroButtons expected row got ${m.heroFlex}`);
      if (m.sponsorFlex !== 'row') failures.push(`${m.label} sponsors expected row got ${m.sponsorFlex}`);
      if (m.glanceCols !== null && m.glanceCols < 3) failures.push(`${m.label} glance cols=${m.glanceCols}`);
      if (m.searchDisplay === 'none') failures.push(`${m.label} search hidden on desktop`);
    }
    // Tablet/phone expectations
    if (w <= 768) {
      if (m.toggleDisplay === 'none') failures.push(`${m.label} mobile toggle not visible`);
    }
    if (w <= 480 && p === 'index.html') {
      if (m.heroFlex !== 'column') notes.push(`${m.label} heroFlex=${m.heroFlex}`);
    }
    if (w >= 520 && w <= 768 && m.gridCols) {
      const colCount = m.gridCols.split(' ').filter(Boolean).length;
      if (colCount < 2) notes.push(`${m.label} ux-grid cols=${colCount} (want 2)`);
    }
  }
}

// Landscape phone
await page.setViewportSize(landscape);
await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
const land = await measure(page, 'index@landscape');
if (land.overflow) failures.push(`${land.label} overflow sw=${land.sw} cw=${land.cw} offender=${land.offender}`);

await browser.close();

console.log('=== RESPONSIVE CHECK ===');
console.log(`Checked ${pages.length} pages x ${widths.length} widths + landscape`);
if (notes.length) {
  console.log('Notes:');
  notes.forEach(n => console.log('  - ' + n));
}
if (failures.length) {
  console.log('FAILURES:');
  failures.forEach(f => console.log('  ! ' + f));
  process.exit(1);
} else {
  console.log('ALL PASS — no horizontal overflow; desktop multi-column restored');
  process.exit(0);
}
