# Hackathon.Masai

### Important : Dev branch has latest code

## API Endpoints

---

### 🔵 **Production Endpoints**
- **GET** `/team/get-teams`  
  → Fetches all teams (Production).

- **GET** `/health`  
  → Checks if the production server is up.

---

### 🟢 **Development Endpoints**
- **GET** `/health`  
  → Checks if the development server is up.

- **POST** `/users/verify-user`  
  → Verifies a user's email and password during login.

- **POST** `/team/create-team`  
  → Creates a new team with a name and creator ID.

- **POST** (Ngrok) `/team/create-team`  
  → Creates a new team via ngrok tunnel (for public testing).

- **GET** `/team/get-teams`  
  → Fetches all available teams (Development).

- **POST** `/team-request/send-request`  
  → Sends a request from a user to join a specific team.

- **POST** `/team-request/accept-request`  
  → Accepts a pending team join request by ID.

- **GET** `/team-request/:teamId/join-requests`  
  → Retrieves all pending join requests for a given team.

---

### 🧠 **Hackathon Management**
- **POST** `/hackathons`  
  → Creates a new hackathon with schedule, rules, and prizes.

- **GET** `/hackathons`  
  → Fetches all created hackathons.

- **GET** `/hackathons/:id` *(assumed)*  
  → Fetches a specific hackathon by its ID.

---

### 🧑‍🤝‍🧑 **Registration & Participation**
- **GET** `/registrations/hackathon/:hackathonId` *(assumed)*  
  → Retrieves registrations for a specific hackathon.

- **GET** `/registrations/user/:userId` *(assumed)*  
  → Retrieves hackathon registrations of a specific user.

---

### 👤 **User Management**
- **POST** `/users/create-user`  
  → Creates a new user account with full profile details.

- **GET** `/team/:hackathonId`  
  → Fetches teams that are part of a given hackathon.

- **GET** `/users/:id` *(assumed)*  
  → Retrieves user details by ID.

---

### 🚀 **Masai Hackathon Platform Resources**

**🔧 Backend Repository:**  
[GitHub – Hackathon.Masai](https://github.com/hb99960/Hackathon.Masai)

**🌐 Live Website:**  
[Masai Hackathon Portal](https://xto10x.masaischool.com)

**📬 Postman Collection (API Testing):**  
[Join the Postman Workspace](https://app.getpostman.com/join-team?invite_code=a752d2a6181f2369377e7c90db41700e24454ba8061be92a0b8b5e87fe8935bd)

---

### 💾 **Database Details**
**MongoDB URI:** `mongodb+srv://curriculum-hackathon:k3j28khBoTrv41vM@mini-apps.em5zz.mongodb.net/curriculum-hackathon?retryWrites=true&w=majority&appName=mini-apps`
- **Dev Database:** `xTo10xDev`
- **Production Database:** `xTo10x`

---

### 🌐 **Backend API Base URLs**
- **Development:** `https://api-evolve.iasam.dev`
- **Production:** *(Coming Soon)*

---

### 📥 **Bulk User Creation**
- Upload CSVs directly to:  
  [Bulk Create Users](https://xto10x.masaischool.com/create-users)

---

### [CSV Templates](https://docs.google.com/spreadsheets/d/1VEkVV90-l3UgMirI6f6dtBP6Y24cvKuOF5RXmj8ncxU/edit?gid=0#gid=0)
- User Creation CSV template
- Team Creation (Randomised) CSV template
- Team Creation (User Generated) CSV template


### Credentials
- Admin account :
  - ravi.kiran@masaischool.com	1234567890
  - harshit.batra@masaischool.com	1234567890
  - ankushchimnani99@gmail.com	1234567890
- Student account :
  - iamshubhamcs@gmail.com  jmn4ky
  - abhigupta3985@gmail.com  h8c6yb
 
### Engagement Tools for Hackathon
- [Meme Generator](https://imgflip.com/memegenerator)

