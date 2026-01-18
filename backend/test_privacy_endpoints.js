#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:3002';

// Test user ID
const TEST_USER_ID = 'test-user-' + Date.now();

async function testPrivacyEndpoints() {
  console.log('🧪 Testing WhisperCart Privacy Endpoints\n');

  try {
    // Test 1: Privacy Summary
    console.log('1️⃣ Testing GET /privacy/summary/:userId');
    try {
      const summaryResponse = await axios.get(`${BASE_URL}/privacy/summary/${TEST_USER_ID}`);
      console.log('✅ Privacy Summary:', summaryResponse.data);
    } catch (error) {
      console.log('❌ Privacy Summary failed:', error.response?.data || error.message);
    }

    // Test 2: Privacy Mode Transcription
    console.log('\n2️⃣ Testing POST /transcribe with privacy mode');
    try {
      const transcribeResponse = await axios.post(`${BASE_URL}/transcribe`, {
        text: "I want to buy Nike running shoes under ₹3000",
        privacyMode: true,
        timestamp: Date.now()
      });
      console.log('✅ Privacy Mode Transcription:', transcribeResponse.data);
    } catch (error) {
      console.log('❌ Privacy Mode Transcription failed:', error.response?.data || error.message);
    }

    // Test 3: Regular Transcription (Non-Privacy)
    console.log('\n3️⃣ Testing POST /transcribe without privacy mode');
    try {
      const regularResponse = await axios.post(`${BASE_URL}/transcribe`, {
        text: "Hello world, how are you?",
        privacyMode: false
      });
      console.log('✅ Regular Transcription:', regularResponse.data);
    } catch (error) {
      console.log('❌ Regular Transcription failed:', error.response?.data || error.message);
    }

    // Test 4: Export Data
    console.log('\n4️⃣ Testing GET /privacy/export/:userId');
    try {
      const exportResponse = await axios.get(`${BASE_URL}/privacy/export/${TEST_USER_ID}`);
      console.log('✅ Data Export:', exportResponse.data);
    } catch (error) {
      console.log('❌ Data Export failed:', error.response?.data || error.message);
    }

    // Test 5: Delete Voice Data
    console.log('\n5️⃣ Testing DELETE /privacy/delete-voice/:userId');
    try {
      const deleteResponse = await axios.delete(`${BASE_URL}/privacy/delete-voice/${TEST_USER_ID}`);
      console.log('✅ Delete Voice Data:', deleteResponse.data);
    } catch (error) {
      console.log('❌ Delete Voice Data failed:', error.response?.data || error.message);
    }

    // Test 6: Cleanup Old Data
    console.log('\n6️⃣ Testing POST /privacy/cleanup-old-data');
    try {
      const cleanupResponse = await axios.post(`${BASE_URL}/privacy/cleanup-old-data`, {
        retentionDays: 30
      });
      console.log('✅ Cleanup Old Data:', cleanupResponse.data);
    } catch (error) {
      console.log('❌ Cleanup Old Data failed:', error.response?.data || error.message);
    }

    console.log('\n🎉 Privacy endpoint testing completed!');

  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
    console.log('\nMake sure the backend server is running on port 3002');
    console.log('Run: cd backend && npm start');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testPrivacyEndpoints();
}

module.exports = { testPrivacyEndpoints };
