# pyBattler

pyBattler is an educational multiplayer game designed to help beginner and intermediate software engineering students practise Python control flow through interactive questions and physical QR code cards.

Players use physical cards with QR codes to perform actions during the game. Before an action can be executed, the player must scan the card and answer a Python question correctly.

## GitHub Repository

[https://github.com/Kwun001/pyBattler](https://github.com/Kwun001/pyBattler)

## Technologies Used

- **Backend:** Node.js, Express.js
- **Frontend:** Pug, HTML, CSS, JavaScript
- **Database:** MySQL / MariaDB
- **Database Connection:** mysql2
- **Development Environment:** XAMPP

## Features

- User registration and login
- Guest mode
- Multiplayer game rooms
- QR code card scanning
- Randomly selected Python questions
- Turn-based multiplayer gameplay
- Player leaderboard
- Game history
- Admin question management

## How to Play

### 1. Game Cards

The game uses three types of physical cards:

| Card Type | Action |
|-----------|--------|
| Attack    | Deal 10 HP damage to another player. |
| Defense   | Block an incoming attack. |
| Recovery  | Restore 5 HP. |

Each card type has 10 cards, making a total of 30 cards.

### 2. Starting the Game

- Each player starts with 100 HP.
- Each player randomly receives 3 cards at the beginning of the game.
- Players take turns performing actions.

### 3. Performing an Action

During their turn, a player scans the QR code on the card they want to use.

After scanning:
1. The system displays a randomly selected Python question.
2. The player must answer the question correctly.
3. If the answer is correct, the corresponding card action can be executed.
4. After using the card, the player returns it to the card stack and draws a new card.

### 4. When a Player Cannot Perform an Action

If a player does not have a suitable card for their turn, they must return one card to the card stack and draw a replacement card.

For example, if a player does not have an Attack card at the beginning of the game, they cannot perform an Attack action. They must return one of their cards, draw a new card, and repeat this process until they obtain a suitable card.

### 5. Winning the Game

Players use their cards strategically to attack opponents, defend themselves, and recover HP throughout the game.

## Getting Started

Follow these instructions to run pyBattler on your local computer.

### 1. Requirements

Install the following:

- [Node.js](https://nodejs.org/)
- [XAMPP](https://www.apachefriends.org/)
- [Git](https://git-scm.com/) (optional)
- [Visual Studio Code](https://code.visualstudio.com/) (recommended)

### 2. Clone the Repository

Open a terminal and run:

```bash
git clone https://github.com/Kwun001/pyBattler.git
cd pyBattler
```

Alternatively, download the repository as a ZIP file from GitHub and extract it.

### 3. Set Up the Database

1. Open XAMPP.
2. Start MySQL.
3. Open phpMyAdmin at `http://localhost/phpmyadmin`.
4. Create a database named `pybattler`.
5. Select the `pybattler` database.
6. Open the **Import** tab.
7. Import `database/pyBattlerDatabase.sql`.

### 4. Create the Environment File (.env)

The project uses environment variables to store database credentials and session configuration.

In the project root directory:

1. Find the `.env.example` file.
2. Copy it.
3. Rename the copied file to `.env`.
4. Open `.env` and configure your local settings.

Example:

```env
PORT=3000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_database_password
DB_NAME=pybattler

SESSION_SECRET=your_random_secret
```

Update the database settings according to your local XAMPP configuration.

For example, if your MySQL root account does not have a password:

```env
DB_PASSWORD=
```

Generate a random session secret by running this command in PowerShell:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the generated value and replace `your_random_secret` in `.env`.

### 5. Install Dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

### 6. Run the Application

Start the application:

```bash
node app.js
```

Open your browser and visit:

http://localhost:3000

The application should now be running locally.

## Admin Account

The following account can be used to access the admin interface:

| Field    | Credential      |
|----------|-----------------|
| Username | Admin           |
| Email    | admin@gmail.com |
| Password | Admin@1234      |

### Admin Access Configuration

The admin credential settings can be controlled in `config/settings.js`.

- `true`: The admin's email and password cannot be changed through the normal account editing process.
- `false`: The admin can edit their email and password like a normal account.

To change this setting, update `LOCK_ADMIN_CREDENTIALS` in `config/settings.js`.

## Player Demo Account

The following account can be used to test normal player functionality:

| Field    | Credential   |
|----------|--------------|
| Email    | c1@gmail.com |
| Password | Ckw1234!     |
## Project Structure

pyBattler/
├── cards/
│   └── pyBattler Cards.pdf
│
├── config/
│   ├── db.js
│   └── settings.js
│
├── database/
│   └── pybattler.sql
│
├── public/
│   ├── css/
│   ├── js/
│   └── images/
│       └── cards/
│
├── routes/
│
├── views/
│   └── admin/
│
├── .env.example
├── .gitignore
├── app.js
├── package.json
├── package-lock.json
└── README.md

## Notes

- Import the database before running the application.
- Each user must configure their own `.env` file.
- XAMPP MySQL must be running while using the local application.
- Camera permission is required for QR code scanning.
- QR code scanning requires a secure browser context (HTTPS when accessed from a deployed website).
