import { supabase } from "../lib/supabaseClient.js";

const addDays = (dateString, days) => {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + Number(days));
  return date.toISOString().slice(0, 10);
};

export async function createSubscription({
  gymId,
  memberId,
  plan,
  startDate,
}) {
  const endDate = addDays(startDate, plan.duration_days);

  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      gym_id: gymId,
      member_id: memberId,
      plan_id: plan.id,
      start_date: startDate,
      end_date: endDate,
      status: "active",
      price_snapshot: plan.price,
    })
    .select("id, member_id, plan_id, start_date, end_date, status, price_snapshot")
    .single();

  if (error) throw error;
  return data;
}

export async function listUpcomingRenewals(gymId, days = 7) {
  const today = new Date();
  const future = new Date();
  future.setDate(today.getDate() + days);

  const start = today.toISOString().slice(0, 10);
  const end = future.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("subscriptions")
    .select(`
      id,
      member_id,
      plan_id,
      start_date,
      end_date,
      status,
      price_snapshot,
      members!subscriptions_member_same_gym_fkey(full_name, phone),
      membership_plans!subscriptions_plan_same_gym_fkey(name, duration_days, price)
    `)
    .eq("gym_id", gymId)
    .eq("status", "active")
    .gte("end_date", start)
    .lte("end_date", end)
    .order("end_date", { ascending: true });

  if (error) throw error;
  return data;
}

export async function renewSubscription(subscription) {
  const plan = subscription.membership_plans;
  const startDate = subscription.end_date;

  return createSubscription({
    gymId: subscription.gym_id,
    memberId: subscription.member_id,
    plan: {
      id: subscription.plan_id,
      duration_days: plan.duration_days,
      price: plan.price,
    },
    startDate,
  });
}
