import { useEffect } from "react";

const cursorSpring = { stiffness: 360, damping: 34, mass: 0.5, restDelta: 0.01 };

const SURFACE_SELECTOR = [
  ".marketing-site .preview-stat",
  ".marketing-site .preview-table",
  ".marketing-site .bento-card",
  ".marketing-site .process-item",
  ".marketing-site .final-cta",
  ".marketing-site .pricing-panel",
  ".marketing-site .button",
  ".marketing-site .text-button",
  ".marketing-site .marketing-nav a",
  ".marketing-site .brand-lockup",
  ".marketing-site .footer-links a",
  ".app-shell .app-stat-card",
  ".app-shell .app-panel",
  ".app-shell .app-nav-link",
  ".app-shell .member-row",
  ".app-shell .plan-row",
  ".auth-panel",
].join(",");

const WORD_CONTAINER_SELECTOR = [
  ".marketing-site h1",
  ".marketing-site h2",
  ".marketing-site h3",
  ".marketing-site p",
  ".marketing-site .eyebrow",
  ".marketing-site .button",
  ".marketing-site .text-button",
  ".marketing-site .marketing-nav a",
  ".marketing-site .brand-lockup strong",
  ".marketing-site .brand-lockup small",
  ".marketing-site .preview-bar",
  ".marketing-site .preview-sidebar span",
  ".marketing-site .preview-stat span",
  ".marketing-site .preview-stat strong",
  ".marketing-site .preview-date",
  ".marketing-site .footer-links a",
].join(",");

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function wrapWords(container) {
  if (container.dataset.wordTiltReady === "true") return;

  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (!node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT;

        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;

        if (
          parent.closest(
            ".cursor-word, .cursor-text-node, script, style, input, textarea, select, option"
          )
        ) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  textNodes.forEach((node) => {
    const wrapper = document.createElement("span");
    wrapper.className = "cursor-text-node";

    node.nodeValue.split(/(\s+)/).forEach((token) => {
      if (!token) return;

      if (/^\s+$/.test(token)) {
        wrapper.appendChild(document.createTextNode(token));
        return;
      }

      const word = document.createElement("span");
      word.className = "cursor-word";
      word.textContent = token;
      wrapper.appendChild(word);
    });

    node.replaceWith(wrapper);
  });

  container.dataset.wordTiltReady = "true";
}

function getSurfaceSettings(element) {
  if (
    element.matches(
      ".button, .text-button, .marketing-nav a, .app-nav-link, .footer-links a, .brand-lockup"
    )
  ) {
    return { maxTilt: 2.5, maxMove: 1.6, scale: 1.018, shine: 0.16 };
  }

  if (element.matches(".process-item, .member-row, .plan-row")) {
    return { maxTilt: 3.2, maxMove: 2.2, scale: 1.006, shine: 0.12 };
  }

  return { maxTilt: 5, maxMove: 3.5, scale: 1.012, shine: 0.2 };
}

export default function CursorInteractionLayer() {
  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!finePointer.matches || reducedMotion.matches) return undefined;

    document.body.classList.add("premium-pointer-enabled");

    const cursor = document.querySelector(".premium-cursor");
    if (!cursor) return undefined;

    const pointer = {
      targetX: window.innerWidth / 2,
      targetY: window.innerHeight / 2,
      currentX: window.innerWidth / 2,
      currentY: window.innerHeight / 2,
      pageX: 0,
      pageY: 0,
      velocityX: 0,
      velocityY: 0,
      lastFrame: performance.now(),
      visible: false,
    };

    let cursorFrame = 0;
    let wordFrame = 0;
    let enhanceFrame = 0;
    let wordEntries = [];
    let activeWords = new Set();
    let activeSurface = null;
    let observer;

    const refreshWordRects = () => {
      wordEntries = Array.from(document.querySelectorAll(".cursor-word")).map(
        (element) => {
          const rect = element.getBoundingClientRect();
          return {
            element,
            x: rect.left + rect.width / 2 + window.scrollX,
            y: rect.top + rect.height / 2 + window.scrollY,
          };
        }
      );
    };

    const enhance = () => {
      observer?.disconnect();

      document.querySelectorAll(SURFACE_SELECTOR).forEach((element) => {
        if (element.classList.contains("pointer-reactive")) return;

        const settings = getSurfaceSettings(element);
        element.classList.add("pointer-reactive");
        element.style.setProperty("--reactive-shine-opacity", settings.shine);
        element.dataset.reactiveTilt = String(settings.maxTilt);
        element.dataset.reactiveMove = String(settings.maxMove);
        element.dataset.reactiveScale = String(settings.scale);
      });

      document.querySelectorAll(WORD_CONTAINER_SELECTOR).forEach(wrapWords);

      requestAnimationFrame(refreshWordRects);
      observer?.observe(document.body, { childList: true, subtree: true });
    };

    const scheduleEnhance = () => {
      cancelAnimationFrame(enhanceFrame);
      enhanceFrame = requestAnimationFrame(enhance);
    };

    observer = new MutationObserver(scheduleEnhance);
    enhance();

    const resetSurface = (element) => {
      if (!element) return;
      element.style.setProperty("--reactive-axis-x", "0");
      element.style.setProperty("--reactive-axis-y", "1");
      element.style.setProperty("--reactive-angle", "0deg");
      element.style.setProperty("--reactive-x", "0px");
      element.style.setProperty("--reactive-y", "0px");
      element.style.setProperty("--reactive-scale", "1");
      element.style.setProperty("--reactive-shine-x", "50%");
      element.style.setProperty("--reactive-shine-y", "50%");
      element.classList.remove("is-pointer-active");
    };

    const updateSurface = (event) => {
      const surface = event.target.closest?.(".pointer-reactive");

      if (surface !== activeSurface) {
        resetSurface(activeSurface);
        activeSurface = surface;
      }

      cursor.classList.toggle("is-over-reactive", Boolean(surface));

      if (!surface) return;

      const rect = surface.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const nx = clamp(((event.clientX - rect.left) / rect.width - 0.5) * 2, -1, 1);
      const ny = clamp(((event.clientY - rect.top) / rect.height - 0.5) * 2, -1, 1);
      const rawLength = Math.hypot(nx, ny);
      const length = Math.max(rawLength, 0.001);
      const intensity = clamp(rawLength, 0, 1);
      const axisX = rawLength < 0.001 ? 0 : -ny / length;
      const axisY = rawLength < 0.001 ? 1 : nx / length;
      const maxTilt = Number(surface.dataset.reactiveTilt || 5);
      const maxMove = Number(surface.dataset.reactiveMove || 3);
      const hoverScale = Number(surface.dataset.reactiveScale || 1.01);

      surface.style.setProperty("--reactive-axis-x", String(axisX));
      surface.style.setProperty("--reactive-axis-y", String(axisY));
      surface.style.setProperty(
        "--reactive-angle",
        `${(maxTilt * intensity).toFixed(2)}deg`
      );
      surface.style.setProperty("--reactive-x", `${(nx * maxMove).toFixed(2)}px`);
      surface.style.setProperty("--reactive-y", `${(ny * maxMove).toFixed(2)}px`);
      surface.style.setProperty("--reactive-scale", String(hoverScale));
      surface.style.setProperty(
        "--reactive-shine-x",
        `${clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100).toFixed(1)}%`
      );
      surface.style.setProperty(
        "--reactive-shine-y",
        `${clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100).toFixed(1)}%`
      );
      surface.classList.add("is-pointer-active");
    };

    const updateWords = () => {
      wordFrame = 0;
      const radius = 118;
      const nextActive = new Set();

      wordEntries.forEach(({ element, x, y }) => {
        if (!element.isConnected) return;

        const dx = pointer.pageX - x;
        const dy = pointer.pageY - y;
        const distance = Math.hypot(dx, dy);

        if (distance >= radius) return;

        const strength = 1 - distance / radius;
        const horizontal = clamp(dx / radius, -1, 1);
        const vertical = clamp(dy / radius, -1, 1);
        const rotation = horizontal * 2.35 * strength;
        const moveX = horizontal * 1.25 * strength;
        const moveY = vertical * 0.9 * strength;

        element.style.rotate = `${rotation.toFixed(2)}deg`;
        element.style.translate = `${moveX.toFixed(2)}px ${moveY.toFixed(2)}px`;
        nextActive.add(element);
      });

      activeWords.forEach((element) => {
        if (nextActive.has(element)) return;
        element.style.rotate = "0deg";
        element.style.translate = "0px 0px";
      });

      activeWords = nextActive;
    };

    const scheduleWordUpdate = () => {
      if (wordFrame) return;
      wordFrame = requestAnimationFrame(updateWords);
    };

    const animateCursor = (now = performance.now()) => {
      const dt = Math.min((now - pointer.lastFrame) / 1000, 0.032);
      pointer.lastFrame = now;
      const spring = cursorSpring;
      const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
      const step = dt / steps;

      for (let index = 0; index < steps; index += 1) {
        const accelerationX =
          ((pointer.targetX - pointer.currentX) * spring.stiffness -
            pointer.velocityX * spring.damping) /
          spring.mass;
        const accelerationY =
          ((pointer.targetY - pointer.currentY) * spring.stiffness -
            pointer.velocityY * spring.damping) /
          spring.mass;
        pointer.velocityX += accelerationX * step;
        pointer.velocityY += accelerationY * step;
        pointer.currentX += pointer.velocityX * step;
        pointer.currentY += pointer.velocityY * step;
      }

      if (Math.abs(pointer.targetX - pointer.currentX) < spring.restDelta && Math.abs(pointer.velocityX) < spring.restDelta) {
        pointer.currentX = pointer.targetX;
        pointer.velocityX = 0;
      }
      if (Math.abs(pointer.targetY - pointer.currentY) < spring.restDelta && Math.abs(pointer.velocityY) < spring.restDelta) {
        pointer.currentY = pointer.targetY;
        pointer.velocityY = 0;
      }

      cursor.style.transform =
        `translate3d(${pointer.currentX}px, ${pointer.currentY}px, 0) translate(-50%, -50%)`;

      cursorFrame = requestAnimationFrame(animateCursor);
    };

    const handlePointerMove = (event) => {
      if (event.pointerType && event.pointerType !== "mouse") return;

      pointer.targetX = event.clientX;
      pointer.targetY = event.clientY;
      pointer.pageX = event.clientX + window.scrollX;
      pointer.pageY = event.clientY + window.scrollY;

      if (!pointer.visible) {
        pointer.currentX = event.clientX;
        pointer.currentY = event.clientY;
        pointer.velocityX = 0;
        pointer.velocityY = 0;
        pointer.visible = true;
        cursor.classList.add("is-visible");
      }

      updateSurface(event);
      scheduleWordUpdate();
    };

    const handlePointerDown = () => cursor.classList.add("is-down");
    const handlePointerUp = () => cursor.classList.remove("is-down");

    const handlePointerOut = (event) => {
      if (event.relatedTarget) return;
      pointer.visible = false;
      cursor.classList.remove("is-visible", "is-over-reactive", "is-down");
      resetSurface(activeSurface);
      activeSurface = null;

      activeWords.forEach((element) => {
        element.style.rotate = "0deg";
        element.style.translate = "0px 0px";
      });
      activeWords.clear();
    };

    const handleResize = () => {
      requestAnimationFrame(refreshWordRects);
    };

    document.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("pointerdown", handlePointerDown, { passive: true });
    document.addEventListener("pointerup", handlePointerUp, { passive: true });
    window.addEventListener("mouseout", handlePointerOut);
    window.addEventListener("resize", handleResize);

    cursorFrame = requestAnimationFrame(animateCursor);

    return () => {
      document.body.classList.remove("premium-pointer-enabled");
      observer?.disconnect();
      cancelAnimationFrame(cursorFrame);
      cancelAnimationFrame(wordFrame);
      cancelAnimationFrame(enhanceFrame);
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("mouseout", handlePointerOut);
      window.removeEventListener("resize", handleResize);
      resetSurface(activeSurface);
    };
  }, []);

  return <div className="premium-cursor" aria-hidden="true" />;
}
