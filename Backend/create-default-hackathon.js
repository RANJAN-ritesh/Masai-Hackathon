#!/usr/bin/env node

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Hackathon = require('./dist/model/hackathon.js').default;

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI environment variable is required');
  process.exit(1);
}

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const createDefaultHackathon = async () => {
  try {
    // Check if hackathons already exist
    const existingCount = await Hackathon.countDocuments();
    
    if (existingCount > 0) {
      console.log(`✅ Found ${existingCount} existing hackathons. Skipping creation.`);
      return;
    }

    // Create admin hackathon
    const adminHackathon = new Hackathon({
      title: "Test Hackathon 101",
      description: "Build innovative solutions with your team in this exciting hackathon!",
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),  // 2 weeks from now
      eventPlan: "Phase 1: Planning (2 hours) - Understand requirements and plan your solution. Phase 2: Development (20 hours) - Build your solution with your team. Phase 3: Testing (4 hours) - Test and refine your solution. Phase 4: Presentation (2 hours) - Present your solution to judges.",
      status: "active",
      teamSize: {
        min: 2,
        max: 4
      },
      teamCreationMode: "admin",
      allowParticipantTeams: false,
      problemStatements: [
        {
          track: "Web Development",
          description: "Build a modern web application that solves a real-world problem"
        },
        {
          track: "Mobile Development", 
          description: "Create a mobile app that enhances productivity or entertainment"
        },
        {
          track: "AI/ML",
          description: "Develop an AI-powered solution for automation or decision making"
        }
      ],
      schedule: [
        {
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          time: "09:00 AM",
          activity: "Opening Ceremony - Welcome and hackathon kickoff"
        },
        {
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          time: "10:00 AM", 
          activity: "Team Formation - Form teams and select problem statements"
        }
      ],
      prizeDetails: [
        {
          position: 1,
          amount: "$1000",
          description: "Best overall solution"
        },
        {
          position: 2, 
          amount: "$500",
          description: "Second best solution"
        },
        {
          position: 3,
          amount: "$250", 
          description: "Third best solution"
        }
      ],
      socialLinks: {
        github: "https://github.com/masai-hackathon-2025"
      }
    });

    // Create participant hackathon
    const participantHackathon = new Hackathon({
      title: "Test Hackathon 1092830498203948",
      description: "Self-organized teams hackathon where participants create their own teams!",
      startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      endDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),  // 17 days from now
      eventPlan: "Self-organized hackathon: Participants form teams, collaborate, and compete in an open format.",
      status: "active",
      teamSize: {
        min: 2,
        max: 4
      },
      teamCreationMode: "participant",
      allowParticipantTeams: true,
      problemStatements: [
        {
          track: "Open Innovation",
          description: "Build any innovative solution that addresses real-world challenges"
        },
        {
          track: "Social Impact", 
          description: "Create technology solutions that benefit society and communities"
        }
      ],
      schedule: [
        {
          date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          time: "09:00 AM",
          activity: "Kickoff - Team formation begins"
        },
        {
          date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          time: "12:00 PM", 
          activity: "Development phase starts"
        }
      ],
      prizeDetails: [
        {
          position: 1,
          amount: "$750",
          description: "Most innovative solution"
        },
        {
          position: 2, 
          amount: "$350",
          description: "Best team collaboration"
        }
      ],
      socialLinks: {
        github: "https://github.com/participant-hackathon"
      }
    });

    const savedAdminHackathon = await adminHackathon.save();
    const savedParticipantHackathon = await participantHackathon.save();
    
    console.log('✅ Default hackathons created successfully!');
    console.log(`📋 Admin Hackathon ID: ${savedAdminHackathon._id}`);
    console.log(`📋 Admin Title: ${savedAdminHackathon.title}`);
    console.log(`📋 Participant Hackathon ID: ${savedParticipantHackathon._id}`);
    console.log(`📋 Participant Title: ${savedParticipantHackathon.title}`);
    
  } catch (error) {
    console.error('❌ Error creating default hackathons:', error);
  }
};

const main = async () => {
  try {
    await connectDB();
    await createDefaultHackathon();
    
    console.log('\n🎉 Setup complete! Your platform now has a default hackathon.');
    console.log('🌐 You can now access your frontend and start using the platform.');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

main(); 