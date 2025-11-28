# Santa's Workshop - Christmas Fifteen Puzzle Game

A festive, interactive sliding tile puzzle game with adaptive difficulty, achievements, and a Christmas-themed story mode.

## Features

### Core Requirements
- Adaptive gameplay that learns from your skills
- Multiple puzzle sizes (3x3, 4x4, 6x6, 8x8, 10x10)
- Immersive audio-visual experience with progressive music
- Celebratory victory animations and effects
- Comprehensive progress tracking and analytics
- Strategic hints and puzzle preview system

### Custom Features
- Festive theme system (performance & time-based)
- Gift & reward system with achievements
- Holiday magic power-ups
- Christmas story mode with Santa & Mrs. Claus

## Quick Start

1. **Install XAMPP**: Download from https://www.apachefriends.org/
2. **Set up database**: See `SETUP.md` for detailed instructions
3. **Start server**: `C:\xampp\php\php.exe -S localhost:8000`
4. **Open browser**: `http://localhost:8000/index.html`

**Full setup instructions**: See `SETUP.md`

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: PHP 7.4+
- **Database**: MySQL 5.7+ (Command-line only - NO GUI tools)
- **Server**: Apache/Nginx with PHP support

## Project Structure

```
Santa's_workshop/
├── index.html              # Landing page
├── game.html              # Main game interface
├── login.html             # User authentication
├── register.html          # User registration
├── leaderboard.html       # Santa's List (leaderboard)
├── analytics.html         # Analytics dashboard
├── css/                   # Stylesheets
├── js/                    # JavaScript modules
├── php/                   # Backend API
├── sql/                   # Database schema
├── assets/                # Audio files
├── README.md             # This file
├── SETUP.md              # Setup guide
└── DEVELOPMENT_JOURNAL.md # Development log
```

## Security

- SQL injection prevention (PDO prepared statements)
- XSS protection (input sanitization)
- Password hashing (bcrypt)
- Session security
- Input validation

## AI Usage Disclosure

This project was developed with assistance from AI coding tools for code structure, algorithm implementation guidance, documentation generation, and code review. All code has been reviewed, tested, and customized for this specific project.

## License

Educational project for CSC 4370/6370 Web Programming course.

---

**For setup instructions, see `SETUP.md`**
