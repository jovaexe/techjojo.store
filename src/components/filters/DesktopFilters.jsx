// src/components/filters/DesktopFilters.jsx
import FiltersBase from "./FiltersBase";

export default function DesktopFilters(props) {
  const keys = [
    { key: "brand", label: "Brand" },
    { key: "cpu", label: "Processor", aliases: ["processor"] },
    { key: "ram", label: "RAM" },
    { key: "storage", label: "Storage", aliases: ["ssd", "hdd", "drive"] },
    { key: "gpu", label: "GPU", aliases: ["graphics"] },
    {
      key: "connectivity",
      label: "Connectivity",
      aliases: ["connectivi", "ports", "inputs", "io"],
    },
    { key: "condition", label: "Condition" },
    { key: "delivery", label: "Delivery" },
    { key: "bundle", label: "Bundle" },
  ];

  return <FiltersBase title="Filters — Desktops" keys={keys} {...props} />;
}
