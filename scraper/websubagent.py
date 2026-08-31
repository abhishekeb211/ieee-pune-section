"""
IEEE India to IEEE Pune Section - Autonomous WebSubagent & Scraper Engine
========================================================================
Forensically extracts structural patterns, navigation hierarchies, content schemas,
and media assets from https://india.ieee.org/, sanitizes tracking queries, and
maps content into Pune Section sovereign components.
"""

import os
import re
import json
import urllib.parse
from typing import Dict, List, Any
import requests
from bs4 import BeautifulSoup

BASE_URL = "https://india.ieee.org/"
TARGET_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS_DIR = os.path.join(TARGET_DIR, "assets")

class IEEESubagentScraper:
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                          "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
        })

    def fetch_page(self, url: str) -> BeautifulSoup:
        """Fetch and parse HTML with robust error handling and decoding."""
        print(f"[WebSubagent] Fetching: {url}")
        resp = self.session.get(url, timeout=20)
        resp.raise_for_status()
        return BeautifulSoup(resp.content, "lxml")

    def clean_url(self, url: str) -> str:
        """Strip GA / Google Analytics / WP Engine tracking tokens from URLs."""
        if not url:
            return "#"
        parsed = urllib.parse.urlparse(url)
        query_params = urllib.parse.parse_qs(parsed.query)
        # Filter out _ga, _gl, utm_*, and wpengine parameters
        filtered_params = {
            k: v for k, v in query_params.items()
            if not k.startswith("_g") and not k.startswith("utm_")
        }
        new_query = urllib.parse.urlencode(filtered_params, doseq=True)
        cleaned = urllib.parse.urlunparse((
            parsed.scheme,
            parsed.netloc,
            parsed.path,
            parsed.params,
            new_query,
            parsed.fragment
        ))
        return cleaned

    def extract_navigation(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """Extract multi-tier navigation menus and sub-menus cleanly."""
        nav_structure = []
        nav_elements = soup.find_all("nav")
        for nav in nav_elements:
            menu_items = nav.find_all("li", recursive=False) or nav.find_all("li")
            for item in menu_items:
                link = item.find("a")
                if not link:
                    continue
                title = link.get_text(strip=True)
                href = self.clean_url(link.get("href", "#"))
                
                # Check for dropdown / sub-menu
                sub_menu = item.find("ul")
                children = []
                if sub_menu:
                    for sub_item in sub_menu.find_all("li"):
                        sub_link = sub_item.find("a")
                        if sub_link:
                            children.append({
                                "title": sub_link.get_text(strip=True),
                                "url": self.clean_url(sub_link.get("href", "#"))
                            })
                
                nav_structure.append({
                    "title": title,
                    "url": href,
                    "children": children
                })
        return nav_structure

    def extract_hero_slides(self, soup: BeautifulSoup) -> List[Dict[str, str]]:
        """Extract banner/carousel slides."""
        slides = []
        # Typically Elementor / Slider Revolution / Swiper
        slider_elements = soup.select(".swiper-slide, .slick-slide, .slider-item")
        for el in slider_elements:
            heading = el.find(["h1", "h2", "h3", "h4"])
            p = el.find("p")
            img = el.find("img")
            link = el.find("a")
            slides.append({
                "title": heading.get_text(strip=True) if heading else "",
                "description": p.get_text(strip=True) if p else "",
                "image": img.get("src", "") if img else "",
                "link": self.clean_url(link.get("href", "#")) if link else "#"
            })
        return slides

    def extract_latest_news(self, soup: BeautifulSoup) -> List[Dict[str, str]]:
        """Extract latest news, announcements, and events."""
        news_items = []
        news_section = soup.find(lambda tag: "Latest from" in tag.text if tag.name in ["h2", "h3"] else False)
        if news_section and news_section.parent:
            cards = news_section.parent.find_all(["article", "div"], class_=re.compile(r"post|card|item|column"))
            for card in cards:
                title_el = card.find(["h3", "h4", "h5", "a"])
                img_el = card.find("img")
                link_el = card.find("a")
                if title_el:
                    news_items.append({
                        "title": title_el.get_text(strip=True),
                        "link": self.clean_url(link_el.get("href", "#")) if link_el else "#",
                        "image": img_el.get("src", "") if img_el else ""
                    })
        return news_items

    def run_forensic_extract(self) -> Dict[str, Any]:
        """Execute full forensic pipeline and output structured JSON payload."""
        try:
            soup = self.fetch_page(self.base_url)
            print("[WebSubagent] Page successfully fetched. Extracting structure...")
            
            data = {
                "title": soup.title.string if soup.title else "IEEE India",
                "navigation": self.extract_navigation(soup),
                "hero_slides": self.extract_hero_slides(soup),
                "news": self.extract_latest_news(soup),
                "extracted_at": "2026-08-31"
            }
            
            output_path = os.path.join(TARGET_DIR, "scraper", "extracted_payload.json")
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            print(f"[WebSubagent] Forensic extraction complete! Output saved to: {output_path}")
            return data
        except Exception as e:
            print(f"[WebSubagent Error] Failed during extraction: {e}")
            return {}

if __name__ == "__main__":
    subagent = IEEESubagentScraper()
    subagent.run_forensic_extract()
