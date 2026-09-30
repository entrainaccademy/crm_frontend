"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";

export default function CourseCombobox({ courses, defaultValue = "", onSelect }) {
  const [selected, setSelected] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const matches = courses.filter((course) =>
    course.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [open]);

  const selectCourse = (course) => {
    setSelected(course.name);
    setOpen(false);
    setQuery("");
    onSelect?.(course, triggerRef.current?.form);
    triggerRef.current?.focus();
  };

  return (
    <div className="course-combobox" ref={rootRef}>
      <input type="hidden" name="service" value={selected} />
      <button
        ref={triggerRef}
        type="button"
        className={`course-combobox-trigger${selected ? " has-value" : ""}`}
        role="combobox"
        aria-expanded={open}
        aria-controls="lead-course-list"
        aria-haspopup="listbox"
        onClick={() => {
          setQuery("");
          setActiveIndex(0);
          setOpen((current) => !current);
        }}
      >
        <span>{selected || "Select a course..."}</span>
        <ChevronsUpDown size={16} aria-hidden="true" />
      </button>
      {open && (
        <div className="course-combobox-popover">
          <div className="course-combobox-search">
            <Search size={16} aria-hidden="true" />
            <input
              autoFocus
              type="search"
              aria-label="Search courses"
              placeholder="Search courses..."
              value={query}
              aria-controls="lead-course-list"
              aria-activedescendant={matches[activeIndex] ? `lead-course-${courses.indexOf(matches[activeIndex])}` : undefined}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setOpen(false);
                  triggerRef.current?.focus();
                } else if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setActiveIndex((index) => Math.min(index + 1, matches.length - 1));
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setActiveIndex((index) => Math.max(index - 1, 0));
                } else if (event.key === "Enter" && matches[activeIndex]) {
                  event.preventDefault();
                  selectCourse(matches[activeIndex]);
                }
              }}
            />
          </div>
          <div id="lead-course-list" className="course-combobox-list" role="listbox" aria-label="Interested course">
            {matches.length ? matches.map((course, index) => (
              <button
                type="button"
                role="option"
                aria-selected={selected === course.name}
                id={`lead-course-${courses.indexOf(course)}`}
                className={`course-combobox-option${index === activeIndex ? " active" : ""}`}
                key={course.name}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectCourse(course)}
              >
                <Check size={15} className={selected === course.name ? "" : "unselected"} aria-hidden="true" />
                <span>{course.name}</span>
              </button>
            )) : <div className="course-combobox-empty">No course found.</div>}
          </div>
        </div>
      )}
    </div>
  );
}
