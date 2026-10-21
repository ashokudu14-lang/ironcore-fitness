import { useEffect, useRef, useState } from "react";

export default function CoreSculpture() {
  const host = useRef(null);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false),
    sceneRef = useRef(null),
    visibleRef = useRef(false);
  useEffect(() => {
    pausedRef.current = paused;
    sceneRef.current?.setActive(
      !paused && visibleRef.current && !document.hidden,
    );
  }, [paused]);
  useEffect(() => {
    const element = host.current;
    const eligible = matchMedia(
      "(min-width: 900px) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    let disposed = false,
      visible = false,
      generation = 0,
      scene;
    async function setup() {
      const ticket = ++generation;
      scene?.destroy();
      scene = null;
      sceneRef.current = null;
      delete element.dataset.ready;
      if (
        !eligible.matches ||
        !visible ||
        document.hidden ||
        navigator.connection?.saveData ||
        (navigator.deviceMemory && navigator.deviceMemory < 4)
      )
        return;
      try {
        // Check capability before downloading Three.js. Release this small probe immediately.
        const probe = document.createElement("canvas");
        const probeContext =
          probe.getContext("webgl2") || probe.getContext("webgl");
        if (!probeContext) return;
        probeContext.getExtension("WEBGL_lose_context")?.loseContext();
        const { createCoreScene } = await import("./createCoreScene.js");
        if (
          disposed ||
          ticket !== generation ||
          !visible ||
          document.hidden ||
          !eligible.matches
        )
          return;
        scene = createCoreScene(element);
        sceneRef.current = scene;
        scene?.setActive(!pausedRef.current);
        if (scene) element.dataset.ready = "true";
      } catch {
        /* The HTML/CSS sculpture remains if WebGL is unavailable. */
      }
    }
    const intersection = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        visibleRef.current = visible;
        if (!visible) {
          generation++;
          scene?.setActive(false);
        } else if (scene)
          scene.setActive(!document.hidden && !pausedRef.current);
        else setup();
      },
      { rootMargin: "0px" },
    );
    intersection.observe(element);
    const visibility = () => {
      if (document.hidden) {
        generation++;
        scene?.setActive(false);
      } else if (scene) scene.setActive(visible && !pausedRef.current);
      else setup();
    };
    const contextLost = (event) => {
      event.preventDefault();
      generation++;
      scene?.destroy();
      scene = null;
      sceneRef.current = null;
      delete element.dataset.ready;
    };
    element.addEventListener("webglcontextlost", contextLost, true);
    eligible.addEventListener("change", setup);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      disposed = true;
      generation++;
      intersection.disconnect();
      eligible.removeEventListener("change", setup);
      document.removeEventListener("visibilitychange", visibility);
      element.removeEventListener("webglcontextlost", contextLost, true);
      scene?.destroy();
      delete element.dataset.ready;
    };
  }, []);
  return (
    <>
      <div className="core-sculpture" ref={host} aria-hidden="true">
        <div className="sculpture-fallback">
          <div className="sculpture-orbit" />
          <div className="sculpture-orbit outer" />
          <div className="iron-emblem">
            <span />
            <span />
            <span />
          </div>
          <div className="sculpture-plinth" />
        </div>
      </div>
      <div className="sculpture-controls">
        <button
          type="button"
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
        >
          <span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span>
          {paused ? "Resume motion" : "Pause motion"}
        </button>
      </div>
    </>
  );
}
