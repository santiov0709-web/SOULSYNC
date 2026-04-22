import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxwtxwkctkzjktpgufzc.supabase.co';
// Si esta key falla porque la plataforma ha cambiado el formato (normalmente empiezan con eyJ), el usuario la podrá actualizar.
const supabaseKey = 'sb_publishable_9HMh7EhnSiwh120rz1qw8g_Y5aqxR9Y';

export const supabase = createClient(supabaseUrl, supabaseKey);
