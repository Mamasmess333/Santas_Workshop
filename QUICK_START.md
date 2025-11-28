# Quick Start - Test Before Pushing to GitHub

## Step 1: Check Prerequisites

### Check if PHP is installed:
```bash
php --version
```

If PHP is not found, you have two options:

**Option A: Install PHP separately**
- Download from: https://windows.php.net/download/
- Add PHP to your system PATH

**Option B: Use XAMPP (Easiest for Windows)**
- Download: https://www.apachefriends.org/
- Install and start Apache + MySQL from XAMPP Control Panel
- PHP will be at: `C:\xampp\php\php.exe`

## Step 2: Set Up Database

### Using Command Line (REQUIRED - No GUI tools):

1. **Open MySQL command line**:
   ```bash
   mysql -u root -p
   ```
   (Enter your MySQL password when prompted)

2. **Create database**:
   ```sql
   CREATE DATABASE santas_workshop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   EXIT;
   ```

3. **Import schema**:
   ```bash
   mysql -u root -p santas_workshop < sql/schema.sql
   ```

4. **Verify tables were created**:
   ```bash
   mysql -u root -p -e "USE santas_workshop; SHOW TABLES;"
   ```

### Configure Database Connection:

Edit `php/config.php` and update:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'santas_workshop');
define('DB_USER', 'root');
define('DB_PASS', 'your_mysql_password');
```

## Step 3: Start Local Server

### Method 1: PHP Built-in Server (Recommended)
```bash
php -S localhost:8000
```

Or double-click `start_server.bat` (Windows)

### Method 2: XAMPP
- Copy project to `C:\xampp\htdocs\Santas_workshop`
- Start Apache from XAMPP Control Panel
- Access: `http://localhost/Santas_workshop/index.html`

## Step 4: Test the Application

1. **Open browser**: `http://localhost:8000/index.html`

2. **Test features**:
   - Register a new account
   - Login
   - Play a puzzle game
   - Check leaderboard
   - View analytics

3. **Run setup test**:
   ```bash
   php test_setup.php
   ```

## Step 5: Fix Any Issues

### Common Issues:

**"Database connection failed"**
- Check MySQL is running
- Verify credentials in `php/config.php`
- Test: `mysql -u root -p`

**"404 Not Found"**
- Make sure you're using `http://localhost:8000` (not `file://`)
- Check you're in the project root directory

**"PHP extensions missing"**
- Enable `pdo_mysql` in `php.ini`
- Restart web server

## Step 6: Ready to Push to GitHub

Once everything works locally:

1. **Initialize git** (if not done):
   ```bash
   git init
   git remote add origin https://github.com/Mamasmess333/Santas_Workshop.git
   ```

2. **Add files**:
   ```bash
   git add .
   ```

3. **Commit**:
   ```bash
   git commit -m "Initial commit - Santa's Workshop Puzzle Game"
   ```

4. **Push**:
   ```bash
   git push -u origin main
   ```

## Testing Checklist

Before pushing, verify:
- [ ] PHP server starts without errors
- [ ] Database connection works
- [ ] Can register new user
- [ ] Can login
- [ ] Puzzle game loads and tiles move
- [ ] Timer works
- [ ] Win condition triggers
- [ ] Leaderboard displays
- [ ] No console errors in browser

---

**Note**: The `php/config.php` file contains database credentials. Consider using environment variables or `.env` file for production, but for now this is fine for local testing.

