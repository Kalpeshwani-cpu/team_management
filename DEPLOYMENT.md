# Deployment Guide (Vercel)

This project is optimized for deployment on Vercel.

## Prerequisites

1.  **Neon Database**: Ensure you have a PostgreSQL database (e.g., Neon).
2.  **Environment Variables**: You will need to set the following variables in the Vercel Dashboard:

| Variable | Description |
| :--- | :--- |
| `DATABASE_URL` | Pooled connection string from Neon (add `?sslmode=require`) |
| `DIRECT_URL` | Direct connection string for Prisma migrations |
| `NEXTAUTH_SECRET` | A random string (generate with `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Your deployment URL (e.g., `https://your-app.vercel.app`) |

## Deployment Steps

1.  **Connect Repository**: Connect this GitHub/GitLab repository to Vercel.
2.  **Configure Framework**: Vercel should auto-detect **Next.js**.
3.  **Environment Variables**: Add the variables listed above.
4.  **Deploy**: Vercel will run `npm install` (which generates Prisma client) and `npm run build`.

## Prisma Troubleshooting

If you encounter issues with Prisma during build:
- The `package.json` includes `"postinstall": "prisma generate"`, which is required for Vercel.
- Ensure your `DATABASE_URL` is accessible during the build phase if you have custom scripts that require it.
