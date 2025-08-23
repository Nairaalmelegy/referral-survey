
# Referral Survey Backend

This is the backend service for the **Referral Survey** project.  
It allows users to submit surveys, generate referral codes, track referrals, and send reward notifications by email.  

Built with **Node.js**, **Express**, **MongoDB (Mongoose)**, and **Nodemailer**.

---

## 📂 Project Structure

```

src/
├── app.js              # Express app setup (middlewares, routes, error handling)
├── server.js           # Entry point, starts server & connects to DB
├── config/
│   └── db.js           # MongoDB connection
├── controllers/
│   └── survey.controller.js   # Business logic
├── models/
│   └── User.js         # Mongoose schema for users/surveys
├── routes/
│   └── survey.routes.js # API routes
├── utils/
│   ├── mailer.js       # Email sending with Nodemailer
│   └── referral.js     # Referral code generator

````


## ⚙️ Setup & Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/referral-survey-backend.git
   cd referral-survey-backend
``

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment variables**
   After being accepted to contribute I will send you the `.env` file place it in the root directory

4. **Run the server**

   ```bash
   npm start
   ```

   or in dev mode with auto-reload:

   ```bash
   npm run dev
   ```

5. **Check health endpoint**

   ```
   GET http://localhost:3000/health
   ```

---

## 🔗 API Reference

| Method | Endpoint                      | Description                                                  |
| ------ | ----------------------------- | ------------------------------------------------------------ |
| `GET`  | `/health`                     | Health check (backend alive).                                |
| `GET`  | `/api/survey/start?ref=CODE`  | Start survey, track referral if `ref` provided.              |
| `POST` | `/api/survey/submit`          | Submit survey response, generate referral code & share link. |
| `GET`  | `/api/survey/ref/:code/stats` | Get referral stats for a given referral code.                |

---

## 📌 Request & Response Examples

### 1. **Start Survey**

**Request**

```
GET /api/survey/start?ref=ABCD1234
```

**Response**

```json
{
  "message": "Survey start",
  "ref": "ABCD1234",
  "howTo": "POST your answers to /api/survey/submit with optional 'ref'."
}
```

---

### 2. **Submit Survey**

**Request**

```http
POST /api/survey/submit
Content-Type: application/json
```

```json
{
  "phone": "123456789",
  "email": "user@example.com",
  "answers": {
    "q1": "Yes",
    "q2": "No"
  },
  "ref": "ABCD1234"
}
```

**Response**

```json
{
  "message": "Survey submitted",
  "referralCode": "XYZ12345",
  "shareLink": "http://localhost:3000/api/survey/start?ref=XYZ12345"
}
```

---

### 3. **Referral Stats**

**Request**

```
GET /api/survey/ref/XYZ12345/stats
```

**Response**

```json
{
  "referralCode": "XYZ12345",
  "referredBy": "ABCD1234",
  "referralsCount": 10,
  "rewardGiven": false,
  "shareLink": "http://localhost:3000/api/survey/start?ref=XYZ12345",
  "createdAt": "2025-08-23T19:00:00.000Z"
}
```

---

## 🛡️ Security & Validation

* **Helmet** → secure HTTP headers
* **Rate Limiting** → max 200 requests per 15 minutes per IP
* **CORS** → supports cross-origin requests
* **Zod Validation** → validates request payloads
* **Unique Constraints** → prevents duplicate submissions by phone/email

---

## 📧 Reward Notifications

* When a user reaches `REWARD_TARGET` referrals, an email is automatically sent (if they have an email set).
* Email template is defined in `src/utils/mailer.js`.

---

## 💻 Frontend Integration (Axios Examples)

Here’s how the frontend can consume the API with **Axios**:

```javascript
import axios from "axios";

const API_BASE = "http://localhost:3000/api/survey";

// Start survey
export async function startSurvey(ref) {
  const res = await axios.get(`${API_BASE}/start`, { params: { ref } });
  return res.data;
}

// Submit survey
export async function submitSurvey(formData) {
  const res = await axios.post(`${API_BASE}/submit`, formData);
  return res.data;
}

// Get referral stats
export async function getReferralStats(code) {
  const res = await axios.get(`${API_BASE}/ref/${code}/stats`);
  return res.data;
}
```

### Example Usage

```javascript
async function handleSurveySubmit() {
  try {
    const result = await submitSurvey({
      phone: "123456789",
      email: "user@example.com",
      answers: { q1: "Yes", q2: "No" },
      ref: "ABCD1234"
    });
    console.log("Referral info:", result);
  } catch (error) {
    console.error(error.response?.data || error.message);
  }
}
```

---

## 🚀 Deployment Notes

* Make sure `.env` is **never** committed (already in `.gitignore`).
* Use a production-ready email provider (e.g., SendGrid, Mailgun, Gmail SMTP).
* Host backend (e.g., on Heroku, Vercel, AWS, or DigitalOcean) and update `BASE_URL` accordingly.

---


