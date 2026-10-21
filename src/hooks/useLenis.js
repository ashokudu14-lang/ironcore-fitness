import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
export default function useLenis() {
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let lenis;
    let tick;
    function setup() {
      if (lenis) {
        gsap.ticker.remove(tick);
        lenis.destroy();
        lenis = null;
      }
      if (media.matches) return;
      lenis = new Lenis({
        duration: 0.8,
        smoothWheel: true,
        syncTouch: false,
        anchors: true,
        prevent: (node) =>
          Boolean(
            node.closest(
              '[data-lenis-prevent], dialog, textarea, select, [role="listbox"], .table-scroll, .app-sidebar',
            ),
          ),
      });
      lenis.on("scroll", ScrollTrigger.update);
      tick = (time) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
    }
    const scroll = (event) =>
      lenis?.scrollTo(event.detail.target, { immediate: true, force: true });
    window.addEventListener("ironcore:scroll-to", scroll);
    setup();
    media.addEventListener("change", setup);
    return () => {
      media.removeEventListener("change", setup);
      window.removeEventListener("ironcore:scroll-to", scroll);
      if (lenis) {
        gsap.ticker.remove(tick);
        lenis.destroy();
      }
    };
  }, []);
}
