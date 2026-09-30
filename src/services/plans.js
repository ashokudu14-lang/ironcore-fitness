import { supabase } from "../lib/supabaseClient.js";

export async function listPlans(gymId) {
  const { data, error } = await supabase
    .from("membership_plans")
    .select("id, name, duration_days, price, active")
    .eq("gym_id", gymId)
    .order("active", { ascending: false })
    .order("price", { ascending: true });

  if (error) throw error;
  return data;
}

export async function createPlan(gymId, input) {
  const { data, error } = await supabase
    .from("membership_plans")
    .insert({
      gym_id: gymId,
      name: input.name,
      duration_days: Number(input.durationDays),
      price: Number(input.price),
      active: true,
    })
    .select("id, name, duration_days, price, active")
    .single();

  if (error) throw error;
  return data;
}

export async function setPlanActive(planId, active) {
  const { data, error } = await supabase
    .from("membership_plans")
    .update({ active })
    .eq("id", planId)
    .select("id, name, duration_days, price, active")
    .single();

  if (error) throw error;
  return data;
}
