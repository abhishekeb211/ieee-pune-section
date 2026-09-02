import requests
from bs4 import BeautifulSoup
import json
import os

def parse_pune_data():
    r = requests.get('https://ieeepunesection.org/execom-2026/', headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}, timeout=15)
    soup = BeautifulSoup(r.text, 'lxml')

    members = []
    # Team Members plugin format: class .tmm_member
    for member in soup.find_all('div', class_='tmm_member'):
        name_elem = member.find('span', class_='tmm_fname')
        lname_elem = member.find('span', class_='tmm_lname')
        job_elem = member.find('span', class_='tmm_job')
        desc_elem = member.find('div', class_='tmm_desc')
        img_elem = member.find('img')
        
        first_name = name_elem.text.strip() if name_elem else ''
        last_name = lname_elem.text.strip() if lname_elem else ''
        full_name = f"{first_name} {last_name}".strip()
        job = job_elem.text.strip() if job_elem else ''
        desc = desc_elem.text.strip() if desc_elem else ''
        img = img_elem['src'] if img_elem and img_elem.has_attr('src') else ''
        
        if full_name:
            members.append({
                'name': full_name,
                'role': job,
                'affiliation': desc,
                'photo_url': img
            })

    print(f"Extracted {len(members)} IEEE Pune Section Execom members.")
    for m in members:
        print(f"• {m['role']} - {m['name']} ({m['affiliation']})")
        print(f"  Photo: {m['photo_url']}")

    os.makedirs('scraper/output', exist_ok=True)
    with open('scraper/output/pune_execom_2026.json', 'w', encoding='utf-8') as f:
        json.dump(members, f, indent=2, ensure_ascii=False)

    # Also parse Student Branches
    sb_req = requests.get('https://ieeepunesection.org/student-branches/', headers={'User-Agent': 'Mozilla/5.0'}, timeout=15)
    sb_soup = BeautifulSoup(sb_req.text, 'lxml')
    branches = []
    for li in sb_soup.find_all(['li', 'p']):
        t = li.get_text(strip=True)
        if 'STB' in t or 'Student Branch' in t or 'College' in t or 'Institute' in t:
            branches.append(t)
    
    with open('scraper/output/pune_student_branches.json', 'w', encoding='utf-8') as f:
        json.dump(branches, f, indent=2, ensure_ascii=False)
    print(f"Extracted {len(branches)} Student branch entries.")

if __name__ == '__main__':
    parse_pune_data()
