// src/components/filters/GamingLaptopFilters.jsx
import FiltersBase from "./FiltersBase";

export default function GamingLaptopFilters(props) {
  // Matches your CSV headers (lowercase). `id` and `img` are intentionally excluded.
  const keys = [
    { key: "brand", label: "Brand" },
    // { key: "price", label: "Price" },
    { key: "gpu", label: "GPU", aliases: ["graphics"] },
    { key: "cpu", label: "CPU", aliases: ["processor"] },
    { key: "ram", label: "RAM" },
    { key: "storage", label: "Storage", aliases: ["ssd", "hdd", "drive"] },
    { key: "display", label: "Display", aliases: ["screen", "screen size"] },
    { key: "keyboard", label: "Keyboard", aliases: ["backlit", "rgb"] },
    {
      key: "security",
      label: "Security",
      aliases: ["fingerprint", "tpm", "smart card"],
    },
    { key: "condition", label: "Condition" },
    { key: "delivery", label: "Delivery" },
    { key: "bundle", label: "Bundle" },
    { key: "category", label: "Category" },
    // { key: "tags",      label: "Tags" },
    // If you want to filter by product name as well, uncomment:
    // { key: "name", label: "Name" },
  ];

  return (
    <FiltersBase title="Filters — Gaming Laptops" keys={keys} {...props} />
  );
}
