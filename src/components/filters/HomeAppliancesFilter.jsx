import FiltersBase from "./FiltersBase";

/**
 * IMPORTANT:
 * This file MUST NOT use React hooks.
 * It is executed as a normal function via renderFilters().
 */

// Static keys (outside component)
const KEYS = [
  {
    key: "brand",
    label: "Brand",
    aliases: ["make", "manufacturer", "hisense", "lg", "binatone", "haier", "scanfrost"],
  },
  {
    key: "category",
    label: "Category",
    aliases: [
      "refrigerator",
      "washing machine",
      "air conditioner",
      "microwave",
      "freezer",
      "home appliance",
    ],
  },
  {
    key: "capacity",
    label: "Capacity",
    aliases: ["size", "liters", "litres", "kg", "hp", "volume"],
  },
  {
    key: "power",
    label: "Power",
    aliases: ["watt", "watts", "w", "energy", "consumption"],
  },
  {
    key: "special_features",
    label: "Special Features",
    aliases: [
      "no frost",
      "inverter",
      "fast cooling",
      "low noise",
      "grill",
      "timer",
      "fast freeze",
      "lockable",
    ],
  },
  {
    key: "control_type",
    label: "Control Type",
    aliases: ["digital", "manual", "remote", "touch", "button"],
  },
  {
    key: "build",
    label: "Build / Type",
    aliases: [
      "top freezer",
      "front load",
      "split unit",
      "countertop",
      "chest freezer",
      "double door",
    ],
  },
  {
    key: "condition",
    label: "Condition",
    aliases: ["brand new", "sealed", "used", "refurbished"],
  },
  {
    key: "delivery",
    label: "Delivery",
    aliases: ["pickup", "shipping", "nationwide", "lagos", "abuja"],
  },
  {
    key: "bundle",
    label: "Bundle",
    aliases: ["free gift", "accessories", "promo", "package"],
  },
  {
    key: "price",
    label: "Price",
    aliases: ["cost", "amount", "naira", "₦"],
  },
  {
    key: "tags",
    label: "Tags",
    aliases: ["popular", "new", "sale", "hot", "discount"],
  },
];

export default function HomeAppliancesFilters(props) {
  return (
    <FiltersBase
      title="Filters — Home Appliances"
      keys={KEYS}
      {...props}
    />
  );
}
