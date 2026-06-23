# Quick Start Guide

Get Radar running in 5 minutes!

## Prerequisites

- Node.js v18+ installed ([download](https://nodejs.org/))
- npm v9+ (comes with Node.js)
- Terminal/Command Prompt

## Step 1: Clone the Repository

```bash
git clone https://github.com/Syntax-Error-1337/Radar.git
cd Radar
```

## Step 2: Install Dependencies

```bash
npm run install:all
```

This installs dependencies for both client and server.

## Step 3: Configure Environment Variables

### Server Configuration

```bash
# Copy the example file
cp server/.env.example server/.env

# Edit with your favorite editor
nano server/.env  # or code server/.env
```

**Minimum required:**

- `AISSTREAM_API_KEY` - Get free at [aisstream.io](https://aisstream.io)
- Everything else has sensible defaults!

### Client Configuration

```bash
# Copy the example file
cp client/.env.example client/.env

# Default settings work out of the box!
```

## Step 4: Get API Keys (Optional but Recommended)

### AISStream (Maritime tracking)

1. Visit https://aisstream.io
2. Sign up for free account
3. Copy your API key
4. Paste in `server/.env` as `AISSTREAM_API_KEY=your_key_here`

### Other APIs (Optional)

- **OpenRouter** (for AI insights): https://openrouter.ai
- **Cloudflare Radar** (cyber data): https://dash.cloudflare.com

## Step 5: Start the Application

```bash
npm run dev
```

This starts:

- 🎨 Frontend at http://localhost:5173
- ⚙️ Backend at http://localhost:3001

## Step 6: Open in Browser

Visit http://localhost:5173 and you should see:

- 🛩️ Flights module with live aircraft
- 🚢 Maritime module with live vessels
- 🔒 Cyber security dashboard
- 📰 OSINT news monitor
- 📊 Global monitor dashboard

## Troubleshooting

### Port Already in Use

If ports 5173 or 3001 are in use:

**Client (port 5173):**
Edit `client/vite.config.ts`:

```typescript
server: {
  port: 5174,  // Change to any available port
  // ...
}
```

**Server (port 3001):**
Edit `server/src/index.ts` to change the port.

### Missing API Keys

If you see "Connection failed" for maritime data:

- Make sure you added `AISSTREAM_API_KEY` to `server/.env`
- Restart the server with `npm run dev`

### Build Errors

If you encounter errors during installation:

```bash
# Clear caches and reinstall
rm -rf node_modules client/node_modules server/node_modules
rm -rf package-lock.json client/package-lock.json server/package-lock.json
npm run install:all
```

### Platform-Specific Issues

**Windows:**

- Use Git Bash or WSL for best compatibility
- If you see line ending errors, run: `git config core.autocrlf true`

**macOS:**

- Make sure Xcode Command Line Tools are installed: `xcode-select --install`

**Linux:**

- You may need to install build essentials: `sudo apt-get install build-essential`

## Next Steps

### Explore Features

1. **Flights Module** - Click on any aircraft to see detailed telemetry
2. **Maritime Module** - Track vessels in real-time worldwide
3. **Display Modes** - Try EO, FLIR, and CRT themes
4. **Map Projections** - Toggle between Globe and Mercator views

### Customize

- **Map center:** Edit `ADSB_LOL_LAT` and `ADSB_LOL_LON` in `server/.env`
- **Coverage radius:** Change `ADSB_LOL_RADIUS` (in nautical miles)
- **Theme:** Select from top navigation bar

### Development

```bash
# Run tests (client)
cd client
npm test

# Run linter
npm run lint

# Build for production
npm run build
```

## Docker Quick Start (Alternative)

If you prefer Docker:

```bash
# 1. Copy environment files
cp server/.env.example server/.env

# 2. Edit server/.env with your API keys

# 3. Start with Docker Compose
docker-compose up

# Access at http://localhost:3001
```

## Getting Help

- 📖 Read the [full README](README.md)
- 🐛 Report bugs: [GitHub Issues](https://github.com/Syntax-Error-1337/Radar/issues)
- 💬 Ask questions: [GitHub Discussions](https://github.com/Syntax-Error-1337/Radar/discussions)
- 🤝 Contribute: See [CONTRIBUTING.md](CONTRIBUTING.md)

## What's Next?

- ⭐ Star the project on GitHub
- 🍴 Fork and customize for your needs
- 🤝 Contribute improvements
- 📢 Share with others!

---

**Happy tracking!** 🛩️🚢🌍
