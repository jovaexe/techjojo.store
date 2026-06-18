// src/components/filters/BusinessLaptopFilters.jsx
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

export default function BusinessLaptopFilters(props) {
  const { headers = [] } = props;

  // master list (labels + rich aliasing)
  const rawKeys = [
    { key: "brand",     label: "Brand",     aliases: ["make", "manufacturer"] },
    { key: "display",   label: "Display",   aliases: ["screen", "screen size", "panel", "display size"] },
    { key: "cpu",       label: "CPU",       aliases: ["processor", "chip", "processor model"] },
    { key: "ram",       label: "RAM",       aliases: ["memory", "system memory"] },
    { key: "storage",   label: "Storage",   aliases: ["ssd", "hdd", "drive", "disk"] },
    { key: "gpu",       label: "GPU",       aliases: ["graphics", "graphics card", "video", "graphics graphics"] },
    { key: "keyboard",  label: "Keyboard",  aliases: ["backlit", "keyboard type"] },
    { key: "security",  label: "Security",  aliases: ["fingerprint", "tpm", "smart card", "camera shutter"] },
    { key: "connectivity", label: "Connectivity", aliases: ["wifi", "bluetooth", "ports", "network"] },
    { key: "condition", label: "Condition", aliases: [] },
    { key: "delivery",  label: "Delivery",  aliases: ["shipping"] },
    { key: "bundle",    label: "Bundle",    aliases: ["freebies", "extras", "included"] },
    { key: "category",  label: "Category",  aliases: ["type", "segment"] },
    { key: "tags",      label: "Tags",      aliases: ["label", "labels"] },
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
      title="Filters — Business Laptops"
      keys={keys}
      {...props}
    />
  );
}
