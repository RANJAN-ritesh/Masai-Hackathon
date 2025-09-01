const fetch = require('node-fetch');

const BASE_URL = 'https://masai-hackathon.onrender.com';
const TEST_HACKATHON_ID = '675a1b2c3d4e5f6789012345'; // Replace with actual hackathon ID
const TEST_TEAM_ID = '675a1b2c3d4e5f6789012346'; // Replace with actual team ID
const TEST_USER_ID = '675a1b2c3d4e5f6789012347'; // Replace with actual user ID

// Test data
const testProblemStatement = {
  title: "AI-Powered Learning Platform",
  description: "Build an intelligent learning platform that adapts to individual learning styles and provides personalized recommendations.",
  category: "Software Development",
  difficulty: "Hard"
};

const testSubmission = {
  submissionUrl: "https://github.com/testuser/ai-learning-platform"
};

async function testProblemStatementSystem() {
  console.log('🚀 Starting Problem Statement System Test...\n');

  try {
    // Test 1: Create Problem Statement
    console.log('📝 Test 1: Creating Problem Statement...');
    const createResponse = await fetch(`${BASE_URL}/problem-statements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_USER_ID}`
      },
      body: JSON.stringify({
        ...testProblemStatement,
        hackathonId: TEST_HACKATHON_ID
      })
    });

    if (createResponse.ok) {
      const createdProblem = await createResponse.json();
      console.log('✅ Problem statement created successfully:', createdProblem.problemStatement.title);
      const problemId = createdProblem.problemStatement._id;
      
      // Test 2: Get Problem Statements
      console.log('\n📋 Test 2: Fetching Problem Statements...');
      const getResponse = await fetch(`${BASE_URL}/problem-statements/hackathon/${TEST_HACKATHON_ID}`);
      
      if (getResponse.ok) {
        const problems = await getResponse.json();
        console.log('✅ Problem statements fetched successfully:', problems.problemStatements.length, 'problems found');
        
        // Test 3: Create Problem Selection Poll
        console.log('\n🗳️ Test 3: Creating Problem Selection Poll...');
        const pollResponse = await fetch(`${BASE_URL}/problem-statements/poll/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TEST_USER_ID}`
          },
          body: JSON.stringify({
            teamId: TEST_TEAM_ID,
            hackathonId: TEST_HACKATHON_ID
          })
        });

        if (pollResponse.ok) {
          const poll = await pollResponse.json();
          console.log('✅ Poll created successfully:', poll.poll._id);
          const pollId = poll.poll._id;
          
          // Test 4: Vote on Poll
          console.log('\n🗳️ Test 4: Voting on Poll...');
          const voteResponse = await fetch(`${BASE_URL}/problem-statements/poll/vote`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${TEST_USER_ID}`
            },
            body: JSON.stringify({
              pollId: pollId,
              problemId: problemId
            })
          });

          if (voteResponse.ok) {
            console.log('✅ Vote recorded successfully');
            
            // Test 5: Complete Poll
            console.log('\n✅ Test 5: Completing Poll...');
            const completeResponse = await fetch(`${BASE_URL}/problem-statements/poll/${pollId}/complete`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TEST_USER_ID}`
              }
            });

            if (completeResponse.ok) {
              const completedPoll = await completeResponse.json();
              console.log('✅ Poll completed successfully');
              
              // Test 6: Get Team Problem Selection
              console.log('\n🎯 Test 6: Fetching Team Problem Selection...');
              const selectionResponse = await fetch(`${BASE_URL}/problem-statements/team/${TEST_TEAM_ID}/hackathon/${TEST_HACKATHON_ID}/selection`);
              
              if (selectionResponse.ok) {
                const selection = await selectionResponse.json();
                console.log('✅ Team problem selection fetched successfully');
                
                // Test 7: Submit Team Solution
                console.log('\n📤 Test 7: Submitting Team Solution...');
                const submitResponse = await fetch(`${BASE_URL}/problem-statements/submit`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${TEST_USER_ID}`
                  },
                  body: JSON.stringify({
                    teamId: TEST_TEAM_ID,
                    hackathonId: TEST_HACKATHON_ID,
                    submissionUrl: testSubmission.submissionUrl
                  })
                });

                if (submitResponse.ok) {
                  console.log('✅ Team solution submitted successfully');
                  
                  // Test 8: Get Team Submission
                  console.log('\n📋 Test 8: Fetching Team Submission...');
                  const submissionResponse = await fetch(`${BASE_URL}/problem-statements/team/${TEST_TEAM_ID}/hackathon/${TEST_HACKATHON_ID}/submission`);
                  
                  if (submissionResponse.ok) {
                    const submission = await submissionResponse.json();
                    console.log('✅ Team submission fetched successfully');
                    
                    // Test 9: Get Admin Team Data
                    console.log('\n👑 Test 9: Fetching Admin Team Data...');
                    const adminResponse = await fetch(`${BASE_URL}/problem-statements/admin/hackathon/${TEST_HACKATHON_ID}/team-data`);
                    
                    if (adminResponse.ok) {
                      const adminData = await adminResponse.json();
                      console.log('✅ Admin team data fetched successfully:', adminData.teamData.length, 'teams found');
                      
                      console.log('\n🎉 All tests passed successfully!');
                      console.log('\n📊 Test Summary:');
                      console.log('- ✅ Problem statement creation');
                      console.log('- ✅ Problem statement fetching');
                      console.log('- ✅ Poll creation');
                      console.log('- ✅ Poll voting');
                      console.log('- ✅ Poll completion');
                      console.log('- ✅ Team problem selection');
                      console.log('- ✅ Team solution submission');
                      console.log('- ✅ Team submission fetching');
                      console.log('- ✅ Admin team data fetching');
                      
                    } else {
                      console.log('❌ Failed to fetch admin team data:', await adminResponse.text());
                    }
                  } else {
                    console.log('❌ Failed to fetch team submission:', await submissionResponse.text());
                  }
                } else {
                  console.log('❌ Failed to submit team solution:', await submitResponse.text());
                }
              } else {
                console.log('❌ Failed to fetch team problem selection:', await selectionResponse.text());
              }
            } else {
              console.log('❌ Failed to complete poll:', await completeResponse.text());
            }
          } else {
            console.log('❌ Failed to vote on poll:', await voteResponse.text());
          }
        } else {
          console.log('❌ Failed to create poll:', await pollResponse.text());
        }
      } else {
        console.log('❌ Failed to fetch problem statements:', await getResponse.text());
      }
    } else {
      console.log('❌ Failed to create problem statement:', await createResponse.text());
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testProblemStatementSystem();
