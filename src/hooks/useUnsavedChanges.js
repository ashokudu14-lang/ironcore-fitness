import { useEffect, useRef } from "react";
import { useBlocker } from "react-router-dom";
export default function useUnsavedChanges(dirty) {
  const signOutAllowed = useRef(false);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty &&
      !signOutAllowed.current &&
      (currentLocation.pathname !== nextLocation.pathname ||
        currentLocation.search !== nextLocation.search),
  );
  useEffect(() => {
    if (blocker.state !== "blocked") return;
    if (window.confirm("Leave this page? Your unsaved changes will be lost."))
      blocker.proceed();
    else blocker.reset();
  }, [blocker]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const signOut = (event) => {
      if (!window.confirm("Log out? Your unsaved changes will be lost."))
        event.preventDefault();
      else signOutAllowed.current = true;
    };
    const reset = () => {
      signOutAllowed.current = false;
    };
    window.addEventListener("beforeunload", warn);
    window.addEventListener("ironcore:before-signout", signOut);
    window.addEventListener("ironcore:signout-cancelled", reset);
    return () => {
      window.removeEventListener("beforeunload", warn);
      window.removeEventListener("ironcore:before-signout", signOut);
      window.removeEventListener("ironcore:signout-cancelled", reset);
    };
  }, [dirty]);
}
