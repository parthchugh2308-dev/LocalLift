# 🚀 LocalLift — Deployment & Android APK Generation Guide

This guide gives you step-by-step instructions to **deploy your backend online** and **generate/install the Android APK file** on any phone.

---

## 📱 PART 1: How to Get the Android APK (.apk file)

You have **3 simple ways** to generate and download the `.apk` file for your phone:

### Method 1: Free Cloud APK Generation via GitHub Actions (Recommended ⭐)

We have configured a `.github/workflows/build-apk.yml` file in your repository. GitHub will build the APK file for free on their servers whenever you push your code!

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Configure deployment and GitHub Actions build"
   git remote add origin https://github.com/YOUR_USERNAME/locallift.git
   git branch -M main
   git push -u origin main
   ```
2. **Download the APK**:
   - Open your GitHub repository in your browser.
   - Click the **Actions** tab at the top.
   - Click the latest workflow run: `📱 Build LocalLift Android APK`.
   - Scroll down to **Artifacts** and click **`LocalLift-Android-App-APK`** to download your ready-to-install `.apk` file!

---

### Method 2: Convert Web App to APK in 30 Seconds via PWABuilder

Because LocalLift includes a full Progressive Web App (PWA) manifest and Service Worker, you can instantly turn your web deployment into a native Android app:

1. Deploy your app to Vercel or Render (see Part 2 below) to get a live HTTPS URL (e.g. `https://locallift.vercel.app`).
2. Go to **[PWABuilder.com](https://www.pwabuilder.com)**.
3. Paste your live HTTPS URL and click **Start**.
4. Click **Package for Android**.
5. Click **Download APK**!

---

### Method 3: Build APK Locally on your PC via Android Studio

1. Download and install **[Android Studio](https://developer.android.com/studio)**.
2. Open Android Studio → Select **Open** → Choose `C:\Users\Asus\Downloads\locallift`.
3. Wait for Gradle sync to complete.
4. Click top menu: **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**.
5. Click **locate** in the notification popup to find your compiled file at:
   `app/build/outputs/apk/debug/app-debug.apk`.
6. Transfer `app-debug.apk` to your Android phone via USB/WhatsApp/Drive and tap to install!

---

## 🌐 PART 2: Deploying the Backend & Web App (24/7 Live Online)

### Option A: Deploy to Vercel (1-Click & Permanent)

We have configured `vercel.json` and `api/index.py` for effortless deployment.

1. Create a free account on **[Vercel.com](https://vercel.com)**.
2. Click **Add New Project** → **Import** your `locallift` GitHub repository.
3. Keep default settings and click **Deploy**.
4. Your web application will be live at `https://your-app-name.vercel.app`!

---

### Option B: Deploy to Render.com (Ideal for Flask + SQLite)

1. Create a free account on **[Render.com](https://render.com)**.
2. Click **New +** → **Web Service**.
3. Select your GitHub repository.
4. Configure these fields:
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt && python init_db.py`
   - **Start Command:** `gunicorn app:app`
5. Click **Create Web Service**.

---

## 📲 Summary of Files Prepared in your Codebase

- `.github/workflows/build-apk.yml` — Automated GitHub Actions cloud APK builder.
- `gradle/wrapper/gradle-wrapper.properties` — Gradle build configuration.
- `gradlew` & `gradlew.bat` — Cross-platform Gradle wrappers.
- `vercel.json` & `api/index.py` — Vercel serverless deployment setup.
- `requirements.txt` — Python dependencies for cloud deployment.
