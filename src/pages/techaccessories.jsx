// src/pages/GamingAccessories.jsx
import ProductGrid from "../components/ProductGrid";
import TechaccessoriesFilter from "../components/filters/techaccessoriesFilter";

export default function Techaccessories() {
  return (
    <ProductGrid
      title="tech accessories"
      sheetCsvUrl="https://docs.google.com/spreadsheets/d/e/2PACX-1vSsLafTJKrbBBRbcyq2w6J8TEQvMI3ZjqeSXshV-RZeD0tBPsWBC8oP_Clz59e9PMNAzYdjcnDWu_-x/pub?output=csv"
      pageSize={8}
      whatsAppNumber="+234 805 471 7837"
      renderFilters={TechaccessoriesFilter}
    />
  );
}
