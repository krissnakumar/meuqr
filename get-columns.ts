import { supabaseAdmin as supabase } from "./apps/web/src/lib/supabase-admin";

async function main() {
  const { data, error } = await supabase.from('businesses').select('*').limit(1);
  if (error) {
    console.error(error);
  } else {
    if (data && data.length > 0) {
      console.log(Object.keys(data[0]));
    } else {
      console.log("No data");
    }
  }
}

main();
