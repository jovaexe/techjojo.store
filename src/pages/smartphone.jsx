// src/pages/Smartphones.jsx
import ProductGrid from "../components/ProductGrid";
import SmartphoneFilters from "../components/filters/SmartphoneFilters";

export default function Smartphones() {
  return (
    <ProductGrid
      title="smartphones"
      pageSize={8}
      sheetCsvUrl="https://docs.google.com/spreadsheets/d/e/2PACX-1vRZ64ouEghFYbhpBe_Y6ySWmm-HwqK8nKfZddvHEegQ__r56q6wzjHg0WdcqcX0aqn4la-cDoizVPId/pub?output=csv"
      whatsAppNumber="+234 805 471 7837"
      renderFilters={(fp) => <SmartphoneFilters {...fp} />}
    />
  );
}
