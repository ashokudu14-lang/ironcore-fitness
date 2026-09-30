import { supabase } from "../lib/supabaseClient.js";

export async function listMembers(gymId) {
  const { data, error } = await supabase
    .from("members")
    .select("id, full_name, phone, email, status, joined_at, created_at")
    .eq("gym_id", gymId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createMember(gymId, input) {
  const { data, error } = await supabase
    .from("members")
    .insert({
      gym_id: gymId,
      full_name: input.fullName,
      phone: input.phone,
      email: input.email || null,
      joined_at: input.joinedAt,
      status: "active",
    })
    .select("id, full_name, phone, email, status, joined_at, created_at")
    .single();

  if (error) throw error;
  return data;
}
