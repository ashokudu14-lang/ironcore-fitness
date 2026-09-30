import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentGym } from "../services/gym.js";

export default function GymGate({ children }) {
  const [state, setState] = useState({ status: "loading", gym: null });

  useEffect(() => {
    let active = true;

    getCurrentGym()
      .then((gym) => {
        if (!active) return;
        setState(gym ? { status: "ready", gym } : { status: "missing", gym: null });
      })
      .catch(() => {
        if (!active) return;
        setState({ status: "error", gym: null });
      });

    return () => {
      active = false;
    };
  }, []);

  if (state.status === "loading") {
    return <div className="system-state">Loading your gym workspace.</div>;
  }

  if (state.status === "missing") {
    return <Navigate to="/onboarding" replace />;
  }

  if (state.status === "error") {
    return (
      <div className="system-state">
        Unable to load your gym workspace. Refresh and try again.
      </div>
    );
  }

  return children;
}
