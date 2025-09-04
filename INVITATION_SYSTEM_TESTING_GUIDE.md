# 🎯 **INVITATION SYSTEM TESTING GUIDE**

## ✅ **CURRENT STATUS**

### **What's Fixed:**
- ✅ **Actions Column**: Added to Show Members table
- ✅ **Invite Buttons**: Added with proper conditional logic
- ✅ **Backend Endpoints**: All invitation endpoints implemented
- ✅ **Deployment**: Latest changes deployed to production

### **What to Test:**

**1. Login as a Team Leader:**
- Use: `aaron.miller1@example.com` / `password123`
- This user should be a team leader in one of the hackathons

**2. Navigate to My Team:**
- Go to: `masai-hackathon.netlify.app/my-team`
- Click on "Show Members" tab

**3. Check for Invite Buttons:**
- Look for "Actions" column (5th column)
- Look for blue "Invite" buttons next to available participants
- Buttons should only appear for:
  - Team leaders (not regular members)
  - Available participants (not already in teams)
  - Non-self participants (can't invite yourself)

**4. Test Invitation Flow:**
- Click "Invite" button for an available participant
- Should see success toast notification
- Participant should receive invitation

**5. Test as Participant:**
- Login as the invited participant
- Go to "Invitations" tab
- Should see pending invitation
- Click "Accept" or "Decline"

## 🔧 **DEBUGGING STEPS**

### **If Invite Buttons Don't Show:**

**Check Browser Console:**
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for any error messages
4. Check if team data is loading properly

**Check Network Tab:**
1. Go to Network tab in Developer Tools
2. Refresh the page
3. Look for API calls to `/team/hackathon/...`
4. Check if team data is returned correctly

**Manual Verification:**
1. Check if user is in a team
2. Check if user is team leader (createdBy or teamLeader)
3. Check if participants are available (not in teams)

## 🎯 **EXPECTED BEHAVIOR**

### **Team Leader View:**
```
| Name | Email | Course | Status | Actions |
|------|-------|--------|--------|---------|
| John | john@... | CS | Available | [Invite] |
| Jane | jane@... | CS | In Team | - |
```

### **Regular Member View:**
```
| Name | Email | Course | Status | Actions |
|------|-------|--------|--------|---------|
| John | john@... | CS | Available | - |
| Jane | jane@... | CS | In Team | - |
```

## 🚨 **TROUBLESHOOTING**

### **Common Issues:**

**1. No Actions Column:**
- Check if the latest frontend is deployed
- Clear browser cache and refresh

**2. No Invite Buttons:**
- Verify user is a team leader
- Check if user is in a team
- Verify participants are available

**3. Buttons Don't Work:**
- Check browser console for errors
- Verify backend endpoints are accessible
- Check network requests

## 📞 **NEXT STEPS**

**If buttons still don't show:**
1. Check browser console for errors
2. Verify team data structure
3. Test with different users
4. Check if user has proper permissions

**If buttons show but don't work:**
1. Check backend deployment
2. Verify API endpoints
3. Check authentication
4. Test invitation flow end-to-end

**The invite system should now be fully functional!** 🎉
