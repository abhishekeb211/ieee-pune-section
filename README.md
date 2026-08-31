# IEEE Pune Section Portal - Vercel Deployment Guide

Official sovereign web portal for **IEEE Pune Section**, transformed and re-engineered from [IEEE India](https://india.ieee.org/).

---

## 🚀 Deploying to Vercel

### Option 1: Deploy with Vercel CLI (Quickest)

1. Open your terminal in this directory:
   ```bash
   cd "d:\IEEE Pune Section"
   ```

2. Run the deployment command:
   ```bash
   npx vercel
   ```
   - If it's your first time, it will prompt you to log into your Vercel account via browser.
   - Select default options for:
     - Set up and deploy `d:\IEEE Pune Section`? **Y**
     - Which scope do you want to deploy to? *(Select your Vercel username)*
     - Link to existing project? **N**
     - What's your project's name? `ieee-pune-section`
     - In which directory is your code located? `./`

3. Deploy to **Production**:
   ```bash
   npx vercel --prod
   ```
   Vercel will output your live URL: `https://ieee-pune-section.vercel.app` (or custom domain).

---

### Option 2: Deploy with Git & GitHub (Continuous Deployment)

1. **Initialize Git & Commit**:
   ```bash
   git init
   git add .
   git commit -m "feat: initial release of IEEE Pune Section portal"
   ```

2. **Push to GitHub**:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/ieee-pune-section.git
   git push -u origin main
   ```

3. **Connect to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Import your `ieee-pune-section` repository.
   - Click **Deploy**.
   - Every push to `main` will automatically trigger instant production deployments.

---

## ⚙️ Configuration Details (`vercel.json`)

The project is pre-configured with:
- **Clean URLs**: Clean path routing without `.html` extensions (`/about`, `/membership`, `/chapters`, `/education`, `/contact`).
- **Asset Caching**: `Cache-Control: public, max-age=31536000, immutable` for static CSS, JS, and graphics.
- **Security Headers**: `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, and `Referrer-Policy`.
