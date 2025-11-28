# Local Setup Guide - Santa's Workshop

## Quick Start for Testing Locally

### Option 1: Using PHP Built-in Server (Recommended for Testing)

1. **Start PHP Server**:
   ```bash
   php -S localhost:8000
   ```

2. **Open in Browser**:
   - Navigate to: `http://localhost:8000/index.html`

3. **Test Setup**:
   ```bash
   php test_setup.php
   ```

### Option 2: Using XAMPP/WAMP (Windows)

1. **Copy project** to `htdocs` (XAMPP) or `www` (WAMP)

2. **Start Apache and MySQL** from XAMPP/WAMP control panel

3. **Access**: `http://localhost/Santa's_workshop/index.html`

### Database Setup (Command-Line Only)

1. **Start MySQL** (if not running):
   ```bash
   # XAMPP: MySQL should start from control panel
   # Or use: mysql -u root -p
   ```

2. **Create Database**:
   ```bash
   mysql -u root -p
   CREATE DATABASE santas_workshop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   EXIT;
   ```

3. **Import Schema**:
   ```bash
   mysql -u root -p santas_workshop < sql/schema.sql
   ```

4. **Configure Connection**:
   Edit `php/config.php`:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'santas_workshop');
   define('DB_USER', 'root');
   define('DB_PASS', ''); // Your MySQL password
   ```

### Testing Checklist

- [ ] PHP 7.4+ installed
- [ ] MySQL running
- [ ] Database created and schema imported
- [ ] `php/config.php` configured
- [ ] Web server running
- [ ] Can access `index.html`
- [ ] Can register/login
- [ ] Can play game

### Troubleshooting

**PHP not found**:
- Install PHP from https://windows.php.net/download/
- Or use XAMPP: https://www.apachefriends.org/

**MySQL connection fails**:
- Check MySQL is running
- Verify credentials in `php/config.php`
- Test connection: `mysql -u root -p`

**404 errors**:
- Make sure you're accessing via web server (not file://)
- Check file paths are correct

**Database errors**:
- Verify schema was imported: `mysql -u root -p -e "USE santas_workshop; SHOW TABLES;"`
- Check user has permissions

