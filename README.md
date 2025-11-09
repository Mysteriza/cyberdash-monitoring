# CyberDash

A cyberpunk-themed, real-time dashboard for everything you care about.

CyberDash is my personal, all-in-one status screen. It's a single Next.js app that pulls data from my local hardware (an ESP8266) and a bunch of global APIs.

The best part? It's location-aware. If you allow location access, it automatically figures out your local currency and pulls relevant weather and country data, defaulting to Indonesian Rupiah (IDR) if not.

## Features

* 🌡️ **Real-time Indoor Stats:** Hooks directly into a Blynk-powered ESP8266 to stream your indoor temperature, humidity, pressure, and air quality.
* 🌦️ **Hyper-Local Weather:** Uses your browser's location to fetch detailed local weather from Open-Meteo. You get current conditions (like UV index and AQI), a 12-hour hourly view, and a full 7-day forecast.
* 💸 **Location-Aware Finances:** No more mental math. The dashboard automatically detects your local currency and shows:
    * **Currency:** The latest USD-to-Your-Currency conversion rate.
    * **Crypto:** The current Bitcoin price in both USD and your local currency.
* 🌍 **Personalized Country Info:** See your country's flag, population, and capital, pulled automatically based on your location.
* 🟢 **Dev Service Status:** Quickly check if GitHub, Cloudflare, OpenAI, and Anthropic are operational before you start debugging.
* ⚙️ **You're in Control:** A slide-out settings panel lets you change the refresh rate for *every single module*. Set it to update every 10 seconds or only when you click. Your settings are saved locally.
* 📱 **Responsive Layout:** It's a clean, fixed sidebar on desktop that smartly collapses into the main feed on your phone.

## Tech Stack

This project is built with a modern, straightforward stack:

* **Framework:** Next.js 15.3.3
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **UI:** shadcn/ui & Radix UI
* **State:** React Context API (for Settings and Location)
* **Icons:** Lucide React
* **Backend:** Next.js API Routes (Route Handlers)
* **Deployment:** Configured for Firebase App Hosting

## Getting Started

Want to run your own? Here’s how.

### Prerequisites

You'll just need Node.js (v18.18.0 or later).

### Installation

1.  **Clone it:**
    ```sh
    git clone https://github.com/Mysteriza/cyberdash-monitoring
    cd cyberdash
    ```

2.  **Install deps:**
    ```sh
    npm install
    ```

3.  **Set up your keys:**

    Create a `.env.local` file in the root of the project. You'll need to get free API keys for these services:

    ```env
    # 1. Blynk API
    # Auth token from your Blynk project (for indoor data)
    BLYNK_AUTH_TOKEN=YOUR_BLYNK_TOKEN 

    # 2. CoinMarketCap API
    # API key from https://coinmarketcap.com/api/
    COINMARKETCAP_API_KEY=YOUR_CMC_API_KEY

    # 3. ExchangeRate-API
    # API key from https://www.exchangerate-api.com/
    EXCHANGERATE_APP_ID=YOUR_EXCHANGERATE_API_KEY
    ```

4.  **Run it:**
    ```sh
    npm run dev
    ```

It'll be running at `http://localhost:9002`.

## How It Works: The API

To keep all the API keys safe and off the client, this project uses Next.js API Routes as a secure backend proxy. All data is fetched securely on the server.

* `/api/indoor`: Grabs data from Blynk.
* `/api/outdoor`: Hits Open-Meteo for weather.
* `/api/country`: Grabs info from RestCountries.
* `/api/currency`: Hits ExchangeRate-API.
* `/api/coinmarketcap`: Hits CoinMarketCap for the BTC price.
* `/api/status`: Checks all the `statuspage.io` pages.
