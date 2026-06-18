// src/components/filters/SmartphoneFilters.jsx
import { useMemo } from "react";
import FiltersBase from "./FiltersBase";

// small helper (kept local so this file is self-contained)
function findHeader(headers = [], candidates = []) {
  const lowers = headers.map((h) => h.toLowerCase());
  for (const c of candidates) {
    const i = lowers.indexOf(String(c).toLowerCase());
    if (i !== -1) return headers[i];
  }
  return null;
}

export default function SmartphoneFilters(props) {
  const { headers = [] } = props;

  // ✅ Master list — MATCHES YOUR CSV EXACTLY
  const rawKeys = [
    {
      key: "name",
      label: "Model",
      aliases: ["smartphone", "product name"],
    },
    {
      key: "brand",
      label: "Brand",
      aliases: ["make", "manufacturer"],
    },
    {
      key: "display",
      label: "Display",
      aliases: ["screen", "screen size"],
    },
    {
      key: "cpu",
      label: "Chip",
      aliases: ["processor", "chipset"],
    },
    {
      key: "ram",
      label: "RAM",
      aliases: ["memory"],
    },
    {
      key: "storage",
      label: "Storage",
      aliases: ["capacity", "gb"],
    },
    {
      key: "gpu",
      label: "GPU",
      aliases: ["graphics"],
    },
    {
      key: "features",
      label: "Features",
      aliases: ["special features"],
    },
    {
      key: "security",
      label: "Security",
      aliases: ["face id", "biometrics"],
    },
    {
      key: "battery",
      label: "Battery",
      aliases: ["battery health", "battery capacity", "cycles"],
    },
    {
      key: "condition",
      label: "Condition",
      aliases: ["state"],
    },
    {
      key: "delivery",
      label: "Delivery",
      aliases: ["shipping"],
    },
    {
      key: "bundle",
      label: "Bundle",
      aliases: ["box", "accessories", "included"],
    },
    {
      key: "category",
      label: "Category",
      aliases: ["type"],
    },
    {
      key: "tags",
      label: "Tags",
      aliases: ["label", "labels"],
    },
  ];

  // Only keep keys that actually exist in the current CSV headers
  const keys = useMemo(() => {
    return rawKeys
      .map((k) => {
        const hit = findHeader(headers, [k.key, ...(k.aliases || [])]);
        return hit ? k : null;
      })
      .filter(Boolean);
  }, [headers]);

  return (
    <FiltersBase
      title="Filters — Smartphones"
      keys={keys}
      {...props}
    />
  );
}
