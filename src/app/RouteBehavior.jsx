import { useEffect } from "react";
import { useLocation } from "react-router-dom";
export default function RouteBehavior() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const titles = {
      "/": "Gym management software",
      "/pricing": "Pricing",
      "/privacy": "Privacy Policy",
      "/terms": "Terms and Conditions",
      "/login": "Log in",
      "/signup": "Create account",
      "/onboarding": "Set up your gym",
    };
    if (titles[pathname]) document.title = `${titles[pathname]} · IronCore OS`;
    let target = 0;
    try {
      target = hash
        ? document.getElementById(decodeURIComponent(hash.slice(1))) || 0
        : 0;
    } catch {
      /* Ignore malformed URL hashes. */
    }
    if (target) target.scrollIntoView({ behavior: "instant" });
    else window.scrollTo({ top: 0, behavior: "instant" });
    window.dispatchEvent(
      new CustomEvent("ironcore:scroll-to", { detail: { target } }),
    );
    const heading = document.querySelector("main h1");
    if (!hash && heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }
  }, [pathname, hash]);
  return null;
}
