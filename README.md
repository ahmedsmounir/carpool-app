# Carpool App 🚗
**German International University (GIU) - Business Informatics**

A full-stack mobile application designed to seamlessly connect drivers and ride partners. 

## 🏗 Tech Stack
* **Frontend:** React Native (Expo)
* **Backend:** Node.js, Express 
* **Version Control:** Git & GitHub

## 📂 Project Architecture
The repository is split into two main environments:

carpool-app/
├── backend/                  # (Coming soon) Node.js/Express server API
└── frontend/                 # React Native mobile application
    ├── src/
    │   ├── App.js            # Main navigation wrapper
    │   ├── api/              # API connection configuration
    │   └── screens/          # UI Feature Modules
    │       ├── Auth/         # Authentication screens
    │       ├── Driver/       # Driver dashboard and logic
    │       └── Partner/      # Partner search and booking
    ├── package.json
    └── app.json

## 🚀 Quick Start Guide

### 1. Re-Install Dependencies
If returning to the project after an interrupted update, clean the slate first:
cd frontend
npm install

### 2. Launch the App
Start the development server and bypass local firewall restrictions using a secure tunnel:
npx expo start --tunnel -c

Scan the generated QR code using the Expo Go app on your physical device.
