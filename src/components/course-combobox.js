"use client";

import { useRef, useState } from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

export default function CourseCombobox({ courses, defaultValue = "", onSelect }) {
  const [selected, setSelected] = useState(defaultValue);
  const fieldRef = useRef(null);
  const courseNames = courses.map((course) => course.name);

  return (
    <div className="course-combobox" ref={fieldRef}>
      <input type="hidden" name="service" value={selected} />
      <Combobox
        items={courseNames}
        value={selected || null}
        onValueChange={(value) => {
          setSelected(value || "");
          const course = courses.find((item) => item.name === value);
          if (course) onSelect?.(course, fieldRef.current?.closest("form"));
        }}
      >
        <ComboboxInput aria-label="Interested course" placeholder="Search courses..." />
        <ComboboxContent className="course-combobox-menu">
          <ComboboxEmpty>No course found.</ComboboxEmpty>
          <ComboboxList>
            {(name) => <ComboboxItem key={name} value={name}>{name}</ComboboxItem>}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
