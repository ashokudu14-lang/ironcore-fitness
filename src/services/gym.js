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

  const { data: gym, error: workspaceError } = await supabase.rpc(
    "create_gym_workspace",
    {
      p_name: name,
      p_slug: slug,
      p_timezone: timezone,
      p_currency: currency,
      p_plan_name: planName,
      p_plan_price: planPrice,
      p_plan_duration_days: planDurationDays,
    },
  );

  if (workspaceError) {
    throw workspaceError;
  }

  return gym;
}


export async function updateGym(gymId, input) {
  const { data, error } = await supabase
    .from("gyms")
    .update({
      name: input.name,
      timezone: input.timezone,
      currency: input.currency,
      updated_at: new Date().toISOString(),
    })
    .eq("id", gymId)
    .select("id, name, slug, timezone, currency")
    .single();

  if (error) throw error;
  return data;
}
