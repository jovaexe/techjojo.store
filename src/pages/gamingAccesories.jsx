// src/pages/GamingAccessories.jsx
import ProductGrid from "../components/ProductGrid";
import GamingAccessoriesFilters from "../components/filters/GamingAccessoriesFilters";

export default function GamingAccessories() {
  return (
    <ProductGrid
      title="gaming accessories"
      sheetCsvUrl="https://docs.google.com/spreadsheets/d/e/2PACX-1vSsLafTJKrbBBRbcyq2w6J8TEQvMI3ZjqeSXshV-RZeD0tBPsWBC8oP_Clz59e9PMNAzYdjcnDWu_-x/pub?output=csv"
      pageSize={8}
      whatsAppNumber="+234 805 471 7837"
      renderFilters={GamingAccessoriesFilters}
    />
  );
}
