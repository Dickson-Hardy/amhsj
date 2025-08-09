// Test script for registration endpoint
const fetch = require('node-fetch');

async function testRegistration() {
  const testData = {
    name: "Test User",
    email: "test@example.com",
    password: "password123",
    affiliation: "Test University",
    role: "author",
    researchInterests: ["IoT", "Smart Systems"]
  };

  try {
    console.log('Sending registration request...');
    console.log('Data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.text();
    console.log('Status:', response.status);
    console.log('Response:', result);
    
    if (!response.ok) {
      console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testRegistration();
