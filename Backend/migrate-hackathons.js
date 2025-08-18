// Migration script to move mock hackathon data to MongoDB
import mongoose from 'mongoose';
import Hackathon from './src/model/hackathon.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/masai-hackathon';

// Sample hackathon data to migrate
const sampleHackathons = [
  {
    title: "Masai Hackathon 2024",
    description: "Build innovative solutions with your team",
    startDate: new Date("2025-08-18T15:27:42.107Z"),
    endDate: new Date("2025-08-25T15:27:42.107Z"),
    eventType: "Team Hackathon",
    minTeamSize: 2,
    maxTeamSize: 4,
    status: "active",
    problemStatements: [
      {
        _id: "problem_001",
        track: "AI/ML",
        description: "Build an intelligent learning platform that adapts to student needs",
        difficulty: "Hard"
      },
      {
        _id: "problem_002", 
        track: "Sustainability",
        description: "Create an eco-friendly e-commerce platform",
        difficulty: "Medium"
      }
    ],
    schedule: [
      {
        day: "Day 1",
        events: [
          {
            time: "9:00 AM",
            activity: "Opening Ceremony",
            description: "Welcome and hackathon kickoff"
          },
          {
            time: "10:00 AM",
            activity: "Team Formation",
            description: "Form teams and select problem statements"
          }
        ]
      },
      {
        day: "Day 2",
        events: [
          {
            time: "9:00 AM",
            activity: "Development",
            description: "Continue building your solution"
          },
          {
            time: "6:00 PM",
            activity: "Submission Deadline",
            description: "Final project submission"
          }
        ]
      }
    ],
    eventPlan: [
      {
        phase: "Planning",
        description: "Understand requirements and plan solution",
        duration: "2 hours"
      },
      {
        phase: "Development",
        description: "Build the core functionality",
        duration: "16 hours"
      },
      {
        phase: "Testing",
        description: "Test and refine the solution",
        duration: "4 hours"
      }
    ],
    prizeDetails: [
      {
        rank: "1st Place",
        prize: "$1000",
        description: "Best overall solution"
      },
      {
        rank: "2nd Place", 
        prize: "$500",
        description: "Second best solution"
      },
      {
        rank: "3rd Place",
        prize: "$250",
        description: "Third best solution"
      }
    ],
    allowedEmails: ["admin@test.com", "leader@test.com", "member@test.com"],
    socialLinks: {
      zoom: "https://zoom.us/j/123456789",
      youtube: "https://youtube.com/watch?v=dQw4w9WgXcQ",
      slack: "https://slack.com/join/workspace",
      github: "https://github.com/masai-hackathon",
      instagram: "https://instagram.com/masai_hackathon",
      twitter: "https://twitter.com/masai_hackathon",
      linkedin: "https://linkedin.com/company/masai-hackathon"
    }
  }
];

async function migrateHackathons() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!');

    // Check if hackathons already exist
    const existingCount = await Hackathon.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing hackathons. Skipping migration.`);
      return;
    }

    console.log('🚀 Starting hackathon migration...');
    
    // Insert sample hackathons
    const insertedHackathons = await Hackathon.insertMany(sampleHackathons);
    
    console.log(`✅ Successfully migrated ${insertedHackathons.length} hackathons!`);
    console.log('📋 Migrated hackathons:');
    
    insertedHackathons.forEach(hackathon => {
      console.log(`   - ${hackathon.title} (ID: ${hackathon._id})`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run migration
migrateHackathons(); 