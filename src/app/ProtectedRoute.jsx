import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient.js";

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState(
    isSupabaseConfigured ? "loading" : "configuration",
  );

  useEffect(() => {
    if (!supabase) {
      return undefined;
    }

    let active = true;

    const loadClaims = async () => {
      const {
        data: { claims },
      } = await supabase.auth.getClaims();

      if (active) {
        setStatus(claims?.sub ? "authenticated" : "anonymous");
      }
    };

    loadClaims();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadClaims();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="system-state" role="status">
        Checking your session.
      </div>
    );
  }

  if (status === "configuration") {
    return <Navigate to="/login?setup=required" replace />;
  }

  if (status !== "authenticated") {
    return <Navigate to="/login" replace />;
  }

  return children;
}
