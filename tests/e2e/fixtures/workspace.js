// Isolated browser fixtures; never written to a live Supabase project.
const gymId = "11111111-1111-4111-8111-111111111111";
const userId = "22222222-2222-4222-8222-222222222222";
export const gym = {
  id: gymId,
  name: "IronCore Training Club",
  slug: "ironcore-training",
  timezone: "Asia/Kolkata",
  currency: "INR",
};
const members = Array.from({ length: 12 }, (_, i) => ({
  id: `member-${i}`,
  full_name: `Member ${String(i + 1).padStart(2, "0")}`,
  phone: `98765432${String(i).padStart(2, "0")}`,
  email: `member${i + 1}@example.com`,
  status: i === 11 ? "inactive" : "active",
  joined_at: "2026-10-01",
}));
const payments = [
  {
    id: "payment-1",
    member_id: "member-0",
    amount: 1200,
    method: "upi",
    paid_at: new Date().toISOString(),
    members: members[0],
    reference: "REF-001",
  },
  {
    id: "payment-2",
    member_id: "member-1",
    amount: 999,
    method: "cash",
    paid_at: new Date().toISOString(),
    members: members[1],
  },
];
const plans = [
  {
    id: "plan-1",
    name: "Monthly",
    price: 1200,
    duration_days: 30,
    active: true,
  },
];
const renewal = {
  id: "renewal-1",
  gym_id: gymId,
  member_id: "member-0",
  plan_id: "plan-1",
  end_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
  status: "active",
  members: members[0],
  membership_plans: plans[0],
};
export async function workspace(page, { empty = false, fail = false } = {}) {
  const now = Math.floor(Date.now() / 1000);
  const jwt = `${Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url")}.${Buffer.from(JSON.stringify({ sub: userId, role: "authenticated", aud: "authenticated", exp: now + 3600, iat: now })).toString("base64url")}.${Buffer.from("fixture-signature").toString("base64url")}`;
  await page.addInitScript(
    (session) =>
      localStorage.setItem(
        "sb-xdvmqysxxbtbrteykzbx-auth-token",
        JSON.stringify(session),
      ),
    {
      access_token: jwt,
      refresh_token: "test-refresh-token",
      expires_at: now + 3600,
      expires_in: 3600,
      token_type: "bearer",
      user: {
        id: userId,
        email: "owner@example.com",
        aud: "authenticated",
        role: "authenticated",
      },
    },
  );
  await page.route("https://*.supabase.co/**", async (route) => {
    const request = route.request(),
      url = new URL(request.url()),
      table = url.pathname.split("/").pop();
    let body;
    if (url.pathname.includes("/auth/"))
      body = {
        id: userId,
        email: "owner@example.com",
        aud: "authenticated",
        role: "authenticated",
      };
    else if (table === "gym_users") body = { gym_id: gymId, role: "owner" };
    else if (table === "gyms") body = gym;
    else if (fail && table === "payments")
      return route.fulfill({
        status: 503,
        headers: {
          "Retry-After": "0",
          "access-control-expose-headers": "Retry-After",
        },
        contentType: "application/json",
        body: JSON.stringify({ message: "Service temporarily unavailable" }),
      });
    else if (table === "members") body = empty ? [] : members;
    else if (table === "payments") body = empty ? [] : payments;
    else if (table === "subscriptions") body = empty ? [] : [renewal];
    else if (table === "membership_plans") body = plans;
    else body = [];
    if (request.method() === "POST") {
      const input = request.postDataJSON();
      body =
        table === "members"
          ? { ...members[0], id: "new-member", ...input }
          : table === "payments"
            ? {
                ...payments[0],
                id: "new-payment",
                ...input,
                members: members.find((m) => m.id === input.member_id),
              }
            : { ...renewal, id: "new-subscription", ...input };
    }
    if (request.method() === "PATCH")
      body = {
        ...(table === "gyms" ? gym : plans[0]),
        ...request.postDataJSON(),
      };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: {
        "access-control-expose-headers": "content-range",
        "content-range": `0-10/${empty ? 0 : 11}`,
      },
      body: request.method() === "HEAD" ? "" : JSON.stringify(body),
    });
  });
}
