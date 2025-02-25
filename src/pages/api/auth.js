const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

var client = jwksClient({
  jwksUri: process.env.JWKS_URI,
  requestHeaders: {}, // Optional
  timeout: 30000, // Defaults to 30
});
function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    var signingKey = key?.publicKey || key?.rsaPublicKey;
    callback(null, signingKey);
  });
}

export default function handler(req, res) {
  switch (req.method) {
    case 'GET':
      res.send(authenticate());
      return;
    default:
      return res.status(405).end(`Method ${req.method} Not allowed`);
  }

  async function authenticate() {
    try {
      return await jwt.verify(req.query.token, getKey, function (err, decoded) {
        return decoded;
      });
    } catch (err) {
      throw err;
    }
  }
}
