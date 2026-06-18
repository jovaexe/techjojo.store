// src/pages/Monitors.jsx
import ProductGrid from "../components/ProductGrid";
import MonitorFilters from "../components/filters/MonitorFilters";

export default function Monitors() {
  return (
    <ProductGrid
      title="monitors"
      sheetCsvUrl="https://docs.google.com/spreadsheets/d/e/2PACX-1vQ5ft5ucwP62CICVLAdQ3mhbd_d-kVAADV-0smlETAwSyvo_4C4N8WF78P0ygmXd4QTLU8XmlTfFXUn/pub?output=csv"
      pageSize={8}
      whatsAppNumber="+234 805 471 7837"
      renderFilters={(fp) => <MonitorFilters {...fp} />}
    />
  );
}
