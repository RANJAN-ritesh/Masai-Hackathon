const axios = require('axios');

const BASE_URL = 'https://masai-hackathon.onrender.com';

console.log('🎯 DEBUGGING INVITATION RESPONSE\n');

async function debugInvitation() {
  try {
    // Login as Valerie
    console.log('\n🔐 Logging in as Valerie...');
    const valerieResponse = await axios.post(`${BASE_URL}/users/verify-user`, {
      email: 'valerie.m2@example.com',
      password: 'password123'
    });
    const valerieToken = valerieResponse.data.token;
    console.log('✅ Valerie login successful');

    // Get Valerie's invitations with full details
    console.log('\n📬 Getting Valerie\'s invitations with full details...');
    const invitationsResponse = await axios.get(`${BASE_URL}/participant-team/requests`, {
      headers: { 'Authorization': `Bearer ${valerieToken}` }
    });
    
    const requests = invitationsResponse.data.requests || [];
    const invitations = requests.filter(r => r.requestType === 'invite' && r.status === 'pending');
    console.log(`✅ Found ${invitations.length} pending invitations`);
    
    if (invitations.length === 0) {
      console.log('❌ No pending invitations to accept');
      return;
    }

    const invitation = invitations[0];
    console.log('\n📋 FULL INVITATION DETAILS:');
    console.log(JSON.stringify(invitation, null, 2));

    // Try to accept with the correct structure
    console.log('\n✅ Attempting to accept invitation...');
    console.log(`URL: ${BASE_URL}/participant-team/respond-invitation/${invitation._id}`);
    console.log(`Body:`, {
      response: 'accepted',
      message: 'I accept your invitation!'
    });

    const acceptResponse = await axios.put(`${BASE_URL}/participant-team/respond-invitation/${invitation._id}`, {
      response: 'accepted',
      message: 'I accept your invitation!'
    }, {
      headers: { 
        'Authorization': `Bearer ${valerieToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Invitation accepted successfully');
    console.log('Response:', acceptResponse.data);

  } catch (error) {
    console.log('❌ Test failed:', error.response?.data?.message || error.message);
    console.log('Status:', error.response?.status);
    console.log('URL:', error.config?.url);
    console.log('Method:', error.config?.method);
    if (error.response?.data) {
      console.log('Error details:', error.response.data);
    }
  }
}

debugInvitation();
