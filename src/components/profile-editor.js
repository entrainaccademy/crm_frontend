"use client";

import { useState } from "react";
import { Mail, Phone, LockKeyhole, Save } from "lucide-react";
import { api } from "@/lib/api";
import { UserAvatar, StatusBadge } from "./ui";
import "./profile-editor.css";

export default function ProfileEditor({ user, onSaved, onCancel }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const save = async (event) => {
    event.preventDefault();
    if (busy) return;
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const name = String(values.name || "").trim();
    const email = String(values.email || "").trim().toLowerCase();
    const phone = String(values.phone || "").trim();
    const currentPassword = String(values.currentPassword || "");
    const newPassword = String(values.newPassword || "");
    const confirmPassword = String(values.confirmPassword || "");

    if (!name || !email) {
      setError("Enter your name and email address.");
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword && newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if ((email !== user.email?.toLowerCase() || newPassword) && !currentPassword) {
      setError("Enter your current password to change email or password.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const saved = await api.updateProfile({
        name,
        email,
        phone,
        ...(currentPassword ? { currentPassword } : {}),
        ...(newPassword ? { newPassword } : {}),
      });
      onSaved(saved);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="profile-editor" onSubmit={save}>
      <div className="profile-editor-hero">
        <UserAvatar name={user.name} size="large" />
        <div>
          <h2>{user.name}</h2>
          <p>{user.role} · Entrain workspace</p>
          <StatusBadge status={user.status || "Active"} />
        </div>
      </div>
      <div className="profile-editor-fields">
        <label>Full name<input name="name" defaultValue={user.name || ""} autoComplete="name" required maxLength={100} /></label>
        <label>Email address<span className="profile-input-icon"><Mail size={16} /><input name="email" type="email" defaultValue={user.email || ""} autoComplete="email" required /></span></label>
        <label>Phone number<span className="profile-input-icon"><Phone size={16} /><input name="phone" type="tel" defaultValue={user.phone || ""} autoComplete="tel" placeholder="Add a phone number" /></span></label>
      </div>
      <div className="profile-editor-security">
        <div className="profile-editor-section-title"><LockKeyhole size={17} /><strong>Account security</strong></div>
        <p>Leave the new password blank to keep your current password. Your current password is required to change your email or password.</p>
        <div className="profile-editor-fields">
          <label>Current password<input name="currentPassword" type="password" autoComplete="current-password" /></label>
          <label>New password<input name="newPassword" type="password" minLength={8} autoComplete="new-password" placeholder="At least 8 characters" /></label>
          <label>Confirm new password<input name="confirmPassword" type="password" autoComplete="new-password" /></label>
        </div>
      </div>
      {error && <p className="profile-editor-error" role="alert">{error}</p>}
      <div className="modal-footer">
        <button type="button" onClick={onCancel} disabled={busy}>Cancel</button>
        <button className="primary" type="submit" disabled={busy}><Save size={15} /> {busy ? "Saving…" : "Save changes"}</button>
      </div>
    </form>
  );
}
