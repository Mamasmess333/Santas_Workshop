# Security Notes for Repository

## Database Configuration

The `php/config.php` file contains database credentials. The current values are:
- **Default local development values** (safe for local use)
- For production deployment, you should:
  1. Use environment variables instead of hardcoded credentials
  2. Or ensure `config.php` is properly secured on the server
  3. Never commit actual production passwords to git

## Current Security Status

✅ **Safe to commit**: The current `config.php` uses default local development values
- `DB_USER: 'root'`
- `DB_PASS: ''` (empty - standard for local XAMPP)

⚠️ **For Production**:
- Change these values in your production environment
- Use a dedicated database user with limited permissions
- Use strong passwords
- Consider using environment variables or a separate config file not in git

## What's Protected

- ✅ SQL injection: All queries use PDO prepared statements
- ✅ XSS protection: Input sanitization with `htmlspecialchars()`
- ✅ Password security: Bcrypt hashing for passwords
- ✅ Session security: Secure session configuration
- ✅ CSRF protection: Token system implemented

## Repository Safety

The repository is safe to push because:
1. Only default local dev credentials are included
2. These are standard for local development environments
3. Production deployment will require updating credentials
4. No sensitive production data is included

## .gitignore Protection

Files excluded from git:
- Local test files (`.bat`, `.ps1`)
- Setup documentation (local installation guides)
- Log files and temporary files
- Future environment files (`.env`)

