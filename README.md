# Santa's Workshop - Christmas Fifteen Puzzle Game

A festive, interactive sliding tile puzzle game with adaptive difficulty, achievements, and a Christmas-themed story mode.

## Project Overview

Santa's Workshop is a web-based implementation of the classic Fifteen Puzzle game, enhanced with:
- Multiple puzzle sizes (3x3, 4x4, 6x6, 8x8, 10x10)
- Adaptive difficulty system that learns from player performance
- Comprehensive achievement and gift system
- Holiday magic power-ups
- Christmas story mode with Santa and Mrs. Claus
- Real-time leaderboard (Santa's List)
- Player analytics and progress tracking

## Features

### Core Requirements
1. **Adaptive Gameplay Experience** - Intelligent difficulty scaling based on player performance
2. **Dynamic Puzzle Mechanics** - Multi-size support with strategic shuffling
3. **Immersive Audio-Visual Experience** - Dynamic timer with progressive music intensity
4. **Celebratory Completion System** - Victory animations and celebration effects
5. **Comprehensive Progress Tracking** - Game sessions, moves, and performance metrics
6. **Strategic Assistance Features** - Magic hints and puzzle preview system

### Custom Features (Undergraduate)
1. **Festive Theme System** - Dynamic themes based on performance and time of day
2. **Gift & Reward System** - Comprehensive achievement system with unique gifts
3. **Holiday Magic Power-ups** - Earnable and usable power-ups during gameplay
4. **Christmas Story Mode** - Engaging holiday narrative that unfolds as players progress

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: PHP 7.4+
- **Database**: MySQL 5.7+ (Command-line only - NO GUI tools)
- **Server**: Apache/Nginx with PHP support

## Installation & Setup

### Prerequisites
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Web server (Apache/Nginx)
- Command-line access to MySQL

### Database Setup (Command-Line Only)

**IMPORTANT**: This project requires command-line database setup. GUI tools like MySQL Workbench or phpMyAdmin are PROHIBITED.

1. **Create Database** (via command line):
```bash
mysql -u root -p
CREATE DATABASE santas_workshop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

2. **Import Schema**:
```bash
mysql -u root -p santas_workshop < sql/schema.sql
```

3. **Configure Database Connection**:
Edit `php/config.php` and update the database credentials:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'santas_workshop');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
```

### File Structure Setup

1. **Clone or extract project files** to your web server directory

2. **Set proper permissions**:
```bash
chmod 755 php/
chmod 644 php/*.php
```

3. **Create assets directories** (if not present):
```bash
mkdir -p assets/images assets/audio
```

### Web Server Configuration

1. **Point web server** to project root directory

2. **Ensure PHP is enabled** and can connect to MySQL

3. **Test installation** by visiting `index.html` in your browser

## Usage

### Starting the Game

1. Navigate to `index.html` in your web browser
2. Register a new account or login
3. Select puzzle size and start playing
4. Use controls: Shuffle, Reset, Magic Hints, Preview

### Game Controls

- **Click tiles** to move them into the empty space
- **Drag and drop** tiles for easier movement
- **Shuffle** - Randomly shuffle the puzzle
- **Reset** - Return puzzle to solved state
- **Use Magic** - Get a hint for the next optimal move
- **Preview** - See the solved puzzle state

### Power-ups

Unlock and use power-ups by earning achievements:
- **Time Freeze** - Pause timer for 30 seconds
- **Extra Hints** - Gain 2 additional hints
- **Move Undo** - Reverse your last move
- **Tile Preview** - See next 3 optimal moves
- **Speed Boost** - 2x timer for 1 minute
- **Shuffle Protection** - Prevent accidental shuffle

## Project Structure

```
Santa's_workshop/
├── index.html              # Landing page
├── game.html              # Main game interface
├── login.html             # User login
├── register.html          # User registration
├── leaderboard.html       # Santa's List (leaderboard)
├── analytics.html         # Analytics dashboard
├── css/
│   ├── style.css         # Main stylesheet
│   ├── game.css         # Game-specific styles
│   └── theme.css         # Theme variables
├── js/
│   ├── puzzle.js        # Core puzzle mechanics
│   ├── game.js          # Game controller
│   ├── adaptive.js      # Adaptive difficulty
│   ├── hints.js         # Hint system
│   ├── audio.js         # Audio management
│   ├── victory.js       # Victory system
│   ├── themes.js        # Theme system
│   ├── gifts.js         # Gift system
│   ├── powerups.js      # Power-up system
│   ├── story.js         # Story mode
│   ├── tracking.js      # Progress tracking
│   └── auth.js          # Authentication
├── php/
│   ├── config.php       # Database config
│   ├── auth.php         # Authentication API
│   ├── game.php         # Game data API
│   ├── leaderboard.php  # Leaderboard API
│   ├── analytics.php    # Analytics API
│   └── tracking.php     # Tracking API
├── sql/
│   └── schema.sql       # Database schema
├── assets/
│   ├── images/          # Theme images
│   └── audio/           # Audio files
├── README.md            # This file
└── DEVELOPMENT_JOURNAL.md # Development log
```

## Security Features

- **SQL Injection Prevention**: All queries use PDO prepared statements
- **XSS Protection**: Input sanitization with `htmlspecialchars()`
- **Password Security**: Bcrypt hashing for passwords
- **Session Security**: Secure session configuration
- **Input Validation**: Server-side validation for all user inputs

## Database Schema

The database includes the following tables:
- `users` - User accounts
- `user_profiles` - User profile data
- `user_preferences` - User preferences
- `game_sessions` - Game session records
- `move_history` - Individual move tracking
- `performance_metrics` - Performance analytics
- `player_behavior` - Player behavior statistics
- `puzzle_popularity` - Puzzle popularity metrics
- `user_badges` - User achievements and badges
- `story_progress` - Story mode progress
- `gifts` - Unlocked gifts

## Development Notes

- All database operations use command-line MySQL (NO GUI tools)
- Prepared statements are used for all SQL queries
- Error handling is implemented throughout
- Code follows PSR-12 coding standards where applicable

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check database credentials in `php/config.php`
- Ensure database exists: `mysql -u root -p -e "SHOW DATABASES;"`

### Session Issues
- Check PHP session configuration
- Verify session directory permissions
- Clear browser cookies if issues persist

### Audio Not Playing
- Check browser audio permissions
- Verify audio files exist in `assets/audio/`
- Audio is optional and game works without it

## AI Usage Disclosure

This project was developed with assistance from AI coding tools for:
- Code structure and organization
- Algorithm implementation guidance
- Documentation generation
- Code review and optimization suggestions

All code has been reviewed, tested, and customized for this specific project. The core game logic, database design, and feature implementation were developed following the project requirements and specifications.

## License

This project is created for educational purposes as part of a web programming course.

## Credits

- **Project**: Santa's Workshop Puzzle Game
- **Course**: CSC 4370/6370 Web Programming
- **Theme**: Christmas/Holiday
- **Version**: Santa's Workshop

## Contact & Support

For issues or questions, please refer to the development journal or contact the development team.

---

**Note**: This project requires command-line database setup. GUI database management tools are not permitted per project requirements.

