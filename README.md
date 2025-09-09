# Masai Hackathon Platform

A comprehensive hackathon management platform built with React frontend and Node.js backend, featuring team management, problem statement polling, project submission, and admin analytics.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Masai-Hackathon
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install
   npm run build
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd Frontend
   npm install
   npm run dev
   ```

## 📁 Project Structure

```
Masai-Hackathon/
├── Backend/           # Node.js/Express backend
├── Frontend/          # React frontend
├── docs/             # Documentation and guides
├── scripts/          # Utility and test scripts
├── README.md         # This file
└── .gitignore        # Git ignore rules
```

## 🎯 Key Features

### 🏢 Admin Features
- **Hackathon Creation**: Create and manage hackathons
- **Team Management**: Oversee team formation and dynamics
- **Problem Statement Management**: Define and manage problem statements
- **Analytics Dashboard**: Download CSV reports with team data
- **User Management**: Manage participants and permissions

### 👥 Participant Features
- **Team Creation**: Create teams with customizable settings
- **Team Joining**: Join existing teams or accept invitations
- **Problem Statement Polling**: Vote on preferred problem statements
- **Project Submission**: Submit final projects with validation
- **Real-time Collaboration**: Live updates and notifications

### 🗳️ Polling System
- **Team Leader Initiated**: Only team leaders can start polls
- **Configurable Duration**: 1-2 hour poll windows
- **Real-time Voting**: Live vote tracking and results
- **Automatic Conclusion**: Timer-based or manual poll conclusion
- **Problem Statement Selection**: Automatic winner determination

### 📤 Submission System
- **Team Leader Only**: Restricted to team leaders
- **Window Validation**: Submission within defined timeframes
- **One-time Submission**: Final submission with confirmation
- **Link Tracking**: Secure submission link storage

### 🚨 Reporting System
- **Member Reporting**: Report non-responsive team members
- **Admin Notifications**: Automatic alerts for full-team reports
- **Member Removal**: Admin can remove reported members
- **Team Rebalancing**: Maintain team integrity

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Socket.IO** for real-time features
- **Rate Limiting** for security

### Frontend
- **React** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Context API** for state management
- **React Toastify** for notifications
- **Lucide React** for icons

## 🔧 Development

### Backend Development
```bash
cd Backend
npm run dev          # Development mode
npm run build        # Build for production
npm test            # Run tests
```

### Frontend Development
```bash
cd Frontend
npm run dev         # Development server
npm run build       # Build for production
npm run preview     # Preview production build
```

## 📊 Testing

### Comprehensive Testing
- **Unit Tests**: Individual component testing
- **Integration Tests**: End-to-end workflow testing
- **Edge Case Testing**: Boundary condition validation
- **Performance Testing**: Load and stress testing

### Test Scripts
```bash
# Run all tests
cd scripts
node test-comprehensive.js

# Test specific features
node test-polling-submission-flow.js
node test-edge-cases.js
```

## 🚀 Deployment

### Backend Deployment (Render)
- Automatic deployment from main branch
- Environment variables configured
- MongoDB Atlas connection
- Production build optimization

### Frontend Deployment (Netlify)
- Automatic deployment from main branch
- CDN distribution
- Environment variables configured
- Production build optimization

## 📚 Documentation

- **Implementation Docs**: `docs/implementation-docs/`
- **Testing Guides**: `docs/testing-docs/`
- **API Documentation**: `docs/backend-test-readme.md`
- **Feature Guides**: `docs/PARTICIPANT_TEAM_CREATION_README.md`

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Role-based Access**: Admin and participant permissions
- **Input Validation**: Comprehensive data validation
- **Rate Limiting**: API abuse prevention
- **CORS Configuration**: Cross-origin security

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach
- **Dark/Light Theme**: User preference support
- **Real-time Updates**: Live data synchronization
- **Toast Notifications**: User feedback system
- **Confirmation Dialogs**: Critical action protection
- **Loading States**: User experience optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation in `docs/`
- Review test cases in `scripts/`
- Open an issue for bugs or feature requests

---

**Built with ❤️ for Masai School Hackathons**
