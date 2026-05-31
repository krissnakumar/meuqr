import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .limit(1);

  if (error) {
    console.error("Error:", error.message);
  } else {
    if (data && data.length > 0) {
      console.log("Success! Columns:", Object.keys(data[0]));
    } else {
      console.log("No data, but table exists. Can't infer columns easily.");
    }
  }
}

check();
