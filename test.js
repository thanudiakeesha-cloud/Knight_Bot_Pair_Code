#!/usr/bin/env node

// Test script for Infinity MD Session Generator
// Run with: node test.js

import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

async function testSessionGenerator() {
    console.log('🧪 Testing Infinity MD Session Generator...\n');

    try {
        // Test 1: Check if server is running
        console.log('1️⃣ Testing server availability...');
        const response = await axios.get(BASE_URL);
        console.log('✅ Server is running\n');

        // Test 2: Test pair code generation (with invalid number first)
        console.log('2️⃣ Testing pair code generation...');
        try {
            const pairResponse = await axios.get(`${BASE_URL}/pair?number=1234567890`);
            console.log('✅ Pair code endpoint working');
            console.log('📱 Response:', pairResponse.data, '\n');
        } catch (error) {
            console.log('⚠️ Pair code test failed (expected for invalid number):', error.response?.data || error.message, '\n');
        }

        // Test 3: Test QR code generation
        console.log('3️⃣ Testing QR code generation...');
        try {
            const qrResponse = await axios.get(`${BASE_URL}/qr`, { timeout: 30000 });
            console.log('✅ QR code endpoint working');
            console.log('📱 QR Data received:', qrResponse.data.qr ? 'Yes' : 'No', '\n');
        } catch (error) {
            console.log('⚠️ QR code test failed:', error.response?.data || error.message, '\n');
        }

        console.log('🎉 Basic tests completed!');
        console.log('\n📋 Next steps:');
        console.log('1. Open http://localhost:8000 in your browser');
        console.log('2. Test with a real phone number');
        console.log('3. Deploy to Render for production use');
        console.log('4. Integrate with your bot using the examples provided');

    } catch (error) {
        console.error('❌ Server test failed:', error.message);
        console.log('\n🔧 Make sure the server is running:');
        console.log('npm start');
    }
}

// Run tests
testSessionGenerator();