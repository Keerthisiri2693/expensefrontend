# Expense Manager 📱

A mobile Expense Management application built with **React Native, Expo, and TypeScript**, connected to a **FastAPI + PostgreSQL backend**.

The application allows users to securely authenticate, submit and manage expenses, upload receipts, view expense history, search expenses, and access cached expenses when the device is offline.

---

## ✨ Features

### 🔐 Authentication

* User registration
* User login
* JWT authentication
* Protected API requests
* Secure password handling
* Access-token expiration

### 💰 Expense Management

* Raise new expenses
* Edit expenses
* View expense details
* Delete expenses
* Expense categories
* Expense amount
* Expense date
* Expense description
* Receipt upload
* Expense status

### 📋 Expense List

* Search expenses
* Pull-to-refresh
* Infinite scrolling / pagination
* Expense status
* Amount formatting
* Date formatting
* Empty states
* Loading indicators
* API error handling

### 📴 Offline Support

* SQLite expense cache
* View cached expenses without internet
* API → SQLite caching
* Offline fallback
* Network connectivity detection
* Offline status indicator

### 🌙 UI & Theme

* Light mode
* Dark mode
* Persistent theme preference
* Responsive mobile UI
* Loading states
* Error states
* Empty states

---

# 🛠️ Tech Stack

### Mobile

* React Native
* Expo
* TypeScript
* Expo Router
* AsyncStorage
* Expo SQLite
* React Native NetInfo
* React Native Paper / Expo UI components where applicable

### Backend

* Python
* FastAPI
* SQLAlchemy
* PostgreSQL
* Pydantic
* Pydantic Settings
* PyJWT
* pwdlib
* psycopg2

### Development & DevOps

* Git
* GitHub
* Docker
* GitHub Actions

---

# 📁 Project Structure

```text
expensefrontend/
│
├── app/
│   ├── (app)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── dashboard.tsx
│   │   ├── raiseExpense.tsx
│   │   ├── expenselist.tsx
│   │   ├── profile.tsx
│   │   ├── editProfile.tsx
│   │   └── reportscreen.tsx
│   │
│   └── ...
│
├── context/
│   └── ThemeContext.tsx
│
├── database/
│   └── expenseCache.ts
│
├── service/
│   └── api.ts
│
├── assets/
│   └── images/
│
├── package.json
├── app.json
├── tsconfig.json
├── .gitignore
└── README.md
```

---

# 📋 Prerequisites

Before running the mobile application, install:

* Node.js
* npm
* Git
* Expo
* Android Studio for Android development
* Android Emulator or physical Android device

The backend must also be running for online API functionality.

---

# 🚀 Installation

## 1. Clone the repository

```bash
git clone https://github.com/Keerthisiri2693/expensefrontend.git
```

Enter the project:

```bash
cd expensefrontend
```

---

# 📦 Install Dependencies

Install the project dependencies:

```bash
npm install
```

Install/update Expo dependencies:

```bash
npx expo install
```

For the offline functionality, make sure these packages are installed:

```bash
npx expo install expo-sqlite
```

```bash
npx expo install @react-native-community/netinfo
```

AsyncStorage:

```bash
npx expo install @react-native-async-storage/async-storage
```

---

# ▶️ Run the Application

Start Expo:

```bash
npx expo start
```

Run on Android:

```bash
npx expo start --android
```

You can also press:

```text
a
```

after running:

```bash
npx expo start
```

---

# 🤖 Android Device Setup

For a physical Android device:

1. Install Expo Go if using an Expo Go compatible development setup.
2. Connect the phone and computer to the same Wi-Fi network.
3. Start the Expo development server.
4. Open the application on the device.

---

# 🌐 Backend API Configuration

The mobile application communicates with the FastAPI backend.

Update:

```text
service/api.ts
```

Example:

```ts
const API_BASE_URL =
  "http://192.168.1.7:8000";
```

Replace the IP address with the IP address of the computer running FastAPI.

---

## ⚠️ Important for Android

When using a physical Android device, don't normally use:

```text
http://localhost:8000
```

because `localhost` refers to the Android device itself.

Instead use your computer's local IP:

```text
http://192.168.x.x:8000
```

Example:

```text
http://192.168.1.7:8000
```

The phone and computer must be connected to the same network.

---

# 🔐 Authentication

The application uses JWT authentication provided by the FastAPI backend.

Authentication flow:

```text
Login
  ↓
FastAPI
  ↓
Validate credentials
  ↓
Generate JWT
  ↓
Mobile stores token
  ↓
API requests
  ↓
Authorization: Bearer <token>
```

Protected requests use:

```http
Authorization: Bearer <access_token>
```

---

# 💾 Offline Expense Cache

The application supports offline viewing of previously loaded expenses.

## Online

```text
FastAPI
   ↓
Get Expenses
   ↓
React Native
   ↓
SQLite
```

## Offline

```text
No Internet
     ↓
SQLite Cache
     ↓
Cached Expenses
     ↓
Expense List
```

When the application successfully loads expenses from the API, the expense data is stored locally.

When there is no internet connection, the application loads the cached expenses.

The application displays:

```text
📴 Offline • Showing cached expenses
```

---

# 🔄 Pull-to-Refresh

The Expense List supports pull-to-refresh.

When online:

```text
Pull to refresh
      ↓
FastAPI
      ↓
Fresh expenses
      ↓
Update UI
      ↓
Update SQLite cache
```

When offline:

```text
Pull to refresh
      ↓
SQLite cache
      ↓
Cached expenses
```

---

# 📄 Pagination / Infinite Scrolling

The Expense List supports infinite scrolling.

The current mobile implementation displays expenses in groups of 10.

```text
Load
 ↓
10 expenses
 ↓
Scroll
 ↓
20 expenses
 ↓
Scroll
 ↓
30 expenses
```

Pagination also works with search results.

### Future improvement

For very large datasets, server-side pagination should be implemented:

```text
GET /expenses?page=1&limit=10

GET /expenses?page=2&limit=10

GET /expenses?page=3&limit=10
```

This prevents the mobile application from downloading the entire expense collection.

---

# 🔎 Search

The Expense List supports searching by:

* Expense title
* Category
* Status

Example:

```text
Search: Travel
```

Matching expenses are displayed immediately.

Search also works with cached expenses while offline.

---

# 🌙 Dark Mode

The application supports both light and dark themes.

Theme management is handled through:

```text
context/ThemeContext.tsx
```

The user's theme preference is stored locally using AsyncStorage.

Theme settings include:

* Background
* Cards
* Text
* Secondary text
* Inputs
* Borders
* Header
* Primary colors
* Icons
* Status colors

---

# ✅ Validation

The application uses client-side validation before sending expense data to the backend.

The FastAPI backend also performs server-side validation.

```text
React Native
     ↓
Client Validation
     ↓
FastAPI
     ↓
Server Validation
     ↓
PostgreSQL
```

---

# ⚠️ API Error Handling

The application handles:

* Network errors
* HTTP errors
* Authentication errors
* Invalid responses
* API failures
* Offline state
* Empty responses

When the expense API cannot be reached, cached expenses are used when available.

---

# ⏳ Loading Indicators

Loading indicators are provided for:

* Login
* Expense loading
* Expense submission
* Receipt upload
* Expense deletion
* Pagination
* Pull-to-refresh

---

# 🧪 Testing

The frontend should include tests for important functionality.

Recommended test areas:

```text
✓ Login validation
✓ Expense form validation
✓ Expense list rendering
✓ Search
✓ Pagination
✓ Pull-to-refresh
✓ Loading state
✓ API error state
✓ Offline cache
✓ Dark mode
```

Backend tests are maintained in the backend repository/project.

---

# 🐳 Docker Backend

The backend can be run using Docker.

From the backend project:

```bash
docker build -t expense-manager-api .
```

Run:

```bash
docker run -p 8000:8000 expense-manager-api
```

The API will then be available at:

```text
http://localhost:8000
```

---

# ⚙️ GitHub Actions

GitHub Actions can automatically:

```text
Git Push
   ↓
GitHub Actions
   ↓
Install dependencies
   ↓
Run tests
   ↓
Build/check project
   ↓
Success / Failure
```

Recommended workflow:

```text
.github/
└── workflows/
    └── backend-ci.yml
```

---

# 🔒 Security

Do not commit secrets to GitHub.

Never commit:

```text
.env
JWT secrets
Database passwords
API keys
Private credentials
```

Use environment variables for sensitive configuration.

---

# 🗂️ Backend Repository

The mobile application requires the FastAPI backend to provide the authentication and expense APIs.

Expected backend technologies:

```text
Python
FastAPI
SQLAlchemy
PostgreSQL
JWT
Pydantic
```

Example backend API:

```text
POST   /register
POST   /login

GET    /expenses
POST   /expenses
GET    /expenses/{id}
PUT    /expenses/{id}
DELETE /expenses/{id}
```

The exact available endpoints should match the backend implementation.

---

# 📊 Application Architecture

```text
                   React Native
                         │
                         ▼
                   Expo Router
                         │
              ┌──────────┴──────────┐
              │                     │
           Online                Offline
              │                     │
              ▼                     ▼
           FastAPI                SQLite
              │                     │
              ▼                     │
         PostgreSQL                 │
              │                     │
              └──────────┬──────────┘
                         ▼
                   Expense List
```

---

# 📋 Project Requirements

| Requirement                     | Status   |
| ------------------------------- | -------- |
| JWT Authentication              | ✅        |
| Client-side validation          | ✅        |
| Server-side validation          | ✅        |
| API error handling              | ✅        |
| Loading indicators              | ✅        |
| Offline cached expenses         | ✅        |
| Sync                            | 🔄 Bonus |
| Search                          | ✅        |
| Filter                          | 🔄       |
| Sort                            | 🔄       |
| Pull-to-refresh                 | ✅        |
| Pagination / Infinite scrolling | ✅        |
| Dark mode                       | ✅        |
| Frontend unit tests             | 🔄       |
| Backend unit tests              | 🔄       |
| Dockerized backend              | 🔄       |
| GitHub Actions CI/CD            | 🔄       |
| README setup instructions       | ✅        |

---

# 🚧 Future Enhancements

* Offline expense creation
* Offline expense editing
* Offline expense deletion
* Automatic background synchronization
* Sync queue
* Conflict resolution
* Server-side pagination
* Advanced filters
* Expense sorting
* PDF expense reports
* Export expenses
* Push notifications
* Role-based authorization
* Admin dashboard
* Production deployment

---

# 👩‍💻 Author

**Keerthana**

Expense Manager

Built with:

```text
React Native
Expo
TypeScript
FastAPI
PostgreSQL
SQLAlchemy
JWT
SQLite
Docker
GitHub Actions
```

---

# 📄 License

Add your preferred license here.

Example:

```text
MIT License
```
