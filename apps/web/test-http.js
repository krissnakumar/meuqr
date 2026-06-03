const fs = require('fs');
const path = require('path');

async function run() {
  console.log('Fetching public business page /santa-ines-construction...');
  const res = await fetch(`http://localhost:3001/santa-ines-construction`, {
    redirect: 'manual'
  });
  
  console.log('Status:', res.status);
  console.log('Headers:', Object.fromEntries(res.headers.entries()));
  
  const text = await res.text();
  console.log('Body snippet:', text.substring(0, 1000));
}

run();
