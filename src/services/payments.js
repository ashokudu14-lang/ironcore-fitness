import { supabase } from "../lib/supabaseClient.js";

export async function listPayments(gymId, limit = 50) {
  const { data, error } = await supabase
    .from("payments")
    .select(`
      id,
      member_id,
      subscription_id,
      amount,
      method,
      paid_at,
      reference,
      notes,
      members!payments_member_same_gym_fkey(full_name, phone)
    `)
    .eq("gym_id", gymId)
    .order("paid_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function createPayment(gymId, input) {
  const { data, error } = await supabase
    .from("payments")
    .insert({
      gym_id: gymId,
      member_id: input.memberId,
      subscription_id: input.subscriptionId || null,
      amount: Number(input.amount),
      method: input.method,
      reference: input.reference || null,
      notes: input.notes || null,
      paid_at: input.paidAt || new Date().toISOString(),
    })
    .select(`
      id,
      member_id,
      subscription_id,
      amount,
      method,
      paid_at,
      reference,
      notes,
      members!payments_member_same_gym_fkey(full_name, phone)
    `)
    .single();

  if (error) throw error;
  return data;
}
