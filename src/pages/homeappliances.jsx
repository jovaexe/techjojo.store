import ProductGrid from "../components/ProductGrid";
import HomeAppliancesFilters from '../components/filters/HomeAppliancesFilter'

export default function HomeAppliances() {
  return (
    <ProductGrid
      title="home appliances"
      sheetCsvUrl="https://docs.google.com/spreadsheets/d/e/2PACX-1vQhRTH6lqI4LnjJs8JI_CcK9YDfAHPLAFcXHdMBD5OhqT0WKsABx3ML9RPTYuBmeSKiXUIyQrioHj0V/pub?output=csv"
      pageSize={8}
      whatsAppNumber="+2348054717837"
      renderFilters={HomeAppliancesFilters}
    />
  );
}
