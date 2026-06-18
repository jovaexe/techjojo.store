 
// src/pages/BusinessLaptops.jsx
import ProductGrid from "../components/ProductGrid";
import BusinessLaptopFilters from "../components/filters/BusinessLaptopFilters";

export default function BusinessLaptops() {
  return (
    <ProductGrid
      title="business laptops"
      sheetCsvUrl="https://docs.google.com/spreadsheets/d/e/2PACX-1vQxW6gngjCF1L1wNTUdW-Bq9lTE5PBLAPVvQQKjvjFoiqvA9wDuqrPfFhcNTdImuF1V9-2g_ZDGzJEl/pub?output=csv"
      pageSize={8}
      renderFilters={(fp) => <BusinessLaptopFilters {...fp} />}
    />
  );
}
