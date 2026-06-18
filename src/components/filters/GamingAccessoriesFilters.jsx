// src/components/filters/GamingAccessoriesFilters.jsx
import FiltersBase from "./FiltersBase";

export default function GamingAccessoriesFilters(props) {
  const keys = [
    { key: "brand", label: "Brand" },
    // { key: "price", label: "Price" },

    // Truncated headers in your sheet, with robust aliases:
    {
      key: "connectivi",
      label: "Connectivity",
      aliases: [
        "connectivity",
        "connection",
        "wireless/wired",
        "wired",
        "wireless",
        "ports",
        "inputs",
      ],
    },
    {
      key: "special_fe",
      label: "Special Features",
      aliases: ["special_features", "rgb", "lighting", "macro", "software"],
    },
    {
      key: "build",
      label: "Build",
      aliases: ["build_quality", "material", "design"],
    },
    {
      key: "compatibi",
      label: "Compatibility",
      aliases: [
        "compatibility",
        "platform",
        "pc",
        "xbox",
        "playstation",
        "switch",
      ],
    },

    { key: "condition", label: "Condition" },
    { key: "delivery", label: "Delivery" },
    { key: "bundle", label: "Bundle" },
    { key: "category", label: "Category" },
    { key: "tags", label: "Tags" },

    // Optional: include name if you want a name filter
    // { key: "name", label: "Name" },
  ];

  return (
    <FiltersBase title="Filters — Gaming Accessories" keys={keys} {...props} />
  );
}
