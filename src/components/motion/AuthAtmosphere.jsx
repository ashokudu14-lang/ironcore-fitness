import { useEffect, useRef } from "react";
export default function AuthAtmosphere() {
  const ref = useRef(null);
  useEffect(() => {
    const media = matchMedia(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference) and (pointer: fine)",
    );
    let effect,
      disposed = false,
      generation = 0;
    let visible = false;
    const element = ref.current;
    async function setup() {
      const ticket = ++generation;
      effect?.destroy();
      effect = null;
      if (
        document.hidden ||
        !visible ||
        !media.matches ||
        navigator.connection?.saveData ||
        (navigator.deviceMemory && navigator.deviceMemory < 4)
      )
        return;
      try {
        const canvas = document.createElement("canvas");
        const context =
          canvas.getContext("webgl2") || canvas.getContext("webgl");
        if (!context) return;
        context.getExtension("WEBGL_lose_context")?.loseContext();
        const [THREE, module] = await Promise.all([
          import("three"),
          import("vanta/dist/vanta.net.min.js"),
        ]);
        if (
          disposed ||
          ticket !== generation ||
          !visible ||
          document.hidden ||
          !media.matches
        )
          return;
        const NET = module.default?.default || module.default;
        effect = NET({
          el: element,
          THREE,
          mouseControls: false,
          touchControls: false,
          gyroControls: false,
          color: 0x632a33,
          backgroundColor: 0x101115,
          points: 7,
          maxDistance: 19,
          spacing: 19,
          showDots: false,
          scale: 1.5,
          scaleMobile: 2,
        });
      } catch {
        /* The static CSS atmosphere remains when WebGL is unavailable. */
      }
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) setup();
      else {
        generation++;
        effect?.destroy();
        effect = null;
      }
    });
    observer.observe(element);
    media.addEventListener("change", setup);
    const visibility = () => {
      if (document.hidden) {
        generation++;
        effect?.destroy();
        effect = null;
      } else setup();
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      disposed = true;
      generation++;
      observer.disconnect();
      media.removeEventListener("change", setup);
      document.removeEventListener("visibilitychange", visibility);
      effect?.destroy();
    };
  }, []);
  return <div ref={ref} className="auth-atmosphere" aria-hidden="true" />;
}
