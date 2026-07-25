import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "../../lib/adminAuth";
import { getAdminCvFiles, getLatestCv, getProjects } from "../../lib/portfolio";
import { getSupabaseConfigStatus, hasAdminSupabaseConfig } from "../../lib/supabase";
import {
  activateCvAction,
  createProjectAction,
  deleteCvAction,
  deleteProjectAction,
  loginAction,
  logoutAction,
  updateProjectAction,
  uploadCvAction,
} from "./actions";

export const metadata = {
  title: "Admin | Nihal T Portfolio",
  robots: {
    index: false,
    follow: false,
  },
};

function AdminLogin({ searchParams }) {
  const hasError = searchParams?.error === "invalid";
  const missingPassword = !process.env.ADMIN_PASSWORD;

  return (
    <main className="admin-shell admin-shell--center">
      <section className="admin-panel admin-panel--narrow">
        <p className="header__overline">portfolio admin</p>
        <h1>Sign in</h1>
        {missingPassword ? (
          <p className="admin-alert">Set ADMIN_PASSWORD in your environment before using the admin page.</p>
        ) : null}
        {hasError ? <p className="admin-alert">Invalid admin password.</p> : null}
        <form action={loginAction} className="admin-form">
          <label>
            Password
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          <button className="btn-rounded animabutton btn-left" type="submit">Enter Admin</button>
        </form>
      </section>
    </main>
  );
}

function ProjectForm({ project, canWrite }) {
  const action = project?.id ? updateProjectAction : createProjectAction;
  const techStack = Array.isArray(project?.tech_stack)
    ? project.tech_stack.join(", ")
    : project?.tech_stack || "";

  return (
    <form action={action} className="admin-form admin-project-form">
      {project?.id ? <input type="hidden" name="id" value={project.id} /> : null}
      <label>
        Title
        <input name="title" defaultValue={project?.title || ""} required />
      </label>
      <label>
        Description
        <textarea name="description" defaultValue={project?.description || ""} rows={project?.id ? 5 : 6} required />
      </label>
      <label>
        Tech stack
        <input name="tech_stack" defaultValue={techStack} placeholder="React, Django, PostgreSQL" />
      </label>
      <div className="admin-grid-two">
        <label>
          Source URL
          <input name="source_url" type="url" defaultValue={project?.source_url || ""} />
        </label>
        <label>
          Demo URL
          <input name="demo_url" type="url" defaultValue={project?.demo_url || ""} />
        </label>
      </div>
      <div className="admin-row">
        <label>
          Order
          <input name="display_order" type="number" defaultValue={project?.display_order || 0} />
        </label>
        <label className="admin-checkbox">
          <input name="is_featured" type="checkbox" defaultChecked={project?.is_featured ?? true} />
          Show on site
        </label>
      </div>
      <button className="btn-rounded animabutton btn-left" type="submit" disabled={!canWrite}>
        {project?.id ? "Save Project" : "Add Project"}
      </button>
    </form>
  );
}

function formatDate(value) {
  if (!value) return "Local fallback";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminPage({ searchParams }) {
  const params = await searchParams;
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) return <AdminLogin searchParams={params} />;

  if (!process.env.ADMIN_PASSWORD) redirect("/admin");

  const [projects, cv, cvFiles] = await Promise.all([
    getProjects({ includeHidden: true, noCache: true }),
    getLatestCv({ noCache: true }),
    getAdminCvFiles({ noCache: true }),
  ]);
  const canWrite = hasAdminSupabaseConfig();
  const configStatus = getSupabaseConfigStatus();
  const missingConfig = [
    !configStatus.hasUrl ? "NEXT_PUBLIC_SUPABASE_URL" : null,
    !configStatus.hasAnonKey ? "NEXT_PUBLIC_SUPABASE_ANON_KEY" : null,
    !configStatus.hasServiceRoleKey ? "SUPABASE_SERVICE_ROLE_KEY" : null,
  ].filter(Boolean);

  return (
    <main className="admin-shell">
      <section className="admin-header">
        <div>
          <p className="header__overline">portfolio admin</p>
          <h1>Manage Content</h1>
        </div>
        <form action={logoutAction}>
          <button className="btn-rounded" type="submit">Logout</button>
        </form>
      </section>

      {missingConfig.length ? (
        <p className="admin-alert">
          Missing env values: {missingConfig.join(", ")}. Add them to .env.local, then stop and restart pnpm dev.
        </p>
      ) : null}

      <section className="admin-panel">
        <div className="heading">
          <h3>CV</h3>
          <h2>Upload Resume</h2>
        </div>
        {params?.cvUploaded ? (
          <p className="admin-success">CV uploaded successfully. The homepage resume link is now updated.</p>
        ) : null}
        {params?.cvActivated ? (
          <p className="admin-success">CV activated successfully.</p>
        ) : null}
        {params?.cvDeleted ? (
          <p className="admin-success">CV deleted successfully.</p>
        ) : null}
        {params?.cvError ? (
          <p className="admin-alert">CV upload failed: {params.cvError}</p>
        ) : null}
        <p>Current CV: <a className="link link--alt" href={cv.fileUrl} target="_blank" rel="noreferrer">{cv.title}</a></p>
        <form action={uploadCvAction} className="admin-form">
          <label>
            CV title
            <input name="title" defaultValue="Nihal T Resume" required />
          </label>
          <label>
            PDF file
            <input name="cv" type="file" accept="application/pdf" required />
          </label>
          <button className="btn-rounded animabutton btn-left" type="submit" disabled={!canWrite}>Upload CV</button>
        </form>
      </section>

      <section className="admin-panel">
        <div className="heading">
          <h3>CV</h3>
          <h2>Previous Uploads</h2>
        </div>
        <div className="admin-cv-list">
          {cvFiles.length ? (
            cvFiles.map((item) => (
              <article className="admin-cv-item" key={item.id}>
                <div>
                  <h3>{item.title}</h3>
                  <p>{formatDate(item.created_at)}</p>
                  {item.is_active ? <span className="admin-pill">Active</span> : null}
                </div>
                <div className="admin-cv-actions">
                  <a className="link link--alt" href={item.file_url} target="_blank" rel="noreferrer">View</a>
                  {!item.is_active && item.id !== "fallback-cv" ? (
                    <form action={activateCvAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <button className="btn-rounded" type="submit" disabled={!canWrite}>Make Active</button>
                    </form>
                  ) : null}
                  {item.id !== "fallback-cv" ? (
                    <form action={deleteCvAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="file_path" value={item.file_path || ""} />
                      <button className="admin-danger" type="submit" disabled={!canWrite}>Delete</button>
                    </form>
                  ) : null}
                </div>
              </article>
            ))
          ) : (
            <p>No uploaded CVs found yet.</p>
          )}
        </div>
      </section>

      <section className="admin-panel">
        <div className="heading">
          <h3>Projects</h3>
          <h2>Add Project</h2>
        </div>
        {params?.projectSaved ? (
          <p className="admin-success">Project saved successfully.</p>
        ) : null}
        {params?.projectDeleted ? (
          <p className="admin-success">Project deleted successfully.</p>
        ) : null}
        {params?.projectError ? (
          <p className="admin-alert">Project action failed: {params.projectError}</p>
        ) : null}
        <ProjectForm canWrite={canWrite} />
      </section>

      <section className="admin-panel">
        <div className="heading">
          <h3>Projects</h3>
          <h2>Edit Existing</h2>
        </div>
        <div className="admin-project-list">
          {projects.map((project) => (
            <article className="admin-project-card" key={project.id || project.title}>
              <ProjectForm project={project} canWrite={canWrite} />
              {project.id ? (
                <form action={deleteProjectAction}>
                  <input type="hidden" name="id" value={project.id} />
                  <button className="admin-danger" type="submit" disabled={!canWrite}>Delete</button>
                </form>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
