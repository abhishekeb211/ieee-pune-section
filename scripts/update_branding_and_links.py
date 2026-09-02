import os
import glob
import re

SVG_BRAND_BLOCK_PATTERN = re.compile(
    r'<a\s+href="index\.html"\s+class="brand-identity"[^>]*>.*?'
    r'<svg\s+class="brand-logo-ieee".*?</svg>\s*'
    r'<div\s+class="brand-divider"></div>\s*'
    r'<div\s+class="brand-text-group">.*?'
    r'</div>\s*</a>',
    re.DOTALL
)

NEW_BRAND_BLOCK = '''<a href="index.html" class="brand-identity" aria-label="IEEE Blockchain Pune Section Home">
          <img src="images/ieee-blockchain-pune-logo.svg" alt="IEEE Blockchain Pune Section Logo" class="brand-logo-img">
          <div class="brand-divider"></div>
          <div class="brand-text-group">
            <span class="brand-title">BLOCKCHAIN PUNE SECTION</span>
            <span class="brand-subtitle">Pune Section &bull; Region 10 (Asia-Pacific)</span>
            <span class="brand-tagline">Advancing Trusted Decentralized Systems</span>
          </div>
        </a>'''

YOUTUBE_SVG = '<a href="https://www.youtube.com/@IEEEBlockchainTechnicalCommuni" target="_blank" rel="noopener" title="YouTube" aria-label="YouTube"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>'

def update_html_files():
    html_files = glob.glob("*.html")
    updated = 0
    for filepath in html_files:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        new_content = content
        
        # 1. Update brand identity block
        if "brand-logo-ieee" in new_content:
            new_content = SVG_BRAND_BLOCK_PATTERN.sub(NEW_BRAND_BLOCK, new_content)

        # 2. Update favicon
        new_content = re.sub(
            r'<link\s+rel="icon"\s+type="image/svg\+xml"\s+href="data:image/svg\+xml,[^"]+">',
            '<link rel="icon" type="image/svg+xml" href="images/ieee-blockchain-pune-logo.svg">',
            new_content
        )

        # 3. Add YouTube link to utility-social if not present
        if "youtube.com/@IEEEBlockchainTechnicalCommuni" not in new_content:
            new_content = re.sub(
                r'(<a\s+href="https://www\.facebook\.com/IEEEBlockchain/"[^>]*>.*?</a>)(\s*</div>)',
                r'\1\n        ' + YOUTUBE_SVG + r'\2',
                new_content,
                flags=re.DOTALL
            )

        if new_content != content:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(new_content)
            updated += 1
            print(f"Updated branding in: {filepath}")

    print(f"Total HTML files updated: {updated}")

if __name__ == "__main__":
    update_html_files()
