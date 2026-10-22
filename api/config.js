module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 's-maxage=86400');
  res.status(200).json({
    SUPABASE_URL: process.env.SUPABASE_URL || 'https://fklfhqhzjwrtnxkafeui.supabase.co',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'sb_publishable_TvMB1HDJ-69zITtdUl4nTQ_Uhi5agZu'
  });
};
