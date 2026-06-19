// src/components/filters/MonitorFilters.jsx
import FiltersBase from "./FiltersBase";

export default function MonitorFilters(props) {
  // Matches your monitor CSV header order; `id` and `img` are intentionally excluded.
  const keys = [
    { key: "brand", label: "Brand" },
    {
      key: "display",
      label: "Display",
      aliases: ["screen", "size", "screen_size", "display_size"],
    },
    {
      key: "ports",
      label: "Ports",
      aliases: ["connectivity", "inputs", "connectivi"],
    },
    {
      key: "adjustment",
      label: "Adjustment",
      aliases: ["adjustmer", "adjustments", "ergonomics", "tilt", "swivel", "pivot", "height_adjust"],
    },
    { key: "condition", label: "Condition" },
    { key: "delivery", label: "Delivery" },
    { key: "bundle", label: "Bundle" },
  ];

  return <FiltersBase title="Filters — Monitors" keys={keys} {...props} />;
}
