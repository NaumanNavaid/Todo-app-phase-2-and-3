# Hugging Face Deployment Guide

## Prerequisites

1. **Hugging Face Account** - Sign up at [huggingface.co](https://huggingface.co)
2. **GitHub Repository** - Your code should be in a Git repo
3. **OpenAI API Key** - Get from [platform.openai.com](https://platform.openai.com)

---

## Step-by-Step Deployment

### Step 1: Prepare Your Repository

Make sure your repository has these files:

```
backend/
├── main.py              # FastAPI app entry point
├── Dockerfile           # Docker configuration
├── requirements.txt     # Python dependencies
├── README.md            # Space description
├── config.py            # Configuration
├── models.py            # Database models
├── schemas.py           # API schemas
├── db.py                # Database connection
├── routes/              # API routes
│   ├── auth.py
│   ├── tasks.py
│   └── chat.py
├── services/            # Business logic
│   ├── chat_service.py
│   └── mcp_server.py
├── middleware/          # Auth middleware
└── tests/               # Test files
```

### Step 2: Create a Hugging Face Space

1. Go to [huggingface.co/spaces](https://huggingface.co/spaces)
2. Click **"Create new Space"**
3. Choose:
   - **License**: MIT
   - **SDK**: Docker
   - **Hardware**: CPU basic (free) or CPU upgrade (paid)

### Step 3: Clone Your Repository

Option A: **Connect to GitHub Repository**
1. In your Space, go to **Files** tab
2. Click **"Sync from GitHub"**
3. Enter your repo URL and click **"Sync"**

Option B: **Upload Files Manually**
1. In your Space, go to **Files** tab
2. Click **"Add file"** → **"Upload files"**
3. Upload all required files

### Step 4: Set Environment Variables (Secrets)

1. Go to your Space → **Settings** tab
2. Scroll to **"Repository secrets"**
3. Add the following secrets:

| Secret Name | Value |
|-------------|-------|
| `OPENAI_API_KEY` | `sk-...` (your OpenAI key) |
| `DATABASE_URL` | Auto-provided by Hugging Face (PostgreSQL) |

### Step 5: Configure Database

Hugging Face provides PostgreSQL. Update your `config.py` to use it:

```python
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    database_url: str = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost/db")

    # OpenAI
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")

    # JWT
    secret_key: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # CORS
    cors_origins_list: list = ["*"]

    # Environment
    environment: str = "production"

settings = Settings()
```

### Step 6: Deploy and Test

1. Click **"Start"** or wait for automatic build
2. Check the **Logs** tab for any errors
3. Once running, your API will be at:
   ```
   https://your-username-your-space-name.hf.space
   ```

### Step 7: Test Your Deployment

```bash
# Test health endpoint
curl https://your-space.hf.space/health

# Test registration
curl -X POST https://your-space.hf.space/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test12345","name":"Test"}'

# Test login
curl -X POST https://your-space.hf.space/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test12345"}'
```

---

## Troubleshooting

### Issue: "Port 8000 already in use"

**Solution**: The Dockerfile exposes port 8000. Hugging Face proxies this to port 443 (HTTPS).

### Issue: "Database connection failed"

**Solution**: Make sure `DATABASE_URL` is set as a secret in Space settings.

### Issue: "OPENAI_API_KEY not found"

**Solution**: Add `OPENAI_API_KEY` in **Settings → Repository secrets**.

### Issue: "Module not found"

**Solution**: Ensure all files are uploaded and `requirements.txt` is complete.

---

## Requirements.txt Contents

Verify your `requirements.txt` includes:

```
fastapi==0.115.0
uvicorn[standard]==0.32.0
sqlmodel==0.0.22
pydantic==2.10.4
pydantic-settings==2.6.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
psycopg2-binary==2.9.9
openai==1.57.0
openai-agents==0.2.0
mcp==0.1.0
python-multipart==0.0.17
```

---

## Updating Your Space

After deployment, to update your code:

**Option 1: Git Push**
```bash
git add .
git commit -m "Update code"
git push
```
Then in Hugging Face: **Files** → **Sync from GitHub**

**Option 2: Direct Edit**
1. Go to **Files** tab
2. Edit files directly in browser
3. Changes auto-deploy

---

## Cost & Limits

| Plan | Cost | Features |
|------|------|----------|
| **CPU basic** | Free | 2 vCPU, 16 GB RAM |
| **CPU upgrade** | ~$0.06/hour | 8 vCPU, 32 GB RAM |
| **GPU** | $0.10-$6+/hour | For ML workloads |

For a Todo API, the **Free CPU basic** plan is sufficient.

---

## Next Steps

1. ✅ Deploy your Space
2. ✅ Test all endpoints
3. ✅ Add custom domain (optional)
4. ✅ Set up monitoring (optional)
5. ✅ Share your Space with others!

---

## Resources

- [Hugging Face Spaces Docs](https://huggingface.co/docs/hub/spaces)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Docker on Spaces](https://huggingface.co/docs/hub/spaces-sdks-docker)
