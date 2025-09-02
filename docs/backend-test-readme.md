# 🧪 Admin Functionality Test Suite

This test suite verifies that all admin functionality is working correctly in your hackathon application.

## 🎯 **What These Tests Cover:**

### **Hackathon Management:**
- ✅ **Create Hackathons** - Admin can create new hackathon events
- ✅ **View Hackathons** - Admin can see all hackathons and specific ones
- ✅ **Edit Hackathons** - Admin can modify existing hackathon details
- ✅ **Delete Hackathons** - Admin can remove hackathon events

### **Team Management:**
- ✅ **Create Teams** - Admin can create new teams for hackathons
- ✅ **View Teams** - Admin can see all teams and teams by hackathon
- ✅ **Delete Teams** - Admin can remove teams from the system

### **User Management:**
- ✅ **View All Users** - Admin can see all registered users
- ✅ **Admin Authentication** - Admin login and role verification

## 🚀 **How to Run Tests:**

### **Option 1: Simple Test Runner (Recommended)**
```bash
cd Backend/test
npm install
node run-tests.js
```

### **Option 2: Full Jest Suite**
```bash
cd Backend/test
npm install
npm test
```

### **Option 3: Watch Mode (Development)**
```bash
cd Backend/test
npm install
npm run test:watch
```

## 📋 **Test Results:**

The tests will show:
- ✅ **PASSED** - Function working correctly
- ❌ **FAILED** - Function has issues (with error details)
- 📊 **Summary** - Overall success rate and statistics

## 🔧 **Prerequisites:**

1. **Backend must be deployed** and accessible at `https://masai-hackathon.onrender.com`
2. **Test admin user must exist** (`admin@test.com` / `admin123`)
3. **All API endpoints must be implemented** and working

## 🧹 **Cleanup:**

Tests automatically clean up after themselves:
- Delete test hackathons
- Delete test teams
- No test data left in your database

## 📝 **Adding New Tests:**

To add more tests, edit `run-tests.js` and add new test functions following the same pattern.

## 🎉 **Success Criteria:**

**All tests should pass** for your admin functionality to be considered production-ready!

---

**Run these tests anytime to verify your admin features are working correctly!** 🚀 