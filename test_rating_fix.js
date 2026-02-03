// Test script to verify rating calculation fix
const axios = require('axios');

const API_BASE = 'http://localhost:4000';
const TEST_USER = {
  email: 'test@example.com',
  password: 'Test123!'
};

async function testRatingFix() {
  try {
    console.log('🧪 Testing Rating Calculation Fix...\n');
    
    // Login
    console.log('1. Logging in...');
    const loginRes = await axios.post(`${API_BASE}/api/auth/login`, TEST_USER);
    const token = loginRes.data.accessToken;
    console.log('✅ Login successful\n');
    
    // Get current user data
    console.log('2. Checking current user ratings...');
    const meRes = await axios.get(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const currentUser = meRes.data.user;
    console.log(`Current average rating: ${currentUser.averageRating}`);
    console.log(`Total ratings received: ${currentUser.totalRatingsReceived}\n`);
    
    // Get leaderboard to see current state
    console.log('3. Checking leaderboard...');
    const leaderboardRes = await axios.get(`${API_BASE}/api/contributors/leaderboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const topUsers = leaderboardRes.data.users.slice(0, 3);
    console.log('Top 3 users on leaderboard:');
    topUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} - Rating: ${user.averageRating} (${user.totalRatingsReceived} ratings)`);
    });
    
    console.log('\n✅ Test completed successfully!');
    console.log('Now try rating some answers in the UI to verify the fix works.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testRatingFix();