"use client";

import { useEffect, useState } from "react";

function formatElapsed(seconds) {
  const safe = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

export default function DialResultForm({ attempt, saving, onStop, onSave, onDiscard }) {
  const [elapsed, setElapsed] = useState(() => Math.max(0, Math.floor(((attempt.endedAt || Date.now()) - attempt.startedAt) / 1000)));
  const [status, setStatus] = useState("");
  const [duration, setDuration] = useState("");
  const [durationEdited, setDurationEdited] = useState(false);

  useEffect(() => {
    const update = () => setElapsed(Math.max(0, Math.floor(((attempt.endedAt || Date.now()) - attempt.startedAt) / 1000)));
    update();
    if (attempt.endedAt) return;
    const timer = setInterval(update, 1000);
    document.addEventListener("visibilitychange", update);
    window.addEventListener("focus", update);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", update);
      window.removeEventListener("focus", update);
    };
  }, [attempt.startedAt, attempt.endedAt]);

  const suggestedDuration = formatElapsed(elapsed);
  const shownDuration = durationEdited ? duration : suggestedDuration;
  const noConversation = ["Missed", "Busy", "No Answer"].includes(status);

  const submit = (event) => {
    event.preventDefault();
    const confirmedDuration = noConversation ? "00:00" : shownDuration.trim();
    if (!/^\d+:[0-5]\d$/.test(confirmedDuration)) return;
    if (!attempt.endedAt) return;
    onSave({ status, duration: confirmedDuration });
  };

  return (
    <form className="dial-result-form" onSubmit={submit}>
      <p><strong>{attempt.name}</strong> · {attempt.phone}</p>
      <p className="field-hint">
        {attempt.endedAt ? "Timer stopped" : "Time since opening the dialer"}: {suggestedDuration}.
        Your browser cannot detect when the phone call connects or ends. Check your phone and correct the duration before saving.
      </p>
      {!attempt.endedAt && (
        <button type="button" onClick={() => onStop(Date.now())} disabled={saving}>Call ended — stop timer</button>
      )}
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
      <div className="form-actions">
        <button type="button" onClick={onDiscard} disabled={saving}>Discard</button>
        <button type="submit" className="primary" disabled={saving || !status || !attempt.endedAt}>{saving ? "Saving…" : "Save duration"}</button>
      </div>
    </form>
  );
}
