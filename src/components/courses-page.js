"use client";

import { useState } from "react";
import { Pencil, RotateCcw, Archive, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { money } from "@/lib/data";
import { Modal, ConfirmDialog } from "./ui";
import "./courses-page.css";

export default function CoursesPage({ courses, loading, loadError, onRefresh, notify, editor, setEditor }) {
  const [archiving, setArchiving] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const save = async (event) => {
    event.preventDefault();
    if (busy) return;
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const data = {
      name: String(values.name).trim(),
      fee: Number(values.fee),
      duration: String(values.duration).trim(),
      description: String(values.description).trim(),
    };
    if (!data.name || !Number.isFinite(data.fee) || data.fee < 0) {
      setError("Enter a course name and a valid fee.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (editor === "new") await api.createCourse(data);
      else await api.updateCourse(editor._id, data);
      await onRefresh();
      notify(editor === "new" ? "Course added" : "Course updated");
      setEditor(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = async (course, status) => {
    setBusy(true);
    try {
      if (status === "Inactive") await api.deleteCourse(course._id);
      else await api.updateCourse(course._id, { status: "Active" });
      await onRefresh();
      notify(status === "Inactive" ? "Course archived" : "Course restored");
      setArchiving(null);
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (busy || !deleting) return;
    setBusy(true);
    try {
      await api.permanentlyDeleteCourse(deleting._id);
      await onRefresh();
      notify("Course deleted");
      setDeleting(null);
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <section className="card courses-card">
        <div className="courses-intro">Manage the courses offered in new leads. Archiving hides a course from new leads; deleting removes it permanently. Existing leads keep their course name.</div>
        {loadError ? <div role="alert" className="courses-message">Could not load courses. <button type="button" onClick={onRefresh}>Retry</button></div>
          : loading ? <div className="courses-message">Loading courses…</div>
          : courses.length === 0 ? <div className="courses-message">No courses yet. Add the first course to make it available for leads.</div>
          : <div className="courses-table-wrap"><table className="courses-table">
              <thead><tr><th>Course</th><th>Duration</th><th>Fee</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{courses.map((course) => <tr key={course._id}>
                <td><strong>{course.name}</strong>{course.description && <small>{course.description}</small>}</td>
                <td>{course.duration || "—"}</td>
                <td>{money(course.fee)}</td>
                <td><span className={`courses-status ${course.status === "Active" ? "is-active" : "is-inactive"}`}>{course.status}</span></td>
                <td><div className="courses-actions"><button type="button" onClick={() => { setError(""); setEditor(course); }}><Pencil size={14} /> Edit</button>
                  {course.status === "Active" ? <button type="button" onClick={() => setArchiving(course)}><Archive size={14} /> Archive</button>
                    : <button type="button" disabled={busy} onClick={() => changeStatus(course, "Active")}><RotateCcw size={14} /> Restore</button>}
                  <button className="courses-delete" type="button" onClick={() => setDeleting(course)}><Trash2 size={14} /> Delete</button></div></td>
              </tr>)}</tbody>
            </table></div>}
      </section>
      {editor && <Modal title={editor === "new" ? "Add course" : "Edit course"} onClose={() => setEditor(null)}>
        <form onSubmit={save}>
          <div className="form-grid">
            <label>Course name<input name="name" required maxLength="120" defaultValue={editor === "new" ? "" : editor.name} /></label>
            <label>Fee (₹)<input name="fee" type="number" min="0" step="1" required defaultValue={editor === "new" ? "" : editor.fee} /></label>
            <label>Duration<input name="duration" maxLength="80" placeholder="e.g. 1 Week" defaultValue={editor === "new" ? "" : editor.duration} /></label>
            <label>Description<textarea name="description" rows="3" defaultValue={editor === "new" ? "" : editor.description} /></label>
          </div>
          {error && <p className="courses-error" role="alert">{error}</p>}
          <div className="modal-footer"><button type="button" onClick={() => setEditor(null)}>Cancel</button><button className="primary" disabled={busy} type="submit">{busy ? "Saving…" : editor === "new" ? "Add course" : "Save changes"}</button></div>
        </form>
      </Modal>}
      {archiving && <ConfirmDialog title={`Archive ${archiving.name}?`} message="This course will disappear from new lead forms. Existing leads will keep their course name." confirmLabel={busy ? "Archiving…" : "Archive course"} destructive onClose={() => setArchiving(null)} onConfirm={() => changeStatus(archiving, "Inactive")} />}
      {deleting && <ConfirmDialog title={`Delete ${deleting.name}?`} message="This permanently removes the course record and cannot be undone. Existing leads will keep their course name." confirmLabel={busy ? "Deleting…" : "Delete course"} destructive onClose={() => setDeleting(null)} onConfirm={remove} />}
    </>
  );
}
