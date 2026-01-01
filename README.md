# 🚀 Resonate Admin Core

This is the production-ready Admin Dashboard for the Resonate SaaS project. It includes the Marketing, Outreach, and Support automation engines.

## 🛠️ Tech Stack
- **Framework**: Next.js 16.0.7 (Secure Bash Patch)
- **Library**: React 19.2.3
- **ORM**: Prisma (PostgreSQL)
- **UI**: Tailwind CSS + Lucide Icons
- **Security**: Master Superadmin Bypass (Zero-dependency)

## 🚀 One-Click Deployment
1. **GitHub**: Push this repo to your new GitHub project.
2. **Vercel**: Import the project.
3. **Env Vars**: Add the following to Vercel:
   - `DATABASE_URL`: Your PostgreSQL connection string.
   - `GOOGLE_GENERATIVE_AI_API_KEY`: For Gemini-powered engines.
   - `OPENAI_API_KEY`: For GPT-powered engines.
   - `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: For payment verification.
   - `JWT_SECRET`: Any random string for session signing.

## 🔐 Access
Once deployed, navigate to:
`https://your-domain.vercel.app/admin/login`

Click the **SUPERADMIN** button for instant access.

## 📁 Project Structure
- `/app/admin`: Core dashboard and login logic.
- `/app/api`: Production-ready API endpoints for all engines.
- `/services`: Business logic for content generation and outreach.
- `/prisma`: Database schema and migration settings.
