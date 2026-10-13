"use client";
import { ArrowRight } from "lucide-react";
import "./empty-state.css";

function Artwork({ kind }) {
  if (kind === "targets") return (
    <svg viewBox="0 0 220 150" fill="none" aria-hidden="true" className="empty-artwork">
      <circle cx="110" cy="75" r="64" fill="#edf4fc" />
      <circle cx="110" cy="75" r="46" fill="white" stroke="#c8daf0" strokeWidth="3" />
      <circle cx="110" cy="75" r="29" fill="#e1edfa" stroke="#9bbce3" strokeWidth="3" />
      <circle cx="110" cy="75" r="12" fill="#36639b" />
      <path d="m147 39-36 35" stroke="#d3a04d" strokeWidth="5" strokeLinecap="round" />
      <path d="m146 27 1 12 12 1-13 1-1 12-4-13 5-13Z" fill="#d3a04d" />
      <circle cx="35" cy="43" r="4" fill="#a8c5e7" />
      <circle cx="185" cy="105" r="5" fill="#e1b971" />
    </svg>
  );
  if (kind === "courses") return (
    <svg viewBox="0 0 220 150" fill="none" aria-hidden="true" className="empty-artwork">
      <circle cx="110" cy="75" r="64" fill="#edf4fc" />
      <path d="M110 43c-17-9-34-8-48-3v70c17-6 33-5 48 3 15-8 31-9 48-3V40c-14-5-31-6-48 3Z" fill="white" stroke="#638ec3" strokeWidth="3" strokeLinejoin="round" />
      <path d="M110 43v70M72 55c10-2 20-1 29 3m-29 12c10-2 20-1 29 3m18-15c9-4 19-5 29-3m-29 18c9-4 19-5 29-3" stroke="#a7c1df" strokeWidth="3" strokeLinecap="round" />
      <path d="m159 27 3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8Z" fill="#d3a04d" />
      <circle cx="44" cy="92" r="5" fill="#b6cee9" />
    </svg>
  );
  return (
    <svg viewBox="0 0 220 150" fill="none" aria-hidden="true" className="empty-artwork">
      <circle cx="110" cy="75" r="64" fill="#edf4fc" />
      <rect x="61" y="87" width="98" height="35" rx="9" fill="white" stroke="#bbd2ed" strokeWidth="2" />
      <path d="M77 104h66m-66 8h44" stroke="#d7e4f3" strokeWidth="3" strokeLinecap="round" />
      <circle cx="81" cy="69" r="14" fill="#8fb2dd" />
      <path d="M56 91c2-10 12-17 25-17s22 7 25 17" fill="#8fb2dd" />
      <circle cx="138" cy="69" r="14" fill="#c9d9ed" />
      <path d="M113 91c2-10 12-17 25-17s22 7 25 17" fill="#c9d9ed" />
      <circle cx="110" cy="57" r="17" fill="#34649e" />
      <path d="M80 91c3-13 14-22 30-22s27 9 30 22" fill="#34649e" />
      <path d="M176 27v15m-8-7h16" stroke="#d3a04d" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function EmptyState({ kind, title, description, action, onAction, compact = false }) {
  return (
    <div className={`empty-state${compact ? " empty-state-compact" : ""}`}>
      <Artwork kind={kind} />
      <h3>{title}</h3>
      <p>{description}</p>
      {action && onAction && (
        <button type="button" className="primary empty-state-action" onClick={onAction}>
          {action} <ArrowRight size={15} />
        </button>
      )}
    </div>
  );
}
