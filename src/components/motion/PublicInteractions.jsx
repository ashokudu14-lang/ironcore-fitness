import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const excluded =
  'input,textarea,select,[contenteditable="true"],dialog,[role="dialog"],[role="listbox"],button:disabled,[aria-disabled="true"]';
const interactive = "a[href],button:not(:disabled)";
const magnets = ".button,.footer-start";
export default function PublicInteractions({ rootRef }) {
  const follower = useRef(null);
  useEffect(() => {
    const media = matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    const root = rootRef.current,
      ring = follower.current;
    let teardown;
    function setup() {
      teardown?.();
      teardown = undefined;
      if (!media.matches) return;
      root.dataset.pointerMotion = "true";
      let frame = 0,
        visible = false,
        magnet,
        card,
        hoverHero,
        heroRect;
      const point = { x: 0, y: 0, currentX: 0, currentY: 0 };
      function resetMagnet() {
        if (magnet) {
          magnet.element.style.removeProperty("--magnet-x");
          magnet.element.style.removeProperty("--magnet-y");
          magnet = null;
        }
      }
      function resetCard() {
        if (card) {
          card.element.style.removeProperty("--card-rx");
          card.element.style.removeProperty("--card-ry");
          card = null;
        }
      }
      function hide() {
        visible = false;
        ring.dataset.visible = "false";
        delete ring.dataset.pressed;
        cancelAnimationFrame(frame);
        frame = 0;
        resetMagnet();
        resetCard();
      }
      function tick() {
        frame = 0;
        if (!visible) return;
        point.currentX += (point.x - point.currentX) * 0.22;
        point.currentY += (point.y - point.currentY) * 0.22;
        ring.style.transform = `translate3d(${point.currentX}px,${point.currentY}px,0)`;
        if (
          Math.abs(point.x - point.currentX) > 0.15 ||
          Math.abs(point.y - point.currentY) > 0.15
        )
          frame = requestAnimationFrame(tick);
      }
      function state(target) {
        ring.dataset.interactive = Boolean(
          target?.closest(interactive),
        ).toString();
      }
      function move(event) {
        const target = event.target instanceof Element ? event.target : null;
        if (
          event.pointerType !== "mouse" ||
          !target ||
          !root.contains(target) ||
          target.closest(excluded)
        ) {
          hide();
          return;
        }
        point.x = event.clientX;
        point.y = event.clientY;
        if (!visible) {
          point.currentX = point.x;
          point.currentY = point.y;
          visible = true;
          ring.dataset.visible = "true";
        }
        state(target);
        if (!frame) frame = requestAnimationFrame(tick);
        const button = target.closest(magnets);
        if (button !== magnet?.element) {
          resetMagnet();
          if (button)
            magnet = { element: button, rect: button.getBoundingClientRect() };
        }
        if (magnet) {
          const { rect, element } = magnet;
          element.style.setProperty(
            "--magnet-x",
            `${Math.max(-5, Math.min(5, (event.clientX - rect.left - rect.width / 2) * 0.12))}px`,
          );
          element.style.setProperty(
            "--magnet-y",
            `${Math.max(-3, Math.min(3, (event.clientY - rect.top - rect.height / 2) * 0.12))}px`,
          );
        }
        const surface = target.closest(".bento-card");
        if (surface !== card?.element) {
          resetCard();
          if (surface)
            card = { element: surface, rect: surface.getBoundingClientRect() };
        }
        if (card) {
          const { rect, element } = card;
          const x = Math.max(
            -0.5,
            Math.min(0.5, (event.clientX - rect.left) / rect.width - 0.5),
          );
          const y = Math.max(
            -0.5,
            Math.min(0.5, (event.clientY - rect.top) / rect.height - 0.5),
          );
          element.style.setProperty("--card-rx", `${-y * 5}deg`);
          element.style.setProperty("--card-ry", `${x * 5}deg`);
        }
        const hero = target.closest(".dimensional-hero");
        if (hero !== hoverHero) {
          hoverHero = hero;
          heroRect = null;
        }
        if (hero) {
          heroRect ||= hero.getBoundingClientRect();
          hero.style.setProperty(
            "--light-x",
            `${event.clientX - heroRect.left}px`,
          );
          hero.style.setProperty(
            "--light-y",
            `${event.clientY - heroRect.top}px`,
          );
        }
      }
      function scroll() {
        resetMagnet();
        resetCard();
        heroRect = null;
        if (visible) {
          const target = document.elementFromPoint(point.x, point.y);
          if (!target || !root.contains(target) || target.closest(excluded)) {
            hide();
            return;
          }
          state(target);
        }
      }
      function out(event) {
        if (!event.relatedTarget) hide();
      }
      function down(event) {
        if (
          !(event.target instanceof Element) ||
          event.target.closest(excluded)
        ) {
          hide();
          return;
        }
        ring.dataset.pressed = "true";
      }
      function up() {
        delete ring.dataset.pressed;
      }
      function visibility() {
        if (document.hidden) hide();
      }
      document.addEventListener("pointermove", move, { passive: true });
      document.addEventListener("pointerout", out);
      document.addEventListener("pointerdown", down, { passive: true });
      document.addEventListener("pointerup", up, { passive: true });
      window.addEventListener("scroll", scroll, {
        passive: true,
        capture: true,
      });
      window.addEventListener("resize", scroll);
      window.addEventListener("blur", hide);
      window.addEventListener("keydown", hide);
      document.addEventListener("visibilitychange", visibility);
      teardown = () => {
        hide();
        delete root.dataset.pointerMotion;
        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointerout", out);
        document.removeEventListener("pointerdown", down);
        document.removeEventListener("pointerup", up);
        window.removeEventListener("scroll", scroll, true);
        window.removeEventListener("resize", scroll);
        window.removeEventListener("blur", hide);
        window.removeEventListener("keydown", hide);
        document.removeEventListener("visibilitychange", visibility);
        if (hoverHero) {
          hoverHero.style.removeProperty("--light-x");
          hoverHero.style.removeProperty("--light-y");
        }
      };
    }
    setup();
    media.addEventListener("change", setup);
    return () => {
      media.removeEventListener("change", setup);
      teardown?.();
    };
  }, [rootRef]);
  return createPortal(
    <div
      className="public-cursor"
      ref={follower}
      aria-hidden="true"
      data-visible="false"
    >
      <span className="public-cursor-ring">
        <span>
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 18 18 6 M6 6h12v12" />
          </svg>
        </span>
      </span>
    </div>,
    document.body,
  );
}
