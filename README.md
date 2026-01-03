# Random Stranger Video Chat

A web-based random video chat application similar to Omegle, built with WebRTC, Firebase, and vanilla JavaScript.

## Features

- Peer-to-peer video and audio chat using WebRTC
- Random user pairing via Firebase Realtime Database
- Real-time signaling for connection establishment
- Start, Next, and Disconnect functionality
- Basic moderation controls (report user)
- Responsive HTML/CSS interface
- Scalable architecture using Firebase

## Setup Instructions

1. **Create a Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Realtime Database
   - Set up authentication (optional, but recommended for production)

2. **Configure Firebase:**
   - In the Firebase Console, go to Project Settings > General > Your apps
   - Add a web app and copy the config object
   - Replace the placeholder config in `js/firebase-config.js` with your actual config

3. **Database Rules:**
   - In Firebase Console, go to Realtime Database > Rules
   - Set the rules to allow read/write for development (be more restrictive in production):
     ```
     {
       "rules": {
         ".read": true,
         ".write": true
       }
     }
     ```

4. **Run the Application:**
   - Open `index.html` in a modern web browser
   - For WebRTC to work properly, you need to serve the files over HTTPS or localhost
   - If opening as a file:// URL, WebRTC may not work due to browser security restrictions

## Architecture

- **Frontend:** HTML, CSS, JavaScript
- **Real-time Communication:** WebRTC for peer-to-peer video/audio
- **Signaling:** Firebase Realtime Database for offer/answer exchange and user pairing
- **User Pairing:** Simple waiting queue system in Firebase
- **Moderation:** Basic report functionality (extendable to a full moderation system)

## Security Considerations

- In production, implement proper authentication
- Use HTTPS for all communications
- Set restrictive Firebase Database rules
- Add rate limiting and abuse prevention
- Implement content moderation for reported users

## Scalability

- Firebase handles real-time scaling
- WebRTC peer-to-peer reduces server load
- Database structure allows for efficient user matching
- Can be extended with load balancing and multiple regions

## Browser Support

- Modern browsers with WebRTC support (Chrome, Firefox, Safari, Edge)
- Requires camera and microphone permissions

## Development

- No build process required
- Edit HTML, CSS, JS files directly
- Use browser developer tools for debugging

## License

This project is for educational purposes. Ensure compliance with local laws and regulations regarding video chat applications.