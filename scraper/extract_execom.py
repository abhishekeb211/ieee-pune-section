import os
import re
import json
import requests
from bs4 import BeautifulSoup

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

def extract_and_download():
    url = 'https://ieeepunesection.org/execom-2026/'
    r = requests.get(url, headers=HEADERS, timeout=10)
    soup = BeautifulSoup(r.text, 'lxml')

    data = []
    os.makedirs('images/leaders', exist_ok=True)

    for member in soup.find_all('div', class_='tmm_member'):
        fname = member.find('span', class_='tmm_fname')
        lname = member.find('span', class_='tmm_lname')
        job = member.find('div', class_='tmm_job')
        photo_div = member.find('div', class_='tmm_photo')
        social = member.find('a', class_='tmm_sociallink')

        first = fname.text.strip() if fname else ''
        last = lname.text.strip() if lname else ''
        name = f"{first} {last}".strip()
        role = job.text.strip() if job else ''
        linkedin = social['href'] if social and social.has_attr('href') else ''

        img_url = ''
        if photo_div and photo_div.has_attr('style'):
            m = re.search(r'url\((.*?)\)', photo_div['style'])
            if m:
                img_url = m.group(1).strip('\'"')

        if name and name != 'Untitled':
            # Download image if available
            local_img = ''
            if img_url and img_url.startswith('http'):
                ext = os.path.splitext(img_url.split('?')[0])[1] or '.jpg'
                filename = re.sub(r'[^a-zA-Z0-9]', '_', name.lower()) + ext
                local_path = os.path.join('images', 'leaders', filename)
                try:
                    if not os.path.exists(local_path):
                        img_res = requests.get(img_url, headers=HEADERS, timeout=6)
                        if img_res.status_code == 200:
                            with open(local_path, 'wb') as img_f:
                                img_f.write(img_res.content)
                    if os.path.exists(local_path):
                        local_img = f"images/leaders/{filename}"
                except Exception as e:
                    print(f"Error fetching image for {name}: {e}")
            
            data.append({
                'name': name,
                'role': role,
                'linkedin': linkedin,
                'img_url': img_url,
                'local_img': local_img
            })

    print(f"Successfully extracted {len(data)} members.")
    with open('scraper/output/pune_execom_clean.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

if __name__ == '__main__':
    extract_and_download()
