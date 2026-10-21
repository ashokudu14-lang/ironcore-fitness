import useLenis from "../../hooks/useLenis.js";
import "../../styles/dimensional.css";
import { Outlet } from "react-router-dom";
import MarketingHeader from "./MarketingHeader.jsx";
import MarketingFooter from "./MarketingFooter.jsx";

export default function MarketingLayout() {
  useLenis();
  return (
    <div className="marketing-site">
      <MarketingHeader />
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <MarketingFooter />
    </div>
  );
}
