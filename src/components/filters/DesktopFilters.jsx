// src/components/filters/DesktopFilters.jsx
import FiltersBase from "./FiltersBase";

export default function DesktopFilters(props) {
  const keys = [
    { key: "brand", label: "Brand" },
    // { key: "price", label: "Price" },
    { key: "cpu", label: "CPU", aliases: ["processor"] },
    {
      key: "motherboard",
      label: "Motherboard",
      aliases: ["motherbo", "board", "mobo"],
    },
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
    { key: "category", label: "Category" },
    { key: "tags", label: "Tags" },
    // If you want to filter by the product name too:
    // { key: "name", label: "Name" },
  ];

  return <FiltersBase title="Filters — Desktops" keys={keys} {...props} />;
}
