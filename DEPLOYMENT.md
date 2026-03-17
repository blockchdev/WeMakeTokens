# 🚀 Deployment Guide for WeMakeTokens

This is a **Next.js** application. The easiest and absolute best way to deploy it online for free is using **Vercel** (the creators of Next.js).

---

## 📦 Option 1: Deploy on Vercel (Recommended & Easiest)

### Step 1: Push your code to GitHub
1. Create a **GitHub** account if you don’t have one.
2. Create a new **Private** or Public repository.
3. In your terminal, run the following commands inside this project directory:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

### Step 2: Connect to Vercel
1. Go to [Vercel.com](https://vercel.com/) and sign up using your **GitHub** account.
2. Click **Add New** -> **Project**.
3. Select your `WeMakeTokens` repository from your list.
4. **Environment Variables Config** (CRITICAL ⚠️):
   Expand the "Environment Variables" section and add the keys from your `.env.local`:
   * **Key**: `PINATA_JWT`
   * **Value**: *Your Pinata JWT string*
   * **Key**: `NEXT_PUBLIC_RPC_URL` (optional, if you have a custom mainnet node)
5. Click **Deploy**.

Within 2 minutes, your site will be live on a free `*.vercel.app` domain! You can also link a custom domain (e.g., `wemaketokens.com`) inside the Vercel Dashboard later.

---

## 🖥️ Option 2: Deploy on a Linux VPS (DigitalOcean / AWS)

If you have a Linux server and want to self-host:

1. **Install Node.js 18+** on your server.
2. **Clone** your Git repository onto the server.
3. Run installation and build inside the folder:
   ```bash
   npm install
   npm run build
   ```
4. **Setup Environment Variables**:
   Create a `.env` file containing your `PINATA_JWT`.
5. **Start or run with PM2** (Production Process Manager):
   ```bash
   npm install -g pm2
   pm2 start npm --name "we-make-tokens" -- run start
   ```
6. Setup a **Reverse Proxy** (like Nginx) to forward port `80` to `3000`.

---

> [!IMPORTANT]
> Always ensure your `PINATA_JWT` is loaded inside the environment variables of your hosting provider, otherwise image uploading will fail on the live site!
