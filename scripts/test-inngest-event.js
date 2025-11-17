const crypto = require('crypto');
const fetch = require('node-fetch');

// Load env from .env if present
require('dotenv').config();

const INNGEST_SIGNING_KEY = process.env.INNGEST_SIGNING_KEY;
if (!INNGEST_SIGNING_KEY) {
  console.error('INNGEST_SIGNING_KEY not set in .env');
  process.exit(1);
}

const url = process.env.TEST_INNGEST_URL || 'http://localhost:3000/api/inngest';

const payload = {
  id: 'evt_test_1',
  name: 'user.created',
  data: {
    id: 'test-user-123',
    email_addresses: [{ email_address: 'test@example.com' }],
    first_name: 'Test',
    last_name: 'User',
    image_url: null
  }
};

const body = JSON.stringify(payload);

// Sign using HMAC-SHA256 as Inngest expects
const signature = crypto.createHmac('sha256', INNGEST_SIGNING_KEY).update(body).digest('hex');

(async () => {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'inngest-signature': signature,
    },
    body,
  });

  console.log('Status:', res.status);
  console.log('Body:', await res.text());
})();
