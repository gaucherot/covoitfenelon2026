// Netlify Function — proxy GitHub API
// Stocke le token côté serveur, invisible pour les clients

const GH_USER   = 'gaucherot';
const GH_REPO   = 'covoitfenelon2026';
const GH_FILE   = 'data.json';
const GH_BRANCH = 'main';
const GH_API    = `https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/${GH_FILE}`;

exports.handler = async function(event, context) {
  const token = process.env.GITHUB_TOKEN;

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: ''
    };
  }

  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    'User-Agent': 'covoitfenelon-app'
  };

  try {
    // GET — lire data.json
    if (event.httpMethod === 'GET') {
      const res = await fetch(`${GH_API}?ref=${GH_BRANCH}&t=${Date.now()}`, { headers });
      const data = await res.json();
      return {
        statusCode: res.status,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      };
    }

    // PUT — écrire data.json
    if (event.httpMethod === 'PUT') {
      const body = JSON.parse(event.body);
      const res = await fetch(GH_API, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          message: body.message || 'MAJ covoiturage',
          content: body.content,
          sha:     body.sha,
          branch:  GH_BRANCH
        })
      });
      const data = await res.json();
      return {
        statusCode: res.status,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      };
    }

    return { statusCode: 405, body: 'Method not allowed' };

  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: e.message })
    };
  }
};
