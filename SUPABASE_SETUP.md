# Supabase Setup

This app reads portfolio projects and the active CV from Supabase. The public website uses the anon key for safe reads. The `/admin` page uses `SUPABASE_SERVICE_ROLE_KEY` only inside server actions for project updates and PDF uploads.

## 1. Create Project

1. Open Supabase and create a new project.
2. Go to `Project Settings` -> `API`.
3. Copy:
   - Project URL
   - anon public key
   - service_role key

Never expose the service role key in client-side code or a public repository.

## 2. Add Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=use-a-strong-password
```

Restart `pnpm dev` after adding env vars.

## 3. Create Tables, Policies, And Storage

1. In Supabase, open `SQL Editor`.
2. Paste and run [supabase/setup.sql](./supabase/setup.sql).

That script creates:

- `projects` table for portfolio cards.
- `cv_files` table for uploaded resumes.
- Public read policies for featured projects and active CV only.
- Public `portfolio` storage bucket for PDF files.

## 4. Use The Admin Page

1. Visit `/admin`.
2. Enter `ADMIN_PASSWORD`.
3. Add/edit projects.
4. Upload a PDF CV.

The latest uploaded CV is marked active and the homepage resume link updates automatically after revalidation.

## CV Upload Troubleshooting

If CV upload fails, `/admin` will show the exact error message. The most common fixes are:

1. Confirm `.env.local` has the real `SUPABASE_SERVICE_ROLE_KEY`, not the anon key.
2. Confirm the `portfolio` storage bucket exists and is public.
3. Confirm the file is a PDF and smaller than 10 MB.

You can rerun this SQL in Supabase SQL Editor to repair the bucket:

```sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio', 'portfolio', true, 10485760, array['application/pdf'])
on conflict (id) do update
set public = true,
    file_size_limit = 10485760,
    allowed_mime_types = array['application/pdf'];
```

## 5. Deployment Notes

On Vercel or your host, add the same environment variables. Do not prefix the service role key with `NEXT_PUBLIC_`; that would expose it to the browser.

Useful official docs:

- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Storage Buckets](https://supabase.com/docs/guides/storage/buckets)
- [Supabase JavaScript Storage upload](https://supabase.com/docs/reference/javascript/storage-from-upload)
