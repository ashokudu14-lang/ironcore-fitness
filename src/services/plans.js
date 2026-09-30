import { supabase } from "../lib/supabaseClient.js";

export async function listPlans(gymId) {
  const { data, error } = await supabase
    .from("membership_plans")
    .select("id, name, duration_days, price, active")
    .eq("gym_id", gymId)
    .eq("active", true)
    .order("price", { ascending: true });

  if (error) throw error;
  return data;
}
