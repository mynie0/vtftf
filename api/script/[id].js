// api/script/[id].js
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/plain');
    
    const { id } = req.query;
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        res.status(500).send('-- Supabase not configured');
        return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase
        .from('scripts')
        .select('content')
        .eq('id', id)
        .single();
    
    if (error || !data) {
        res.status(404).send(`-- Script "${id}" not found`);
        return;
    }
    
    res.status(200).send(data.content);
}
