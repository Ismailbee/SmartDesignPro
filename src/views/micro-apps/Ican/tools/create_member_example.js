// Example node script to call the createMember Cloud Function
// Usage: node create_member_example.js

const fetch = require('node-fetch');
(async () => {
  const url = 'https://us-central1-YOUR_PROJECT.cloudfunctions.net/createMember';
  const body = {
    email: 'member@example.com',
    password: 'StrongPassword123!',
    displayName: 'Member Name',
    secretKey: 'YOUR_SECRET'
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  console.log(json);
})();