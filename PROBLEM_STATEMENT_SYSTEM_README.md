# 🎯 Problem Statement Selection & Submission System

## 📋 Overview

This comprehensive system handles problem statement selection, team voting, and solution submission for hackathons. It provides a complete workflow from problem creation to final submission with automatic alerts and deadline management.

## 🚀 Features

### **Problem Statement Management**
- ✅ Create, edit, and delete problem statements
- ✅ Categorize by track (Software Development, Data Analytics, SDET)
- ✅ Set difficulty levels (Easy, Medium, Hard)
- ✅ Admin dashboard for managing all problems

### **Time-Based Selection Window**
- ✅ **48 hours before hackathon start** → Selection window opens
- ✅ **24 hours after hackathon end** → Selection window closes
- ✅ Real-time countdown timers
- ✅ Automatic window status updates

### **Team Problem Selection**
- ✅ **Individual Selection**: Team members can select problems directly
- ✅ **Poll-Based Selection**: Team leaders can create polls for team voting
- ✅ **1-hour poll duration** with automatic completion
- ✅ **Majority vote wins** - problem with most votes gets selected
- ✅ **Random assignment** for teams that don't select within deadline

### **Submission System**
- ✅ **One-time submission** with confirmation popup
- ✅ **URL validation** - checks if submission URL is accessible
- ✅ **Automatic UI removal** after submission
- ✅ **Submission deadline** based on admin settings

### **Alert System**
- ✅ **Selection window alerts**: 48hrs before, 2hrs before closing
- ✅ **Submission deadline alerts**: 6hrs, 1hr, 10min before deadline
- ✅ **Random assignment notifications**
- ✅ **No submission alerts**

### **Admin Features**
- ✅ **View all team selections and submissions**
- ✅ **Export CSV** with complete team data
- ✅ **Problem statement management**
- ✅ **Team data overview**

## 🏗️ Technical Architecture

### **Backend Models**

#### **ProblemStatement**
```javascript
{
  title: String,
  description: String,
  category: String, // Software Development, Data Analytics, SDET
  difficulty: String, // Easy, Medium, Hard
  hackathonId: ObjectId,
  createdBy: ObjectId,
  isActive: Boolean,
  createdAt: Date
}
```

#### **TeamProblemSelection**
```javascript
{
  teamId: ObjectId,
  hackathonId: ObjectId,
  selectedProblemId: ObjectId,
  selectedBy: ObjectId,
  selectedAt: Date,
  isLocked: Boolean,
  selectionMethod: String, // individual, poll, random, admin
  pollId: ObjectId // if selected via poll
}
```

#### **ProblemSelectionPoll**
```javascript
{
  teamId: ObjectId,
  hackathonId: ObjectId,
  createdBy: ObjectId,
  status: String, // active, completed, expired
  expiresAt: Date,
  votes: [{
    userId: ObjectId,
    problemId: ObjectId,
    votedAt: Date
  }],
  selectedProblemId: ObjectId,
  completedAt: Date
}
```

#### **TeamSubmission**
```javascript
{
  teamId: ObjectId,
  hackathonId: ObjectId,
  submissionUrl: String,
  submittedBy: ObjectId,
  submittedAt: Date,
  isFinal: Boolean
}
```

### **API Endpoints**

#### **Problem Statement Management**
- `GET /problem-statements/hackathon/:hackathonId` - Get all problems for hackathon
- `POST /problem-statements` - Create new problem statement
- `PUT /problem-statements/:id` - Update problem statement
- `DELETE /problem-statements/:id` - Delete problem statement

#### **Team Problem Selection**
- `GET /problem-statements/team/:teamId/hackathon/:hackathonId/selection` - Get team's selection
- `POST /problem-statements/select` - Select problem for team

#### **Poll Management**
- `POST /problem-statements/poll/create` - Create problem selection poll
- `POST /problem-statements/poll/vote` - Vote on poll
- `POST /problem-statements/poll/:pollId/complete` - Complete poll early

#### **Submission Management**
- `POST /problem-statements/submit` - Submit team solution
- `GET /problem-statements/team/:teamId/hackathon/:hackathonId/submission` - Get team submission

#### **Admin Endpoints**
- `GET /problem-statements/admin/hackathon/:hackathonId/team-data` - Get all team data

### **Frontend Components**

#### **ProblemStatement.jsx**
- Main component for problem statement display
- Handles selection window status
- Manages poll creation and voting
- Handles submission process
- Real-time countdown timers

#### **ProblemStatementManagement.jsx**
- Admin component for managing problem statements
- Create, edit, delete problems
- View team data and submissions
- Export CSV functionality

## 🔄 User Flow

### **For Participants**

1. **Selection Window Opens** (48hrs before hackathon)
   - Participants see "Selection Window Open" notification
   - Can select problems individually or wait for team poll

2. **Team Leader Creates Poll** (optional)
   - Leader clicks "Create Poll" button
   - Team members receive notification
   - Poll is active for 1 hour

3. **Team Members Vote**
   - Members click on problems to vote
   - Real-time vote tracking
   - Leader can end poll early

4. **Poll Completion**
   - Problem with most votes gets selected
   - Team selection is locked
   - All members see selected problem

5. **Individual Confirmation**
   - Each member must confirm their selection
   - Selection becomes locked and final

6. **Submission Window Opens**
   - Based on admin-configured submission deadline
   - Team can submit solution URL
   - One-time submission with confirmation

### **For Admins**

1. **Create Problem Statements**
   - Add problems before or after hackathon creation
   - Set category, difficulty, description

2. **Monitor Team Progress**
   - View all team selections
   - See submission status
   - Track selection methods

3. **Export Data**
   - Download CSV with all team data
   - Includes selections, submissions, team info

## ⏰ Timeline & Deadlines

### **Selection Window**
- **Opens**: 48 hours before hackathon start
- **Closes**: 24 hours after hackathon end
- **Fallback**: Random assignment for unselected teams

### **Poll Duration**
- **Default**: 1 hour from creation
- **Early completion**: Leader can end anytime
- **Auto-completion**: When time expires

### **Submission Window**
- **Opens**: Based on admin settings (default: hackathon start)
- **Closes**: Based on admin settings (default: hackathon end)
- **One-time only**: No resubmissions allowed

## 🚨 Alert System

### **Selection Alerts**
- **Window opens**: Notify all participants
- **Window closing**: Alert teams without selections
- **Random assignment**: Notify teams of auto-assigned problems

### **Submission Alerts**
- **6 hours before**: First deadline warning
- **1 hour before**: Urgent deadline warning
- **10 minutes before**: Final deadline warning
- **Deadline passed**: No submission notification

## 🔧 Configuration

### **Environment Variables**
```bash
# Backend
MONGO_URI=mongodb://localhost:27017/hackathon
JWT_SECRET=your-jwt-secret
NODE_ENV=production

# Frontend
VITE_BASE_URL=https://your-backend-url.com
```

### **Hackathon Settings**
```javascript
{
  startDate: Date,
  endDate: Date,
  submissionStartDate: Date, // optional
  submissionEndDate: Date,   // optional
  teamSize: { min: 2, max: 6 },
  allowParticipantTeams: Boolean
}
```

## 🧪 Testing

### **Test Script**
```bash
# Run comprehensive test
node problem-statement-system-test.cjs
```

### **Test Coverage**
- ✅ Problem statement CRUD operations
- ✅ Poll creation and voting
- ✅ Team selection workflow
- ✅ Submission process
- ✅ Admin data fetching
- ✅ Error handling

## 🚀 Deployment

### **Backend Deployment**
1. Deploy to Render/Heroku
2. Set environment variables
3. Database migrations run automatically
4. Services start automatically

### **Frontend Deployment**
1. Build with Vite
2. Deploy to Netlify/Vercel
3. Set environment variables
4. Configure CORS

## 📊 Monitoring

### **Health Checks**
- `GET /health` - Backend health status
- Service status monitoring
- Database connection monitoring

### **Logging**
- Problem selection events
- Poll creation and completion
- Submission events
- Alert notifications
- Error tracking

## 🔒 Security

### **Authentication**
- JWT token-based authentication
- Role-based access control
- Team membership validation

### **Validation**
- URL accessibility validation
- Input sanitization
- Rate limiting
- CORS protection

## 🎯 Future Enhancements

### **Planned Features**
- [ ] Real-time notifications via WebSocket
- [ ] Advanced analytics dashboard
- [ ] Problem statement templates
- [ ] Multi-language support
- [ ] Mobile app integration
- [ ] AI-powered problem recommendations

### **Performance Optimizations**
- [ ] Caching for frequently accessed data
- [ ] Database indexing optimization
- [ ] CDN for static assets
- [ ] Background job processing

## 📞 Support

For issues or questions:
1. Check the test script for functionality
2. Review the API documentation
3. Check server logs for errors
4. Verify database connections
5. Test with sample data

---

**🎉 The Problem Statement Selection & Submission System is now fully implemented and ready for production use!**
