# How to Sync Local Backend with Hugging Face Space

**Problem:** You have backend code locally and deployed on Hugging Face. You need to make sure they're the same.

---

## 🔍 Step 1: Check Your Hugging Face Space URL

Your deployed backend is at:
```
https://nauman-19-todo-app-backend.hf.space
```

This means your Hugging Face Space git repository is:
```
https://huggingface.co/spaces/nauman-19/todo-app-backend
```

**To verify:**
1. Go to: https://huggingface.co/spaces/nauman-19/todo-app-backend
2. Click on the "Files" tab
3. You'll see all the files currently deployed

---

## 🔍 Step 2: Check What's Currently Deployed

**Option A: Via Hugging Face Website**
1. Visit: https://huggingface.co/spaces/nauman-19/todo-app-backend/tree/main
2. Browse the files to see what's deployed
3. Check if it matches your local backend folder

**Option B: Via Git (if you have access)**

```bash
# Clone the Hugging Face Space to a temporary location
git clone https://huggingface.co/spaces/nauman-19/todo-app-backend hf-backend-temp

# Compare with local backend
diff -r backend/ hf-backend-temp/
```

---

## 🔄 Step 3: Add Hugging Face as a Git Remote

```bash
cd "c:\Users\SR Computers\Desktop\Todo-app-phase-2-and-3"

# Add Hugging Face as a remote (name it "hf")
git remote add hf https://huggingface.co/spaces/nauman-19/todo-app-backend

# Verify the remote was added
git remote -v
```

**Expected output:**
```
origin  https://github.com/NaumanNavaid/Todo-app-phase-2-and-3.git (fetch)
origin  https://github.com/NaumanNavaid/Todo-app-phase-2-and-3.git (push)
hf      https://huggingface.co/spaces/nauman-19/todo-app-backend (fetch)
hf      https://huggingface.co/spaces/nauman-19/todo-app-backend (push)
```

---

## 🚀 Step 4: Push Local Backend to Hugging Face

### Method 1: Push Only Backend Folder (Recommended)

```bash
cd "c:\Users\SR Computers\Desktop\Todo-app-phase-2-and-3"

# Push only the backend folder to Hugging Face
git subtree push --prefix backend hf main
```

**What this does:**
- Takes only the `backend/` folder
- Pushes it to the `hf` remote (Hugging Face)
- Deploys it as the main branch

### Method 2: Manual Copy and Push

```bash
# 1. Clone Hugging Face repo
git clone https://huggingface.co/spaces/nauman-19/todo-app-backend hf-backend-temp

# 2. Copy backend files (excluding .git)
xcopy backend hf-backend-temp /E /I /Y /EXCLUDE:hf-backend-temp\.git

# 3. Go to HF repo
cd hf-backend-temp

# 4. Commit and push
git add .
git commit -m "Update backend from local repo"
git push hf main
```

---

## ✅ Step 5: Verify Deployment

After pushing:

1. **Check Hugging Face:**
   - Go to: https://huggingface.co/spaces/nauman-19/todo-app-backend/tree/main
   - Verify the files are updated

2. **Wait for rebuild:**
   - Hugging Face will automatically rebuild the Space
   - Takes 1-3 minutes
   - Watch the status at: https://huggingface.co/spaces/nauman-19/todo-app-backend

3. **Test the deployed backend:**
   - Visit: https://nauman-19-todo-app-backend.hf.space
   - Check API docs: https://nauman-19-todo-app-backend.hf.space/docs
   - Test health endpoint: https://nauman-19-todo-app-backend.hf.space/health

---

## 🔄 Step 6: Keep Them in Sync (Future Updates)

### Workflow for Ongoing Development:

```bash
# 1. Make changes locally in backend/
# ... edit files in backend/ ...

# 2. Commit to GitHub (main repo)
git add backend/
git commit -m "Update backend: add priority field"
git push origin main

# 3. Push to Hugging Face
git subtree push --prefix backend hf main

# 4. Verify on Hugging Face
# Wait 1-3 minutes for rebuild, then test
```

---

## 📋 Quick Sync Commands

### First Time Setup:
```bash
cd "c:\Users\SR Computers\Desktop\Todo-app-phase-2-and-3"
git remote add hf https://huggingface.co/spaces/nauman-19/todo-app-backend
```

### Push Backend to Hugging Face:
```bash
git subtree push --prefix backend hf main
```

### Pull from Hugging Face to Local:
```bash
git subtree pull --prefix backend hf main
```

---

## 🎯 Important Notes

### Hugging Face Spaces Structure:

Hugging Face Spaces expect:
```
your-space/
├── README.md        # Required: Space description
├── requirements.txt # Required: Python dependencies
├── main.py          # Required: App entry point
└── [other files]    # Your application code
```

**Your backend folder should already have these!**

### What Gets Pushed:

When you use `git subtree push --prefix backend hf main`:
- ✅ All files in `backend/` folder
- ❌ NOT frontend folder
- ❌ NOT infrastructure folder
- ❌ NOT other files

### Hugging Face vs GitHub:

- **GitHub:** https://github.com/NaumanNavaid/Todo-app-phase-2-and-3
  - Contains: backend + frontend + infrastructure
  - Main repository

- **Hugging Face:** https://huggingface.co/spaces/nauman-19/todo-app-backend
  - Contains: ONLY backend files
  - Separate repository for deployment

---

## 🔧 Troubleshooting

### Issue 1: "Remote 'hf' already exists"

**Solution:**
```bash
# Remove existing hf remote
git remote remove hf

# Re-add it
git remote add hf https://huggingface.co/spaces/nauman-19/todo-app-backend
```

### Issue 2: Authentication Failed

**Solution:**
```bash
# You need a Hugging Face token
# 1. Go to: https://huggingface.co/settings/tokens
# 2. Create a new token
# 3. Use token as password:

git clone https://huggingface.co/spaces/nauman-19/todo-app-backend
# Username: YOUR_HF_USERNAME
# Password: hf_xxxxxxxxxxxxxxxxxxx (your token)
```

### Issue 3: Build Fails on Hugging Face

**Solution:**
1. Check `requirements.txt` has all dependencies
2. Check `main.py` exists and is correct
3. Check `README.md` exists
4. Look at build logs on Hugging Face Space page

---

## 📊 Summary

| Location | URL | What's There | How to Update |
|----------|-----|--------------|---------------|
| **Local Backend** | `c:\Users\SR\...\backend\` | Source code | Edit files here |
| **GitHub** | github.com/NaumanNavaid/... | Entire repo | `git push origin main` |
| **Hugging Face** | hf.co/spaces/nauman-19/... | Backend only | `git subtree push --prefix backend hf main` |

---

## ✅ Checklist

Before syncing, make sure:

- [ ] You have a Hugging Face account
- [ ] You have access to the Space: `nauman-19/todo-app-backend`
- [ ] You have a Hugging Face token (if pushing from terminal)
- [ ] Local backend folder is up to date
- [ ] `backend/requirements.txt` includes all dependencies
- [ ] `backend/main.py` is the entry point
- [ ] `backend/README.md` exists

---

**Next Steps:**

1. Add Hugging Face remote
2. Push backend folder
3. Wait for Hugging Face to rebuild
4. Test deployed backend
5. Make changes locally
6. Repeat from step 2

---

**Ready to sync? Start with:**
```bash
cd "c:\Users\SR Computers\Desktop\Todo-app-phase-2-and-3"
git remote add hf https://huggingface.co/spaces/nauman-19/todo-app-backend
git subtree push --prefix backend hf main
```
