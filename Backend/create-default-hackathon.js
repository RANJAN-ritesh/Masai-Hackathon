#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Hackathon from './src/model/hackathon.js';

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

    // Create default hackathon
    const defaultHackathon = new Hackathon({
      title: "Masai Hackathon 2025",
      description: "Build innovative solutions with your team in this exciting hackathon!",
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),  // 2 weeks from now
      eventType: "Team Hackathon",
      minTeamSize: 2,
      maxTeamSize: 4,
      status: "active",
      problemStatements: [
        {
          track: "Web Development",
          description: "Build a modern web application that solves a real-world problem",
          difficulty: "Medium"
        },
        {
          track: "Mobile Development", 
          description: "Create a mobile app that enhances productivity or entertainment",
          difficulty: "Medium"
        },
        {
          track: "AI/ML",
          description: "Develop an AI-powered solution for automation or decision making",
          difficulty: "Hard"
        }
      ],
      schedule: [
        {
          day: "Day 1",
          events: [
            {
              time: "09:00 AM",
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
              time: "09:00 AM",
              activity: "Development",
              description: "Continue building your solutions"
            },
            {
              time: "06:00 PM",
              activity: "Progress Check",
              description: "Review progress with mentors"
            }
          ]
        }
      ],
      eventPlan: [
        {
          phase: "Planning",
          description: "Understand requirements and plan your solution",
          duration: "2 hours"
        },
        {
          phase: "Development",
          description: "Build your solution with your team",
          duration: "20 hours"
        },
        {
          phase: "Testing",
          description: "Test and refine your solution",
          duration: "4 hours"
        },
        {
          phase: "Presentation",
          description: "Present your solution to judges",
          duration: "2 hours"
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
      allowedEmails: [],
      socialLinks: {
        zoom: "https://zoom.us/j/123456789",
        slack: "https://slack.com/app/A1234567890",
        github: "https://github.com/masai-hackathon-2025"
      }
    });

    const savedHackathon = await defaultHackathon.save();
    
    console.log('✅ Default hackathon created successfully!');
    console.log(`📋 Hackathon ID: ${savedHackathon._id}`);
    console.log(`📋 Title: ${savedHackathon.title}`);
    console.log(`📋 Status: ${savedHackathon.status}`);
    console.log(`📋 Team Size: ${savedHackathon.minTeamSize}-${savedHackathon.maxTeamSize} members`);
    
  } catch (error) {
    console.error('❌ Error creating default hackathon:', error);
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