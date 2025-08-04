# Happy Birthday Website - Connecting Joy

> A **creative open-source interactive website** to organize, remember, and share your friends' birthdays in a fun and unique way! From real-time countdown to 2D/3D cake candle blowing, photo & video albums, mini-games, real-time chat, and seasonal themes - creating unforgettable birthday experiences!

[![日本語](https://img.shields.io/badge/lang-日本語-red)](README.md)

<p align="center">
  <img src="https://img.shields.io/badge/Made%20with-❤️-ff69b4" alt="Made with Love">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT">
  <img src="https://img.shields.io/badge/Version-1.2.0-brightgreen" alt="Version 1.2.0">
  <img src="https://img.shields.io/badge/Database-Supabase-green" alt="Supabase">
  <img src="https://img.shields.io/badge/Framework-Vanilla_JS-yellow" alt="Vanilla JS">
</p>

## Key Features

### Core Features
| **Feature**                  | **Description**                                                          |
|------------------------------|--------------------------------------------------------------------------|
| Real-time Countdown   | Fetch birthday data from Supabase and display real-time countdown to next birthday |
| Interactive Cake      | Beautiful 2D/3D cake (using Three.js), microphone-enabled candle blowing |
| Music Player          | Auto-play birthday songs, custom music upload functionality            |
| Visual Effects        | Confetti, smoke effects, balloon animations, cake vibration effects    |

### Album & Media Features
| **Feature**                  | **Description**                                                          |
|------------------------------|--------------------------------------------------------------------------|
| Photo & Video Album   | Media management with Supabase Storage, tagging, search, slideshow     |
| Tag System            | Tag media files, search and filter by tags                             |
| Media Upload          | Direct photo & video upload (10MB limit, multiple files support)       |
| Search Functionality  | Tag-based fast search, real-time filtering                             |

### Games & Entertainment
| **Feature**                  | **Description**                                                          |
|------------------------------|--------------------------------------------------------------------------|
| Memory Game           | Memory card game with score recording                                  |
| Puzzle Game           | Jigsaw puzzle using photos, adjustable difficulty                      |
| Birthday Quiz          | Customizable birthday-related quiz                                      |
| Birthday Calendar     | Monthly birthday display, visual calendar interface                    |

### Community & Social Features
| **Feature**                  | **Description**                                                          |
|------------------------------|--------------------------------------------------------------------------|
| Real-time Chat        | Using Supabase real-time features, username management                 |
| Celebration Board     | Public message posting, virtual gift sending                           |
| Voice Messages        | Browser recording, voice message save & playback                       |
| Video Messages        | Webcam recording, video message save & playback                        |
| Virtual Gifts         | Digital gift selection & sending system                                |
| Friend Invitation     | Email invitations, social media sharing                                |

### Themes & Customization
| **Feature**                  | **Description**                                                          |
|------------------------------|--------------------------------------------------------------------------|
| Seasonal Themes       | Auto-switch for Spring (cherry blossoms), Summer, Autumn (leaves), Winter (snow) |
| Festival Themes       | Special themes for Christmas, Halloween, New Year, Obon, Tanabata, Hanami |
| Video Backgrounds     | Theme-appropriate video backgrounds with fallback                       |
| Particle Effects      | Falling leaves, petals, snow, lanterns, fireworks, bats animations     |
| Multi-language Support | Full Japanese & English support, dynamic language switching           |

## Project's Wonderful Benefits 

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
  │   ├── components.css # UI components
  │   ├── themes.css  # Theme-specific CSS
  │   ├── mobile.css  # Mobile responsive
  │   ├── autumn-leaves.css # Autumn leaves effects
  │   └── page/       # Page-specific CSS
  │       ├── core.css     # Core functionality CSS
  │       ├── album.css    # Album management CSS
  │       ├── community.css # Community features CSS
  │       ├── features.css # Interactive features CSS
  │       └── themes.css   # Theme management CSS
  ├── js/             # JavaScript files
  │   ├── core.js     # Core functionality
  │   ├── album.js    # Album management
  │   ├── community.js # Community features
  │   ├── features.js # Interactive features
  │   ├── themes.js   # Theme management
  │   └── supabase-config.js # Supabase configuration
  ├── video/          # Background videos for themes
  ├── package.json    # Node.js dependencies
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