const callNotePresets = [
  "Because of the distance",
  "Asked to call back later",
  "Price is a bit high",
  "Client will call back",
  "Needs a chef",
];

export default function CallNotePresets({ notes, onChange }) {
  const lines = notes.split("\n").map((line) => line.trim());
  return (
    <div className="call-note-presets" role="group" aria-label="Quick call notes">
      <span>Quick notes</span>
      <div>
        {callNotePresets.map((preset) => (
          <button key={preset} type="button" disabled={lines.includes(preset)}
            onClick={() => onChange(notes.trim() ? `${notes.trimEnd()}\n${preset}` : preset)}>
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
}
