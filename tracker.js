
const axios = require('axios');
async function trackSPX(code) {
  const r = await axios.post(
    'https://spx.vn/api/v2/fleet_order/tracking/search',
    { tracking_number: code, language: 'vi' },
    { headers: { 'content-type': 'application/json' } }
  );
  if (!r.data.data) return null;
  return {
    status: r.data.data.current_status,
    timeline: r.data.data.tracking_info
  };
}
module.exports = { trackSPX };
