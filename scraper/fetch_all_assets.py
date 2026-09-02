import os
import re
import json
import urllib.parse
import requests
from bs4 import BeautifulSoup

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'}

def extract_pune_execom():
    url = "https://ieeepunesection.org/execom-2026/"
    print(f"Fetching Pune Execom from {url}...")
    r = requests.get(url, headers=HEADERS, timeout=20)
    soup = BeautifulSoup(r.text, "lxml")
    
    members = []
    for member in soup.find_all("div", class_="tmm_member"):
        fname = member.find("span", class_="tmm_fname")
        lname = member.find("span", class_="tmm_lname")
        job = member.find("div", class_="tmm_job")
        desc = member.find("div", class_="tmm_desc")
        photo_div = member.find("div", class_="tmm_photo")
        social_link = member.find("a", class_="tmm_sociallink")
        
        full_name = f"{fname.text.strip() if fname else ''} {lname.text.strip() if lname else ''}".strip()
        job_title = job.text.strip() if job else ""
        desc_text = desc.text.strip() if desc else ""
        linkedin = social_link.get("href", "") if social_link else ""
        
        photo_url = ""
        if photo_div and photo_div.get("style"):
            m = re.search(r'url\((.*?)\)', photo_div.get("style"))
            if m:
                photo_url = m.group(1).strip("'\"")
        
        if full_name:
            members.append({
                "name": full_name,
                "role": job_title,
                "affiliation": desc_text,
                "linkedin": linkedin,
                "photo_url": photo_url
            })
            
    print(f"Found {len(members)} Pune Section Execom members.")
    return members

def download_images(members, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    for m in members:
        p_url = m.get("photo_url")
        if p_url and p_url.startswith("http"):
            ext = os.path.splitext(urllib.parse.urlparse(p_url).path)[1] or ".jpg"
            safe_name = re.sub(r'[^a-zA-Z0-9]', '_', m["name"].lower()) + ext
            local_path = os.path.join(out_dir, safe_name)
            try:
                if not os.path.exists(local_path):
                    res = requests.get(p_url, headers=HEADERS, timeout=15)
                    if res.status_code == 200:
                        with open(local_path, "wb") as f:
                            f.write(res.content)
                        print(f"Downloaded: {safe_name}")
                m["local_photo"] = f"images/leaders/{safe_name}"
            except Exception as e:
                print(f"Error downloading {p_url}: {e}")

def main():
    pune_members = extract_pune_execom()
    
    # Save JSON data
    os.makedirs("data", exist_ok=True)
    with open("data/pune_execom_2026.json", "w", encoding="utf-8") as f:
        json.dump(pune_members, f, indent=2, ensure_ascii=False)
        
    download_images(pune_members, "images/leaders")
    print("Execution complete. Execom data and photos saved.")

if __name__ == "__main__":
    main()
