import { query } from "@/lib/db/pool";

let ipCounter = 0;
/** A fresh visitor address per call, so rate limits from one test don't leak into another. */
export const freshIp = () => `10.${Math.floor(++ipCounter / 250)}.${ipCounter % 250}.${(Date.now() % 200) + 1}`;

export function jsonRequest(url: string, body: unknown, ip = freshIp()) {
  return new Request(`https://premium1logistics.com${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-real-ip": ip },
    body: JSON.stringify(body),
  });
}

export async function createStaff(email: string, role = "admin", isActive = true) {
  const { rows } = await query<{ id: string }>(
    `INSERT INTO staff_users (email, full_name, role, is_active) VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role, is_active = EXCLUDED.is_active
     RETURNING id`,
    [email, "Test Staff", role, isActive],
  );
  return rows[0].id;
}

export const validQuote = {
  origin: "Shanghai, China",
  destination: "Tema, Ghana",
  method: "sea",
  cargo: { type: "Machinery", dimensions: "120x80x100", weight: "1500", quantity: "2 pallets" },
  requirements: "FOB, need by March",
  full_name: "Ama Mensah",
  company_name: "Mensah Imports",
  email: "ama@example.com",
  phone: "+233 24 000 0000",
};
