// src/pages/MacBook.jsx
import ProductGrid from "../components/ProductGrid";
import MacBookFilters from "../components/filters/Macbookfilter";

export default function MacBook() {
  return (
    <ProductGrid
      title="macbooks"
      // TODO: replace with your MacBook CSV publish link
      sheetCsvUrl="https://docs.google.com/spreadsheets/d/e/2PACX-1vQxuYThDUuYKmEwO5b1c30ym4Z7ZF8ID528VHQ97lQm1HdZxsAXmVdJpoGmOcYXvO4IptOyNmWsOsXF/pub?output=csv"
      pageSize={8}
      whatsAppNumber="+234 805 471 7837"
      renderFilters={(fp) => <MacBookFilters {...fp} />}
    />
  );
}
