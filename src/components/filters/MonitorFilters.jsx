// src/components/filters/MonitorFilters.jsx
import FiltersBase from "./FiltersBase";

export default function MonitorFilters(props) {
  // Matches your monitor CSV header order; `id` and `img` are intentionally excluded.
  const keys = [
    // exact lower-case keys (with robust aliases for safety)
    // { key: "name", label: "Name" },
    { key: "brand", label: "Brand" },
    // { key: "price", label: "Price" },

    {
      key: "display",
      label: "Display",
      aliases: ["screen", "size", "screen_size", "display_size"],
    },
    {
      key: "refresh_rate",
      label: "Refresh Rate",
      aliases: ["hz", "refresh", "refresh rate", "refresh_ra"],
    },
    {
      key: "connectivity",
      label: "Connectivity",
      aliases: ["ports", "inputs", "connectivi"],
    },
    {
      key: "graphics_features",
      label: "Graphics Features",
      aliases: ["graphics_f", "adaptive_sync", "g_sync", "freesync", "sync"],
    },
    {
      key: "adjustment",
      label: "Adjustment",
      aliases: [
        "adjustmer",
        "adjustments",
        "ergonomics",
        "tilt",
        "swivel",
        "pivot",
        "height_adjust",
      ],
    },
    { key: "security", label: "Security" },
    {
      key: "eye_comfort",
      label: "Eye Comfort",
      aliases: ["eye_comf", "low_blue_light", "flicker_free"],
    },

    { key: "condition", label: "Condition" },
    { key: "delivery", label: "Delivery" },
    { key: "bundle", label: "Bundle" },
    { key: "category", label: "Category" },
    { key: "tags", label: "Tags" },
  ];

  return <FiltersBase title="Filters — Monitors" keys={keys} {...props} />;
}
