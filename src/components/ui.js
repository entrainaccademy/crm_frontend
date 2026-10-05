"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { X, Search, ArrowUpRight, Download } from "lucide-react";
export function ExportMenu({ onExport, label = "Export" }) {
  return (
    <label className="export-menu">
      <Download size={15} aria-hidden="true" />
      <select aria-label={`${label} format`} value="" onChange={(event) => onExport(event.target.value)}>
        <option value="" disabled>{label}</option>
        <option value="csv">CSV</option>
        <option value="xlsx">Excel (.xlsx)</option>
        <option value="pdf">PDF</option>
      </select>
    </label>
  );
}
export function UserAvatar({ name = "Shamil", size = "", index = 0 }) {
  return (
    <span className={`avatar avatar-${index % 5} ${size}`}>
      {name
        .split(" ")
        .map((x) => x[0])
        .slice(0, 2)
        .join("")}
    </span>
  );
}
export function StatusBadge({ status }) {
  const label = status || "No status";
  return (
    <span
      className={`badge badge-${label.toLowerCase().replaceAll(" ", "-")}`}
    >
      <i />
      {label}
    </span>
  );
}
export function ProgressBar({ value }) {
  return (
    <div className="progress">
      <div style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}
export function PageHeader({ title, children }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
      </div>
      <div className="header-actions">{children}</div>
    </div>
  );
}
export function StatCard({
  label,
  value,
  change,
  icon: Icon,
  negative = false,
  showComparison = true,
}) {
  return (
    <div className="stat-card">
      <div className="stat-label">
        {label}
        {Icon && <Icon size={16} />}
      </div>
      <strong>{value}</strong>
      {(change || showComparison) && (
        <div className="stat-change">
          <span className={negative ? "negative" : ""}>
            <ArrowUpRight size={12} />
            {change || "12.8%"}
          </span>
          {showComparison && <small>vs. previous period</small>}
        </div>
      )}
    </div>
  );
}
export function SearchInput({ value, onChange, placeholder = "Search…" }) {
  return (
    <div className="search-input">
      <Search size={15} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
export function FilterDropdown({ value, onChange, options, label, allLabel = label }) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {label && <option value="">{allLabel}</option>}
      {options.map((x) => (
        <option key={x}>{x}</option>
      ))}
    </select>
  );
}
export function DateRangeFilter({ value, onChange }) {
  return (
    <div className="date-filter">
      <div className="segments">
        {["Today", "This Week", "This Month", "Custom"].map((x) => (
          <button
            className={value === x ? "selected" : ""}
            key={x}
            onClick={() => onChange(x)}
          >
            {x}
          </button>
        ))}
      </div>
      {value === "Custom" && (
        <div className="custom-dates">
          <input aria-label="Start date" type="date" />
          <span>to</span>
          <input aria-label="End date" type="date" />
        </div>
      )}
    </div>
  );
}
export function EmptyState({
  title = "No matching records",
  description = "Try changing your search or filters.",
  compact = false,
}) {
  return (
    <div className={`empty ${compact ? "empty-compact" : ""}`}>
      <Image
        className="empty-illustration"
        src="/images/no-data-found-transparent.png"
        alt=""
        width={1627}
        height={967}
        loading="eager"
      />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
export function DataTable({ columns, rows, onRow, rowClassName, rowStyle }) {
  return (
    <div
      className="table-scroll"
      tabIndex={0}
      role="region"
      aria-label="Scrollable table"
    >
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.id ?? i}
              tabIndex={onRow ? 0 : undefined}
              onKeyDown={(e) => {
                if (
                  onRow &&
                  e.target === e.currentTarget &&
                  (e.key === "Enter" || e.key === " ")
                ) {
                  e.preventDefault();
                  onRow(row);
                }
              }}
              onClick={() => onRow?.(row)}
              className={[onRow && "clickable", rowClassName?.(row)].filter(Boolean).join(" ")}
              style={rowStyle?.(row)}
            >
              {columns.map((c) => (
                <td key={c.key}>{c.render ? c.render(row, i) : row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && <EmptyState />}
    </div>
  );
}
export function Modal({ title, children, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const old = document.activeElement;
    const el = ref.current;
    el?.focus();
    const fn = (e) => {
      if (e.key === "Escape" && !document.querySelector('[data-slot="combobox-content"][data-open]')) onClose();
      if (e.key === "Tab") {
        const list = el.querySelectorAll(
          'button,input,select,textarea,[tabindex="0"]',
        );
        const first = list[0],
          last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", fn);
    return () => {
      document.removeEventListener("keydown", fn);
      old?.focus();
    };
  }, [onClose]);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={ref}
      >
        <div className="modal-heading">
          <h2>{title}</h2>
          <button
            aria-label="Close dialog"
            className="icon-button"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
export function ConfirmDialog({ title, message = "Are you sure you want to sign out? You can sign back in anytime.", confirmLabel = "Log out", destructive = false, onClose, onConfirm }) {
  return (
    <Modal title={title} onClose={onClose}>
      <p className="modal-copy">
        {message}
      </p>
      <div className="modal-footer">
        <button onClick={onClose}>Cancel</button>
        <button className={destructive ? "danger-button" : "primary"} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
export function ActivityTimeline({ items }) {
  return (
    <div className="timeline">
      {items.map((x, i) => (
        <div key={i}>
          <span className="timeline-dot" />
          <strong>{x.text}</strong>
          <p>{x.time}</p>
        </div>
      ))}
    </div>
  );
}
export function LoadingSkeleton() {
  return <div className="skeleton" aria-label="Loading content" />;
}
