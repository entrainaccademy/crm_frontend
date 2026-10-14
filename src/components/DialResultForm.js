"use client";

import { useEffect, useState } from "react";

function formatElapsed(seconds) {
  const safe = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

export default function DialResultForm({ attempt, saving, onSave, onDiscard }) {
  const [elapsed, setElapsed] = useState(() => Math.max(0, Math.floor((Date.now() - attempt.startedAt) / 1000)));
  const [status, setStatus] = useState("");
  const [duration, setDuration] = useState("");
  const [durationEdited, setDurationEdited] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const update = () => setElapsed(Math.max(0, Math.floor((Date.now() - attempt.startedAt) / 1000)));
    update();
    const timer = setInterval(update, 1000);
    document.addEventListener("visibilitychange", update);
    window.addEventListener("focus", update);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", update);
      window.removeEventListener("focus", update);
    };
  }, [attempt.startedAt]);

  const suggestedDuration = formatElapsed(elapsed);
  const shownDuration = durationEdited ? duration : suggestedDuration;
  const noConversation = ["Missed", "Busy", "No Answer"].includes(status);

  const submit = (event) => {
    event.preventDefault();
    const confirmedDuration = noConversation ? "00:00" : shownDuration.trim();
    if (!/^\d+:[0-5]\d$/.test(confirmedDuration)) return;
    onSave({ status, duration: confirmedDuration, notes: notes.trim() });
  };

  return (
    <form className="dial-result-form" onSubmit={submit}>
      <p><strong>{attempt.name}</strong> · {attempt.phone}</p>
      <p className="field-hint">
        Time since opening the dialer: {suggestedDuration}. Your browser cannot tell when the phone call connected or ended.
        Confirm the actual duration from your phone before saving.
      </p>
      <label>
        Call result
        <select value={status} onChange={(event) => setStatus(event.target.value)} required>
          <option value="">Choose result</option>
          <option value="Answered">Answered</option>
          <option value="Missed">Missed</option>
          <option value="Busy">Busy</option>
          <option value="No Answer">No answer</option>
        </select>
      </label>
      <label>
        Duration (minutes:seconds)
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]+:[0-5][0-9]"
          value={noConversation ? "00:00" : shownDuration}
          onChange={(event) => { setDurationEdited(true); setDuration(event.target.value); }}
          disabled={noConversation}
          required
        />
      </label>
      <label>
        Notes (optional)
        <textarea rows={2} value={notes} onChange={(event) => setNotes(event.target.value)} />
      </label>
      <div className="form-actions">
        <button type="button" onClick={onDiscard} disabled={saving}>Discard</button>
        <button type="submit" className="primary" disabled={saving || !status}>{saving ? "Saving…" : "Save duration"}</button>
      </div>
    </form>
  );
}
