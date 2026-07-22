export default function Footer({ onSave, onReset, isSaving }) {
  return (
    <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
      <button
        onClick={onReset}
        className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700 active:scale-95 transition-all duration-150">
        Reset{" "}
      </button>{" "}
      <button
        onClick={onSave}
        disabled={isSaving}
        className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-500 active:scale-95 disabled:bg-green-900 disabled:cursor-not-allowed transition-all duration-150 font-medium">
        {" "}
        {isSaving ? "Saving..." : "Save"}{" "}
      </button>{" "}
    </div>
  );
}
