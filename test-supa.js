import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxwtxwkctkzjktpgufzc.supabase.co';
const supabaseKey = 'sb_publishable_9HMh7EhnSiwh120rz1qw8g_Y5aqxR9Y';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing insert...");
  const { data, error } = await supabase.from('messages').insert([{
    topic: 'test_topic',
    sender: 'test',
    type: 'test',
    payload: { hello: "world" }
  }]).select();
  
  if (error) {
    console.error("Supabase Error:", error);
  } else {
    console.log("Supabase Success:", data);
  }
}
test();
