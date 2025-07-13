# Birthday Celebration Website - Connections of Joy

> **A creative open-source interactive website** to organize, remember, and share friends' birthdays in a fun and unique way! From countdowns to blowing out candles on a 2D cake, albums, mini-games, community chat, and seasonal interfaces, it provides an unforgettable experience!

[![日本語](https://img.shields.io/badge/lang-Japanese-blue)](README.md)

<p align="center">
  <img src="https://img.shields.io/badge/Made%20with-❤️-ff69b4" alt="Made with Love">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT">
  <img src="https://img.shields.io/badge/Version-1.0-brightgreen" alt="Version 1.0">
</p>

## Key Features

| **Feature**                     | **Description**                                                                 |
|---------------------------------|---------------------------------------------------------------------------------|
| 🎉 **Birthday Countdown**       | Displays the remaining time until the next birthday in your group of friends.   |
| 🎂 **Interactive Cake**         | A beautiful 2D cake with a button to blow out the candles.                      |
| 📸 **Memorial Album**           | Manage memories by viewing, tagging, searching, and sharing photos/videos.      |
| 🎮 **Interactive Games**        | Includes memory games and puzzle games.                                         |
| 🎵 **Music Player**             | Plays fun birthday songs to create a celebratory atmosphere.                    |
| 🎭 **Seasonal Interfaces**      | Automatically changes for spring/summer/autumn/winter, Christmas, New Year, Halloween, cherry blossom viewing, etc. |
| 💬 **Community Features**       | Provides text, audio, video messages, virtual gifts, and a blessing bulletin board. |
| 📹 **Video Message Recording**  | Records and saves birthday celebration videos using the device camera.          |
| 🎈 **Interactive Effects**      | Adds liveliness with effects like blowing out candles, fireworks, and balloons. |
| 📱 **Social Sharing**           | Easy sharing to popular social media platforms.                                 |
| 🌐 **Multi-Language Support**   | Switchable interfaces in Japanese and English.                                  |

## Project's Wonderful Benefits 💖

1. **Strengthen Bonds of Friendship**:
   - Never forget a friend's birthday.
   - Promotes interaction and sharing in a shared space.
   - Connects people through meaningful birthday events.

2. **Preserve Eternal Memories**:
   - Saves beautiful moments in a digital album with photos and videos.
   - Easily review and share with friends and family.
   - Builds a shared collection for the group.

3. **Fun and Interactive Entertainment**:
   - Enhances the celebratory atmosphere with games and effects.
   - Records special moments with the video message feature.
   - Attracts user interest with visual effects.

4. **Practical Convenience**:
   - Automatic countdown reminds you of important days.
   - Share joy on social media with one click.
   - User-friendly interface for all age groups.

5. **Build a Strong Community**:
   - Creates a shared space for participation and contribution.
   - Encourages active interaction among members.
   - Strengthens connections with message and gift features.

## Technologies Used

- **HTML5** & **CSS3**: Builds a beautiful and compatible interface.
- **JavaScript (Pure)**: Creates smooth interactive features.
- **MediaDevices API**: Supports video message functionality.
- **LocalStorage**: Saves user information and application state.
- **Supabase (Backend as a Service)**:
  - Database for managing birthday information and messages.
  - Storage for photos, videos, and multimedia files.
  - Real-time registration for community features.

## Getting Started Guide

1. **Download the Source Code**:
   ```bash
   git clone https://github.com/yourusername/happy-birthday-website.git
   ```

2. **Supabase Setup**:
   - Create an account and project on [Supabase](https://supabase.io/).
   - Update the connection information in the `js/supabase-config.js` file:
   ```javascript
   const SUPABASE_URL = 'your-supabase-url';
   const SUPABASE_KEY = 'your-supabase-key';
   ```

3. **Database Setup**:
   - Create the necessary tables: `birthdays`, `custom_messages`, `audio_messages`, `video_messages`.
   - Create storage buckets: `media`, `audio`, `video`.

4. **Open the Website**:
   - Open the `index.html` file in your browser or use a simple web server.

## Project Structure 💻

```
happy-birthday-website/
  ├── assets/         # Images and static resources
  ├── css/            # CSS files
  │   ├── base.css    # Basic CSS
  │   ├── themes.css  # Theme-specific CSS
  │   └── ...
  ├── js/             # JavaScript files
  │   ├── core.js     # Core functionality
  │   ├── album.js    # Album management
  │   ├── community.js # Community features
  │   ├── features.js # Interactive features
  │   ├── themes.js   # Theme management
  │   └── ...
  ├── video/          # Background videos for themes
  └── index.html      # Main page
```

## Supported Browsers

- **Google Chrome** (Recommended)
- **Mozilla Firefox**
- **Apple Safari**
- **Microsoft Edge**

## Contributions

We welcome contributions to make the project even better! Please follow these steps:

1. **Fork and Clone the Repository**:
   - Fork the project and clone it locally.

2. **Create a New Branch**:
   ```bash
   git checkout -b feature/feature-name
   ```

3. **Make Changes**:
   - Write code, fix bugs, or add new features.

4. **Commit and Push**:
   - Commit the changes and push to your repository.
   - Open a **Pull Request** with a detailed description.

> 💡 **Note**: Ideas, bug reports (issues), and pull requests are welcome! Let's build a creative and cohesive community together!

## License

This project is distributed under the **[MIT](LICENSE) License** - free to use, edit, and share.

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT">
</p>

---

<p align="center">
  <strong>Created with ❤️ for special birthdays and cherished friends!</strong>
</p>