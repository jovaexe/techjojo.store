// src/pages/Desktops.jsx
import ProductGrid from "../components/ProductGrid";
import DesktopFilters from "../components/filters/DesktopFilters";

export default function Desktops() {
  return (
    <ProductGrid
      title="desktops"
      sheetCsvUrl="https://docs.google.com/spreadsheets/d/e/2PACX-1vSPuCdo6sGWyH86QZWQLNZLA7Ybd4x_KoxBLLpo0qdZjAlgkvuunJaP8hp_ELQHy5sT_4BG61C0SrIu/pub?output=csv"
      pageSize={8}
      whatsAppNumber="+234 805 471 7837"
      renderFilters={DesktopFilters}
    />
  );
}
