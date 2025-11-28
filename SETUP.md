# Setup Guide - Santa's Workshop Puzzle Game

Complete setup instructions for XAMPP, database, and Git.

---

## Part 1: Install XAMPP

1. **Download**: https://www.apachefriends.org/download.html
2. **Install**: Accept default location `C:\xampp` (NOT Program Files)
3. **Start Services**: Open XAMPP Control Panel → Start Apache and MySQL
4. **Allow Firewall**: Safe to allow (local only)

---

## Part 2: Database Setup (Command-Line Only)

**⚠️ IMPORTANT**: GUI tools (MySQL Workbench, phpMyAdmin) are PROHIBITED.

### Create Database

```bash
mysql -u root -p
CREATE DATABASE santas_workshop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### Import Schema

```bash
mysql -u root -p santas_workshop < sql/schema.sql
```

### Configure Connection

Edit `php/config.php`:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'santas_workshop');
define('DB_USER', 'root');
define('DB_PASS', ''); // Your MySQL password
```

---

## Part 3: Start Server

### Option A: XAMPP PHP (Recommended)
```bash
C:\xampp\php\php.exe -S localhost:8000
```

### Option B: XAMPP Apache
- Copy project to `C:\xampp\htdocs\Santa's_workshop\`
- Access: `http://localhost/Santa's_workshop/index.html`

### Access Game
Open: `http://localhost:8000/index.html`

---

## Part 4: Git Setup & Push

```bash
git init
git remote add origin https://github.com/Mamasmess333/Santas_Workshop.git
git add .
git commit -m "Initial commit: Santa's Workshop Puzzle Game"
git push -u origin main
```

If push rejected:
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

---

## Troubleshooting

- **Database connection failed**: Check MySQL running, verify credentials in `php/config.php`
- **Port 80 in use**: Use PHP server on port 8000 instead
- **Audio not playing**: Browser requires user interaction - click anywhere first

---

**Full details in README.md**
