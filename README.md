# 🚨 CampusResQ

<p align="center">
  <img src="https://img.shields.io/badge/Flutter-02569B?style=for-the-badge&logo=flutter&logoColor=white" alt="Flutter"/>
  <img src="https://img.shields.io/badge/Dart-0175C2?style=for-the-badge&logo=dart&logoColor=white" alt="Dart"/>
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License"/>
</p>

<p align="center">
  <b>A modern campus issue reporting mobile application built with Flutter and Firebase</b>
</p>

---

## 📖 Overview

**CampusResQ** is a mobile application designed to streamline the process of reporting and managing campus facility issues. Students can easily report problems like broken lights, plumbing issues, or safety hazards, while administrators can efficiently track and resolve these reports.

### ✨ Key Features

- 🔐 **Secure Authentication** - Separate login systems for students and administrators
- 📸 **Photo Capture** - Take photos directly or upload from gallery
- 📍 **GPS Location** - Automatic location tagging for precise issue tracking
- 📊 **Real-time Dashboard** - Live updates using Firebase Firestore
- 🏷️ **Category System** - Organize issues by type (Infrastructure, Electrical, Plumbing, Safety, etc.)
- 📱 **Push Notifications** - Get notified when report status changes
- 📈 **Status Tracking** - Track reports through Pending → In Progress → Resolved
- 🎨 **Modern UI** - Beautiful 2025 design with animations and gradients

---

## 📱 Screenshots

<p align="center">
  <img src="screenshots/login.png" width="200" alt="Login"/>
  <img src="screenshots/report_issue.png" width="200" alt="Report Issue"/>
  <img src="screenshots/my_reports.png" width="200" alt="My Reports"/>
</p>

<p align="center">
  <img src="screenshots/admin_login.png" width="200" alt="Admin Login"/>
  <img src="screenshots/admin_dashboard.png" width="200" alt="Admin Dashboard"/>
</p>

| Screen | Description |
|--------|-------------|
| **Login** | Modern student login with gradient design and forgot password |
| **Report Issue** | Category selection, photo capture, and GPS location |
| **My Reports** | Timeline view with status tracking and filters |
| **Admin Login** | Secure admin authentication with verification code |
| **Admin Dashboard** | Manage all reports with status updates |

---

## 🏗️ Architecture

```
lib/
├── main.dart                 # App entry point with Firebase initialization
├── app_theme.dart            # Theme configuration and color schemes
├── login_page.dart           # Student login with forgot password
├── register_page.dart        # New user registration
├── admin_login_page.dart     # Secure admin authentication
├── report_page.dart          # Issue reporting with camera & location
├── student_history_page.dart # View personal report history
└── admin_page.dart           # Admin dashboard for managing reports
```

### Tech Stack

| Technology | Purpose |
|------------|---------|
| **Flutter** | Cross-platform mobile framework |
| **Dart** | Programming language |
| **Firebase Auth** | User authentication |
| **Cloud Firestore** | Real-time database |
| **Firebase Storage** | Image storage |
| **Firebase Messaging** | Push notifications |
| **Geolocator** | GPS location services |
| **Image Picker** | Camera and gallery access |

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- [Flutter SDK](https://docs.flutter.dev/get-started/install) (3.9.0 or higher)
- [Dart SDK](https://dart.dev/get-dart) (3.9.2 or higher)
- [Android Studio](https://developer.android.com/studio) or [VS Code](https://code.visualstudio.com/)
- [Git](https://git-scm.com/)
- A Firebase project (see Firebase Setup below)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jerungpyro/RESQ.git
   cd RESQ
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Set up Firebase** (see [Firebase Setup](#-firebase-setup) section below)

4. **Run the app**
   ```bash
   # For debug mode
   flutter run
   
   # For release mode
   flutter run --release
   ```

---

## 🔥 Firebase Setup

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project" and follow the setup wizard
3. Enable Google Analytics (optional)

### Step 2: Add Android App

1. In Firebase Console, click "Add app" → Android
2. Enter package name: `com.example.campus_resq`
3. Download `google-services.json`
4. Place it in `android/app/` directory

### Step 3: Add iOS App (Optional)

1. In Firebase Console, click "Add app" → iOS
2. Enter bundle ID: `com.example.campusResq`
3. Download `GoogleService-Info.plist`
4. Place it in `ios/Runner/` directory

### Step 4: Enable Firebase Services

Navigate to Firebase Console and enable:

| Service | Path | Configuration |
|---------|------|---------------|
| **Authentication** | Build → Authentication | Enable Email/Password provider |
| **Firestore** | Build → Firestore Database | Create database in production/test mode |
| **Storage** | Build → Storage | Set up storage bucket |
| **Messaging** | Build → Cloud Messaging | Enable for push notifications |

### Step 5: Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Reports collection
    match /reports/{reportId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### Step 6: Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /reports/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 👤 User Roles

### Student
- Register and login with email/password
- Submit issue reports with photos and location
- View personal report history
- Track report status updates

### Admin
- Access via separate admin login portal
- Requires admin verification code: `RESQ2025ADMIN`
- View all submitted reports
- Update report status (Pending → In Progress → Resolved)
- Filter reports by status

---

## 🛠️ Development

### Project Structure

```
RESQ/
├── android/                  # Android-specific files
├── ios/                      # iOS-specific files
├── lib/                      # Dart source code
├── test/                     # Unit and widget tests
├── web/                      # Web support files
├── pubspec.yaml              # Dependencies
└── README.md                 # This file
```

### Running Tests

```bash
# Run all tests
flutter test

# Run with coverage
flutter test --coverage
```

### Building for Release

```bash
# Android APK
flutter build apk --release

# Android App Bundle
flutter build appbundle --release

# iOS (requires macOS)
flutter build ios --release
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Getting Started

1. **Fork the repository**
   ```bash
   # Click the 'Fork' button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/RESQ.git
   cd RESQ
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed

5. **Test your changes**
   ```bash
   flutter analyze
   flutter test
   ```

6. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

7. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

8. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch and submit

### Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, etc.) |
| `refactor` | Code refactoring |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |

Example: `feat: add dark mode support`

### Code Style

- Follow [Effective Dart](https://dart.dev/guides/language/effective-dart) guidelines
- Use meaningful variable and function names
- Keep functions small and focused
- Add documentation comments for public APIs

---

## 📋 Roadmap

- [ ] Dark mode support
- [ ] Multi-language support (i18n)
- [ ] Offline mode with local storage
- [ ] Report analytics dashboard
- [ ] Email notifications for status updates
- [ ] Map view for report locations
- [ ] Report comments/feedback system
- [ ] Image compression optimization
- [ ] Unit and integration tests

---

## 🐛 Known Issues

- Location permission may need to be granted manually on some devices
- Push notifications require additional setup for iOS

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Flutter Team](https://flutter.dev/) for the amazing framework
- [Firebase](https://firebase.google.com/) for backend services
- [Material Design](https://material.io/) for design guidelines

---

## 📞 Contact

**Project Maintainer:** [@jerungpyro](https://github.com/jerungpyro)

**Project Link:** [https://github.com/jerungpyro/RESQ](https://github.com/jerungpyro/RESQ)

---

<p align="center">
  Made with ❤️ for campus safety
</p>
