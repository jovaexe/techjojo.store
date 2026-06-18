// src/components/filters/SpecSelect.jsx
import { useEffect, useMemo, useState } from "react";

function cleanOne(v) {
  if (v == null) return "";
  let s = String(v)
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  s = s.replace(/^"+|"+$/g, "").replace(/^'+|'+$/g, "").trim();
  return s;
}

/** Normalize an option into { label, value, count, disabled } */
function normalizeOption(opt) {
  if (opt == null) return null;
  if (typeof opt === "string" || typeof opt === "number") {
    const v = cleanOne(opt);
    return v ? { label: v, value: v } : null;
  }
  if (typeof opt === "object") {
    const value = cleanOne(opt.value ?? opt.label ?? "");
    const label = cleanOne(opt.label ?? value);
    if (!value) return null;
    return {
      label,
      value,
      count: typeof opt.count === "number" ? opt.count : undefined,
      disabled: Boolean(opt.disabled),
    };
  }
  return null;
}

export default function SpecSelect({
  label,
  value,                 // external controlled value (can be undefined)
  options,
  onChange,
  disabled = false,
  placeholder = "Any",
  hidePlaceholder = false,
  className = "",
  name,
  id,
  required = false,
  showClear = true,
  allowUnknownValue = false, // keep showing selected value even if options change
}) {
  // Normalize options
  const safeOptions = useMemo(
    () => (Array.isArray(options) ? options.map(normalizeOption).filter(Boolean) : []),
    [options]
  );
  const valuesSet = useMemo(
    () => new Set(safeOptions.map((o) => o.value)),
    [safeOptions]
  );

  // Controlled-with-fallback state:
  const [local, setLocal] = useState("");
  const externalProvided = value !== undefined && value !== null;

  // Sync local when external changes
  useEffect(() => {
    if (externalProvided) setLocal(cleanOne(value));
  }, [value, externalProvided]);

  // Determine incoming and display values
  const incomingValue = externalProvided ? cleanOne(value) : cleanOne(local);
  const hasInOptions = valuesSet.has(incomingValue);
  const willShowUnknown = allowUnknownValue && incomingValue && !hasInOptions;

  const selectValue = hasInOptions
    ? incomingValue
    : willShowUnknown
    ? incomingValue
    : "";

  const selectId =
    id || (label ? `select-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);
  const isInvalid = required && !selectValue;

  // Unified change handler — updates local and notifies parent
  const handleChange = (next) => {
    const cleaned = cleanOne(next);
    setLocal(cleaned);                // keep UI responsive even if parent delays
    if (typeof onChange === "function") onChange(cleaned);
  };

  const handleClear = () => handleChange("");

  return (
    <label className={`flex flex-col gap-1 text-[11px] ${className}`}>
      {label && (
        <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
      )}

      <div className="relative">
        <select
          id={selectId}
          name={name}
          required={required}
          aria-invalid={isInvalid ? "true" : "false"}
          value={selectValue}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          className="w-full appearance-none rounded-md border bg-white px-3 py-1.5 pr-8 text-xs outline-none ring-0 transition disabled:opacity-50 focus:border-gray-400 dark:bg-neutral-900 dark:border-neutral-700 dark:text-gray-100 dark:focus:border-neutral-500"
        >
          {!hidePlaceholder && <option value="">{placeholder}</option>}
          {/* Preserve unknown current value if allowed */}
          {willShowUnknown && <option hidden value={incomingValue}>{incomingValue}</option>}

          {safeOptions.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.count != null ? `${opt.label} (${opt.count})` : opt.label}
            </option>
          ))}
        </select>

        {/* caret */}
        <svg
          className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>

        {/* Clear button */}
        {showClear && selectValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-7 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-neutral-800"
            title="Clear"
            aria-label="Clear selection"
          >
            ×
          </button>
        )}
      </div>
    </label>
  );
}
