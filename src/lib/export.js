const preferredFields = {
  leads: ["name", "phone", "whatsapp", "email", "location", "service", "source", "assigned", "status", "priority", "saleAmount", "advanceAmount", "created", "date", "time"],
  "lead-reports": ["name", "phone", "service", "source", "assigned", "status", "priority", "saleAmount", "advanceAmount", "created"],
  "sales-reports": ["name", "phone", "service", "assigned", "status", "saleAmount", "advanceAmount", "created"],
  "call-reports": ["name", "phone", "assigned", "date", "time", "callStatus", "duration", "notes"],
  "follow-up-reports": ["name", "phone", "assigned", "date", "time", "status", "completed", "purpose"],
  performance: ["name", "role", "target", "sales", "conversions"],
};

function tableData(rows, name) {
  const candidates = preferredFields[name] || Object.keys(rows[0]);
  const fields = candidates.filter((field) => rows.some((row) => row[field] != null && typeof row[field] !== "object"));
  return {
    fields,
    values: rows.map((row) => fields.map((field) => {
      const value = row[field];
      if (value == null) return "";
      if (typeof value === "boolean") return value ? "Yes" : "No";
      if (typeof value === "number") return value;
      const string = String(value);
      return /^[=+\-@]/.test(string) ? `'${string}` : string;
    })),
  };
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadExport(rows, name, format) {
  if (!rows?.length) throw new Error("No records to export");
  const { fields, values } = tableData(rows, name);
  if (!fields.length) throw new Error("No exportable fields were found");
  const filename = `entrain-${name}`;

  if (format === "csv") {
    const quote = (value) => `"${String(value).replaceAll('"', '""')}"`;
    const csv = "\uFEFF" + [fields, ...values].map((row) => row.map(quote).join(",")).join("\r\n");
    download(new Blob([csv], { type: "text/csv;charset=utf-8" }), `${filename}.csv`);
    return;
  }

  if (format === "xlsx") {
    const module = await import("exceljs");
    const ExcelJS = module.default || module;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(name.slice(0, 31));
    sheet.addRow(fields);
    values.forEach((row) => sheet.addRow(row));
    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF234D78" } };
    sheet.views = [{ state: "frozen", ySplit: 1 }];
    sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: values.length + 1, column: fields.length } };
    sheet.columns.forEach((column, index) => {
      column.width = Math.min(40, Math.max(14, fields[index].length + 2, ...values.map((row) => String(row[index]).length + 2)));
    });
    const buffer = await workbook.xlsx.writeBuffer();
    download(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `${filename}.xlsx`);
    return;
  }

  if (format === "pdf") {
    const [{ jsPDF }, { default: autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
    const document = new jsPDF({ orientation: "landscape", unit: "mm", format: "a3" });
    document.setFontSize(16);
    document.text(name.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()), 14, 17);
    document.setFontSize(9);
    document.text(`${rows.length} records`, 14, 24);
    autoTable(document, {
      head: [fields],
      body: values.map((row) => row.map((value) => String(value).replaceAll("₹", "INR "))),
      startY: 29,
      theme: "striped",
      styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
      headStyles: { fillColor: [35, 77, 120] },
      horizontalPageBreak: true,
      margin: 14,
    });
    download(document.output("blob"), `${filename}.pdf`);
    return;
  }

  throw new Error("Unsupported export format");
}
