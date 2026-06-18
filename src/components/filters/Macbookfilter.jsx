// src/components/filters/MacBookFilters.jsx
import FiltersBase from "./FiltersBase";

export default function MacBookFilters(props) {
  const keys = [
    { key: "brand", label: "Brand", aliases: ["apple"] },
    { key: "model", label: "Model", aliases: ["series", "product", "macbook", "air", "pro"] },
    { key: "year", label: "Year", aliases: ["model year", "release year"] },
    {
      key: "chip",
      label: "Chip (CPU/GPU)",
      aliases: [
        "processor",
        "cpu",
        "apple silicon",
        "m1",
        "m2",
        "m3",
        "m4",
        "intel",
        "core i5",
        "core i7",
        "core i9",
      ],
    },
    { key: "gpu", label: "GPU", aliases: ["graphics", "integrated", "discrete"] },
    {
      key: "display",
      label: "Display",
      aliases: ["screen", "size", "inches", "resolution", "retina", "refresh rate", "hz"],
    },
    { key: "ram", label: "Memory (RAM)", aliases: ["memory", "unified memory"] },
    { key: "storage", label: "Storage", aliases: ["ssd", "capacity", "drive"] },
    { key: "battery", label: "Battery", aliases: ["cycles", "cycle", "health"] },
    { key: "keyboard", label: "Keyboard", aliases: ["layout", "backlit", "us", "uk", "nigerian"] },
    {
      key: "ports",
      label: "Ports",
      aliases: ["connectivity", "thunderbolt", "usb-c", "magsafe", "hdmi", "sd card", "io"],
    },
    { key: "camera", label: "Camera", aliases: ["facetime", "webcam"] },
    { key: "os", label: "macOS", aliases: ["os", "version", "ventura", "sonoma", "sequoia"] },
    { key: "color", label: "Color", aliases: ["colour", "finish", "space gray", "midnight", "silver"] },
    { key: "condition", label: "Condition" },
    { key: "warranty", label: "Warranty" },
    { key: "bundle", label: "Bundle", aliases: ["accessories"] },
    { key: "delivery", label: "Delivery" },
    { key: "category", label: "Category" },
    { key: "tags", label: "Tags" },
  ];

  return <FiltersBase title="Filters — MacBook" keys={keys} {...props} />;
}
