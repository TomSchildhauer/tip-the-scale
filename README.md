# Tip the Scale

My adaptation of the game "Lights out". It was developed as a student project many years ago and I recently dockerized it, so it could be easily hosted.

The original game idea was to collect up the results of each game and use those results to simulate a tug of war between the two colors for which the (early) game can be solved: green vs. orange. That meta game was never put into place, but this front-end part is fairly polished for what it is.

## [Play the game here](https://tipthescale.tolltom.de)

## Features

*   Playable "tip the scale" game.
*   Customizable game settings (size, color variety, fill ratio).
*   Difficulty progression.
*   Game state saving via URL sharing and Local Storage.
*   Level editor mode.
*   PWA-like features (manifest, icons).

## Tech Stack (Original)

*   HTML
*   SCSS
*   Vanilla JavaScript

## Running with Docker

This project can be run using Docker for a consistent environment.

1.  **Prerequisites:**
    *   Docker installed and running.

2.  **Build the Docker image:**
    ```bash
    docker build -t tipthescale .
    ```

3.  **Run the Docker container:**
    ```bash
    docker run -d -p 8080:80 tipthescale
    ```

4.  **Access the game:**
    Open your browser and navigate to `http://localhost:8080`.

## Local Development (using npm scripts)

1.  **Prerequisites:**
    *   Node.js and npm installed.

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Build the project:**
    This will compile SCSS, copy assets, and place everything in the `dist/` folder.
    ```bash
    npm run build
    ```

4.  **Serve `dist/` folder:**
    Use any local static server (e.g., `npx http-server dist`) to view the game.

---

*This project was an early exploration into web development.*