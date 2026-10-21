import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { markLaunchSeen } from "../../lib/launchSession.js";

export default function LaunchIntro({ enabled }) {
  const [complete, setComplete] = useState(!enabled);
  const ref = useRef(null);
  useEffect(() => {
    if (!enabled) return;
    const element = ref.current;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let done = false,
      timeline,
      timer;
    const clear = () => {
      clearTimeout(timer);
      window.removeEventListener("pointerdown", finish, true);
      window.removeEventListener("keydown", finish, true);
      document.removeEventListener("visibilitychange", visibility);
      reduced.removeEventListener("change", preference);
    };
    function finish(event) {
      if (done) return;
      done = true;
      clear();
      timeline?.kill();
      if (event?.type === "keydown" || event?.type === "pointerdown")
        window.dispatchEvent(new Event("ironcore:launch-skip"));
      setComplete(true);
    }
    function visibility() {
      if (document.hidden) finish();
    }
    function preference() {
      if (reduced.matches) finish();
    }
    markLaunchSeen();
    window.addEventListener("pointerdown", finish, true);
    window.addEventListener("keydown", finish, true);
    document.addEventListener("visibilitychange", visibility);
    reduced.addEventListener("change", preference);
    timer = setTimeout(finish, 1600);
    timeline = gsap.timeline({ onComplete: finish });
    timeline
      .from(element.querySelector(".launch-emblem"), {
        rotationY: 70,
        opacity: 0,
        duration: 0.42,
        ease: "power3.out",
      })
      .from(
        element.querySelector(".launch-wordmark"),
        { y: 18, opacity: 0, duration: 0.4, ease: "power3.out" },
        0.08,
      )
      .from(
        element.querySelector(".launch-motto"),
        { y: 8, opacity: 0, duration: 0.35 },
        0.18,
      )
      .from(
        element.querySelector(".launch-rule"),
        { scaleX: 0, duration: 0.5, ease: "power2.inOut" },
        0.05,
      )
      .to(
        element,
        { yPercent: -100, duration: 0.44, ease: "power3.inOut" },
        0.58,
      );
    return () => {
      done = true;
      clear();
      timeline?.revert();
    };
  }, [enabled]);
  if (complete) return null;
  return createPortal(
    <div ref={ref} className="launch-intro" aria-hidden="true">
      <div className="launch-lockup">
        <span className="launch-emblem">I</span>
        <span className="launch-wordmark">
          IronCore<span>OS</span>
        </span>
        <span className="launch-motto">YOUR GYM. YOUR MOMENTUM.</span>
        <span className="launch-rule" />
      </div>
      <span className="launch-corner">BUILT TO MOVE FORWARD.</span>
    </div>,
    document.body,
  );
}
