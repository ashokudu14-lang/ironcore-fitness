import { supabase } from "../lib/supabaseClient.js";

export async function getDashboardData(gymId) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const renewalEnd = new Date();
  renewalEnd.setDate(now.getDate() + 7);

  const today = now.toISOString().slice(0, 10);
  const inSevenDays = renewalEnd.toISOString().slice(0, 10);

  const [
    activeMembersResult,
    renewalsResult,
    paymentsResult,
    recentPaymentsResult,
  ] = await Promise.all([
    supabase
      .from("members")
      .select("id", { count: "exact", head: true })
      .eq("gym_id", gymId)
      .eq("status", "active"),

    supabase
      .from("subscriptions")
      .select(`
        id,
        end_date,
        member_id,
        members!subscriptions_member_same_gym_fkey(full_name, phone)
      `)
      .eq("gym_id", gymId)
      .eq("status", "active")
      .gte("end_date", today)
      .lte("end_date", inSevenDays)
      .order("end_date", { ascending: true }),

    supabase
      .from("payments")
      .select("amount")
      .eq("gym_id", gymId)
      .gte("paid_at", monthStart),

    supabase
      .from("payments")
      .select(`
        id,
        amount,
        method,
        paid_at,
        members!payments_member_same_gym_fkey(full_name)
      `)
      .eq("gym_id", gymId)
      .order("paid_at", { ascending: false })
      .limit(5),
  ]);

  for (const result of [
    activeMembersResult,
    renewalsResult,
    paymentsResult,
    recentPaymentsResult,
  ]) {
    if (result.error) throw result.error;
  }

  const revenue = (paymentsResult.data || []).reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0,
  );

  return {
    activeMembers: activeMembersResult.count || 0,
    renewals: renewalsResult.data || [],
    revenue,
    recentPayments: recentPaymentsResult.data || [],
  };
}
