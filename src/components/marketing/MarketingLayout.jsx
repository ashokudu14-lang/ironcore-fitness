import { Outlet } from "react-router-dom";
import MarketingHeader from "./MarketingHeader.jsx";
import MarketingFooter from "./MarketingFooter.jsx";

export default function MarketingLayout() {
  return (
    <div className="marketing-site">
      <MarketingHeader />
      <main id="main-content">
        <Outlet />
      </main>
      <MarketingFooter />
    </div>
  );
}
