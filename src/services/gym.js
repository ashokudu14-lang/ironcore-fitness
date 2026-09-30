import { supabase } from "../lib/supabaseClient.js";

export async function getCurrentGym() {
  const {
    data: { claims },
    error: claimsError,
  } = await supabase.auth.getClaims();

  if (claimsError || !claims?.sub) {
    throw claimsError || new Error("No authenticated user.");
  }

  const { data: membership, error: membershipError } = await supabase
    .from("gym_users")
    .select("gym_id, role")
    .eq("user_id", claims.sub)
    .maybeSingle();

  if (membershipError) {
    throw membershipError;
  }

  if (!membership) {
    return null;
  }

  const { data: gym, error: gymError } = await supabase
    .from("gyms")
    .select("id, name, slug, timezone, currency")
    .eq("id", membership.gym_id)
    .single();

  if (gymError) {
    throw gymError;
  }

  return { ...gym, role: membership.role };
}

export async function createGymWorkspace({
  name,
  slug,
  timezone = "Asia/Kolkata",
  currency = "INR",
  planName,
  planPrice,
  planDurationDays,
}) {
  const {
    data: { claims },
    error: claimsError,
  } = await supabase.auth.getClaims();

  if (claimsError || !claims?.sub) {
    throw claimsError || new Error("No authenticated user.");
  }

  const { data: gym, error: gymError } = await supabase
    .from("gyms")
    .insert({
      name,
      slug,
      timezone,
      currency,
      created_by: claims.sub,
    })
    .select("id, name, slug, timezone, currency")
    .single();

  if (gymError) {
    throw gymError;
  }

  const { error: membershipError } = await supabase
    .from("gym_users")
    .insert({
      gym_id: gym.id,
      user_id: claims.sub,
      role: "owner",
    });

  if (membershipError) {
    throw membershipError;
  }

  const { error: planError } = await supabase
    .from("membership_plans")
    .insert({
      gym_id: gym.id,
      name: planName,
      price: planPrice,
      duration_days: planDurationDays,
    });

  if (planError) {
    throw planError;
  }

  return gym;
}
