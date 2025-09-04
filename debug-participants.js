// Debug participant status to understand the issue
const axios = require('axios');

const BASE_URL = 'https://masai-hackathon.onrender.com';

console.log('🔍 DEBUGGING PARTICIPANT STATUS\n');

async function debugParticipants() {
  try {
    // Login as Umair
    console.log('\n🔐 Logging in as Umair...');
    const umairResponse = await axios.post(`${BASE_URL}/users/verify-user`, {
      email: 'umair.h1@example.com',
      password: 'password123'
    });
    const umairToken = umairResponse.data.token;
    console.log('✅ Umair login successful');

    // Get all participants with their status
    console.log('\n📋 Getting all participants...');
    const participantsResponse = await axios.get(`${BASE_URL}/participant-team/participants/68b84011987ec2d1f411088c`, {
      headers: { 'Authorization': `Bearer ${umairToken}` }
    });
    
    const participants = participantsResponse.data.participants || [];
    console.log(`✅ Found ${participants.length} total participants`);
    
    console.log('\n📊 PARTICIPANT STATUS BREAKDOWN:');
    participants.forEach((participant, index) => {
      console.log(`${index + 1}. ${participant.name} (${participant.email})`);
      console.log(`   Course: ${participant.course}`);
      console.log(`   Status: ${participant.status}`);
      console.log(`   Current Team: ${participant.currentTeamId || 'None'}`);
      console.log(`   Can Send Requests: ${participant.canSendRequests}`);
      console.log(`   Can Receive Requests: ${participant.canReceiveRequests}`);
      console.log('');
    });

    // Check if there are any participants with 'Available' status
    const availableParticipants = participants.filter(p => p.status === 'Available');
    console.log(`\n🎯 Available participants: ${availableParticipants.length}`);
    
    if (availableParticipants.length > 0) {
      console.log('Available participants:');
      availableParticipants.forEach(p => {
        console.log(`- ${p.name} (${p.email})`);
      });
    } else {
      console.log('❌ No participants with "Available" status found');
      console.log('\n🔍 This might be causing the invitation issue.');
      console.log('Possible reasons:');
      console.log('1. All participants are already in teams');
      console.log('2. Status calculation is incorrect');
      console.log('3. Database state is inconsistent');
    }

  } catch (error) {
    console.log('❌ Debug failed:', error.response?.data?.message || error.message);
    console.log('Status:', error.response?.status);
    if (error.response?.data) {
      console.log('Error details:', error.response.data);
    }
  }
}

debugParticipants();
