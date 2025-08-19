# 🏆 **Masai Hackathon Platform** 🏆

> **Learn, Build, Evolve — One Line of Code at a Time**

A comprehensive hackathon management platform built with React, Node.js, and MongoDB. This platform enables seamless hackathon creation, team management, participant onboarding, and real-time collaboration.

## 🚀 **Live Demo**

- **Frontend:** [https://masai-hackathon.netlify.app](https://masai-hackathon.netlify.app)
- **Backend:** [https://masai-hackathon.onrender.com](https://masai-hackathon.onrender.com)

## ✨ **Key Features**

### 🎯 **Hackathon Management**
- **Create & Edit Hackathons** - Full CRUD operations for hackathon events
- **Dynamic Scheduling** - Flexible event planning with customizable timelines
- **Problem Statements** - Track-based problem assignment system
- **Team Size Configuration** - Configurable min/max team sizes
- **Status Tracking** - Upcoming, Active, and Completed states

### 👥 **Team Management**
- **Automatic Team Generation** - AI-powered team creation for participants
- **Team Formation** - Manual team registration and management
- **Join Requests** - Participant team application system
- **Team Analytics** - Performance tracking and leaderboards

### 👤 **User Management**
- **Role-Based Access Control** - Admin, Leader, and Member roles
- **Bulk Participant Onboarding** - CSV upload for mass user creation
- **Profile Management** - Comprehensive user profiles with skills
- **Authentication System** - Secure login and session management

### 📊 **Real-Time Features**
- **Live Updates** - Auto-refresh for admins every 30 seconds
- **Interactive Dashboard** - Dynamic hackathon overview
- **Real-Time Notifications** - Toast notifications for all actions
- **Responsive Design** - Mobile-first, cross-device compatibility

### 🔧 **Developer Tools**
- **API Documentation** - RESTful endpoints with proper error handling
- **Rate Limiting** - Protection against abuse
- **CORS Configuration** - Cross-origin resource sharing
- **Environment Management** - Production-ready configuration

## 🎭 **Role-Based Access Control**

### 👑 **Admin Role**
**Capabilities:**
- ✅ Create, edit, and delete hackathons
- ✅ Manage all users and teams
- ✅ Bulk participant onboarding via CSV
- ✅ Automatic team generation
- ✅ Access to all platform features
- ✅ Real-time data monitoring
- ✅ System configuration management

**Use Cases:**
- Event organizers
- Platform administrators
- Hackathon coordinators

### 🎖️ **Team Leader Role**
**Capabilities:**
- ✅ Create and manage teams
- ✅ Accept/decline team join requests
- ✅ Assign problem statements
- ✅ Manage team submissions
- ✅ Access team analytics
- ✅ Participate in hackathons

**Use Cases:**
- Team captains
- Project managers
- Technical leads

### 👤 **Member Role**
**Capabilities:**
- ✅ Join existing teams
- ✅ Submit join requests
- ✅ Participate in hackathons
- ✅ Access team resources
- ✅ View hackathon details
- ✅ Submit project work

**Use Cases:**
- Developers
- Designers
- Students
- Hackathon participants

## 🏗️ **Technical Architecture**

### **Frontend Stack**
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS with custom components
- **State Management:** React Context API
- **Routing:** React Router DOM v7
- **UI Components:** Lucide React Icons
- **Notifications:** React Toastify
- **CSV Processing:** PapaParse

### **Backend Stack**
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT-based sessions
- **Rate Limiting:** Express Rate Limit
- **CORS:** Configurable cross-origin policies

### **Deployment**
- **Frontend:** Netlify (Static hosting)
- **Backend:** Render (Node.js service)
- **Database:** MongoDB Atlas (Cloud database)
- **Environment:** Production-ready with environment variables

## 🔌 **API Endpoints**

### **Authentication & Users**
- `POST /users/login` - User authentication
- `POST /users/create-test-users` - Development user creation
- `GET /users/getAllUsers` - Admin user management
- `POST /users/upload-participants` - Bulk CSV upload

### **Hackathon Management**
- `GET /hackathons` - List all hackathons
- `POST /hackathons` - Create new hackathon
- `GET /hackathons/:id` - Get specific hackathon
- `PUT /hackathons/:id` - Update hackathon
- `DELETE /hackathons/:id` - Delete hackathon

### **Team Management**
- `POST /team/create-team` - Create new team
- `GET /team` - List all teams
- `GET /team/:hackathonId` - Get teams by hackathon
- `POST /team/delete-team` - Delete team

### **Team Requests**
- `POST /team-request/send-request` - Send join request
- `GET /team-request/:teamId/join-requests` - Get team requests
- `PUT /team-request/:requestId/accept` - Accept join request
- `PUT /team-request/:requestId/decline` - Decline join request

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ 
- MongoDB database
- Git

### **Local Development**

1. **Clone the repository**
   ```bash
   git clone https://github.com/RANJAN-ritesh/Masai-Hackathon.git
   cd Masai-Hackathon
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install
   # Set environment variables
   cp .env.example .env
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd Frontend
   npm install
   # Set environment variables
   cp .env.example .env
   npm run dev
   ```

### **Environment Variables**

**Backend (.env)**
```env
MONGO_URI=your_mongodb_connection_string
CORS_ORIGIN=https://your-frontend-domain.com
NODE_ENV=production
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Frontend (.env)**
```env
VITE_BASE_URL=https://your-backend-domain.com
```

## 🧪 **Testing**

### **Automated Tests**
```bash
cd Backend/test
npm test
```

### **Manual Testing**
- **Admin Flow:** Create hackathon → Add participants → Generate teams
- **User Flow:** Register → Join team → Participate in hackathon
- **Team Flow:** Create team → Manage members → Submit work

### **Comprehensive Documentation**
All detailed documentation, test cases, and development guides are available in the [docs/](./docs/) folder:
- Development workflow and branch strategy
- Testing procedures and checklists
- Issue resolution documentation
- Platform audit reports

## 📱 **Responsive Design**

- **Mobile First:** Optimized for mobile devices
- **Tablet Support:** Responsive layouts for medium screens
- **Desktop Experience:** Full-featured desktop interface
- **Cross-Browser:** Compatible with modern browsers

## 🔒 **Security Features**

- **JWT Authentication:** Secure session management
- **Role-Based Access:** Granular permission system
- **Rate Limiting:** Protection against abuse
- **Input Validation:** Server-side data validation
- **CORS Protection:** Controlled cross-origin access

## 🚀 **Deployment**

### **Frontend (Netlify)**
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables

### **Backend (Render)**
1. Connect GitHub repository
2. Set environment: Node.js
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Configure environment variables

## 🐛 **Known Issues & Solutions**

### **Common Problems**
1. **CORS Errors:** Ensure CORS_ORIGIN is set correctly
2. **Team Creation Fails:** Check memberLimit constraints
3. **User State Sync:** Verify localStorage updates after team assignment
4. **Build Failures:** Ensure all dependencies are installed

### **Troubleshooting**
- Check browser console for error messages
- Verify environment variables are set
- Ensure backend is running and accessible
- Check MongoDB connection status

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 **Acknowledgments**

- **Masai School** for the hackathon concept
- **React Team** for the amazing framework
- **MongoDB** for the database solution
- **Netlify & Render** for hosting services

## 📞 **Support**

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the troubleshooting guide

---

**Built with ❤️ for the developer community** 

## 👥 **Enhanced Participant Management**

### 🎯 **Hackathon-Specific User Association**
- **Smart User Linking**: Users are now properly associated with specific hackathons
- **Duplicate Handling**: Existing users are automatically added to new hackathons without duplication
- **Detailed Feedback**: Clear messaging about user creation, updates, and existing participants

### 📊 **Admin Dashboard Features**
- **View Participants**: Admins can see all participants for each hackathon with a single click
- **Team Status Tracking**: Visual indicators show which participants are already in teams
- **Real-time Updates**: Participant lists update automatically after CSV uploads
- **Role-based Display**: Clear distinction between admin, leader, and member roles

### 🔧 **Improved User Experience**
- **Enhanced Notifications**: Detailed toast messages with breakdown of upload results
- **Visual Feedback**: Color-coded status indicators and progress tracking
- **Better Error Handling**: Specific error messages for troubleshooting
- **Responsive Design**: Participant viewing works seamlessly on all devices

### 📈 **Team Generation Improvements**
- **Detailed Team Summary**: Complete breakdown of team creation results
- **Smart Algorithm Feedback**: Shows optimal team size calculations
- **Post-Creation Guidance**: Clear instructions on where to view created teams
- **Console Logging**: Comprehensive logs for debugging and verification

### 🛡️ **Data Protection**
- **Test Safety**: Automated tests no longer delete production hackathons
- **Backup-Friendly**: All operations preserve existing data
- **Rollback Support**: Changes can be easily reversed if needed

## 🔌 **Updated API Endpoints**

### **Enhanced User Management**
- `POST /users/upload-participants` - Now supports hackathon association and detailed feedback
- `GET /users/hackathon/:hackathonId/participants` - Get all participants for a specific hackathon

### **Improved Response Format**
```json
{
  "message": "2 new participants created, 1 existing participants added to hackathon, 1 participants already in this hackathon",
  "uploadedCount": 2,
  "existingCount": 1,
  "updatedCount": 1,
  "summary": {
    "total": 4,
    "newUsers": 2,
    "existingUsersAdded": 1,
    "alreadyInHackathon": 1,
    "errors": 0
  }
}
``` 