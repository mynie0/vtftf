// api/script/[id].js
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'text/plain');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    const { id } = req.query;
    
    // Ambil credentials dari environment variables Vercel
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase credentials');
        return res.status(500).send('-- Configuration error: Missing database credentials');
    }
    
    try {
        const supabase = createClient(supabaseUrl, supabaseKey, {
            auth: { persistSession: false }
        });
        
        const { data, error } = await supabase
            .from('scripts')
            .select('content')
            .eq('id', id)
            .single();
        
        if (error) {
            console.error('Supabase error:', error);
            return res.status(404).send(`-- Script "${id}" not found\n-- Error: ${error.message}`);
        }
        
        if (!data || !data.content) {
            return res.status(404).send(`-- Script "${id}" has no content`);
        }
        
        // Return script content as plain text
        return res.status(200).send(data.content);
        
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).send(`-- Server error: ${error.message}`);
    }
}
