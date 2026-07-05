# To-Do List Web Application

A simple and elegant to-do list web application built with vanilla HTML, CSS, and JavaScript.

## Features

- Add new tasks
- Mark tasks as completed
- Delete tasks
- Filter tasks (All, Active, Completed)
- Clear all completed tasks
- Persistent storage using localStorage
- Responsive design with smooth animations

## Getting Started

### Prerequisites

- Node.js installed on your system

### Installation & Running

1. Navigate to the project directory
2. Start the server:
   ```bash
   npm start
   ```
   Or directly:
   ```bash
   node server.js
   ```

3. Open your browser and go to: `http://localhost:3000`

## Usage

- Type a task in the input field and click "Add Task" or press Enter
- Click the checkbox to mark a task as completed
- Click "Delete" to remove a task
- Use the filter buttons to view All, Active, or Completed tasks
- Click "Clear Completed" to remove all completed tasks at once

## Files

- `index.html` - Main HTML structure
- `styles.css` - Styling and animations
- `app.js` - JavaScript functionality
- `server.js` - Simple Node.js HTTP server
- `package.json` - Project configuration

## Technologies

- HTML5
- CSS3 (with animations and gradients)
- Vanilla JavaScript (ES6+)
- Node.js HTTP server
- localStorage API for data persistence

## AutoVerdict — Car Quality & Value Checker

A separate standalone app in this repo (`car-checker.html`, `car-checker.css`, `car-checker.js`, `car-data.js`). Look up any make/model/year to see a reliability score, safety rating, common issues, and pros/cons, then enter mileage, condition, and an asking price to see an estimated fair market value and whether that price is a good deal.

Run the same server (`npm start`) and open `http://localhost:3000/car-checker.html`.
