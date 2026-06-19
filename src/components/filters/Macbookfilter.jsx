// src/components/filters/MacBookFilters.jsx
import FiltersBase from "./FiltersBase";

export default function MacBookFilters(props) {
  const keys = [
    { key: "brand", label: "Brand" },
    { key: "cpu", label: "CPU" },
    { key: "gpu", label: "GPU" },
    { key: "display", label: "Display" },
    { key: "ram", label: "RAM" },
    { key: "storage", label: "Storage" },
    { key: "keyboard", label: "Keyboard" },
    { key: "condition", label: "Condition" },
    { key: "bundle", label: "Bundle" },
    { key: "delivery", label: "Delivery" },
  ];

  return <FiltersBase title="Filters — MacBook" keys={keys} {...props} />;
}
