# Chat App 💬📱

![chat-app](/showcase-chat-app.gif)

## Description

A chat app for mobile devices built with React Native. The app provides users with a chat interface and options to share images and their location.

The app is written in React Native and developed using Expo. Styling is in accordance with a provided design assets. The app stores chat conversations in Google Firestore Database and uses Google Firebase authentication to authenticate uses anonymously. Chat conversations are stored locally as well and the app is accessible while the user is offline. The Gifted Chat library is used to create the chat interface and its functionality.

The app allows users to pick and send images from their phone's image library provided the user grants the app permission to access their media library and camera. Users can share their location by enabling the app to read user location data.

## Technologies

- React Native
- Expo
- Google Firestore Database
- Gifted Chat library
- Android Studio

## Key Features

- A page where users can enter their name and choose a background color for the chat screen before joining chat
- A page displaying the conversation, as well as an input field and submit button
- The chat must provide users with two additional communication features: sending images and location data
- Data gets stored online and offline

## Get Started 🚀

### Technical Requirements

- Node.js
- Expo Command Line Interface

```
npm install expo-cli --global
```

- If you would like to run the app on your mobile device, you'll need to install the Expo app through your device's app store (iOS or Android)
- You will also need an Expo account which can be created via [Expo.io](https://expo.io)
- You will need to login into Expo in order to access the App

  - Logging into Expo through the CLI on your machine
  - Logging into Expo on your mobile device in the Expo app

- If you would like to run the app on your machine through a simulator/emulator, you will either need
  - [Android Studio](https://docs.expo.io/workflow/android-studio-emulator/)
  - [iOS Simulator](https://docs.expo.io/workflow/ios-simulator/)

### Installing Dependencies

In the project directory install the application's dependencies.

```
npm install
```

### Running the App

```
expo start
```

#### Running the App on Your Mobile Device

After using the "expo start" command to run the app, you can use 'e' to send yourself an email with a link to the app. This can then be opened in your mobile device to run the app through your mobile device's Expo app. Alternatively, you can use your mobile device to scan the provided QR code displayed in the command line interface.

#### Running the App with Android Studio or

With the command line interface open after using the 'expo start' command, press 'a' to run the app with an Android emulator, or press 'i' to run the app with iOS simulator.
