import useLenis from "../../hooks/useLenis.js";
import "../../styles/dimensional.css";
import { Outlet } from "react-router-dom";
import { useRef } from "react";
import PublicInteractions from "../motion/PublicInteractions.jsx";
import "../../styles/public-motion.css";
import MarketingHeader from "./MarketingHeader.jsx";
import MarketingFooter from "./MarketingFooter.jsx";

export default function MarketingLayout() {
  useLenis();
  const root = useRef(null);
  return (
    <div className="marketing-site" ref={root}>
      <PublicInteractions rootRef={root} />
      <MarketingHeader />
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <MarketingFooter />
    </div>
  );
}
