/**
 * Seed script: Creates the admin user in Supabase.
 *
 * Usage:
 *   1. Copy .env.local.example to .env.local and fill in your values
 *   2. Run: npm run seed
 */

import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

async function seed() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || "admin123";

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        username: "admin",
        password_hash: passwordHash,
        display_name: "Quản trị viên",
        role: "admin",
      },
      { onConflict: "username" },
    )
    .select();

  if (error) {
    console.error("Failed to seed admin user:", error.message);
    process.exit(1);
  }

  console.log("✅ Admin user seeded successfully:", data);
}

seed();
