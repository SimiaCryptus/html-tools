# Datetime Converter

## Overview

The Datetime Converter is a web application that allows users to convert between different datetime formats. The
supported formats include ISO 8601, Unix Timestamp, Local Datetime, and UTC Datetime. Users can also set the current
datetime, clear all fields, and add or subtract durations from the current datetime.

## Features

- **ISO 8601**: Convert to/from ISO 8601 format (e.g., `2023-10-01T12:00:00Z`).
- **Unix Timestamp**: Convert to/from Unix Timestamp (e.g., `1609459200`).
- **Local Datetime**: Convert to/from local datetime format (e.g., `MM/DD/YYYY HH:MM:SS`).
- **UTC Datetime**: Convert to/from UTC datetime format (e.g., `YYYY-MM-DD HH:MM:SS UTC`).
- **Set to Today**: Set all fields to the current datetime.
- **Add/Subtract Duration**: Add or subtract days, hours, minutes, and seconds from the current datetime.
- **Clear Fields**: Clear all input fields.

## Usage

1. **Open the Application**: Open `index.html` in a web browser.
2. **Input Datetime**: Enter a datetime value in any of the supported formats.
3. **Convert**: The application will automatically convert the input to all other formats.
4. **Set to Today**: Click the "Set to Today" button to set all fields to the current datetime.
5. **Add/Subtract Duration**: Click the "Add/Subtract Duration" button to open a modal where you can specify the
   duration to add or subtract.
6. **Clear Fields**: Click the "Clear" button to clear all input fields.

## Files

- `index.html`: The main HTML file for the application.
- `styles.css`: The CSS file for styling the application.
- `script.js`: The JavaScript file containing the logic for datetime conversion and event handling.

## Development

To modify or extend the application, follow these steps:

1. **Clone the Repository**: Clone the repository to your local machine.
2. **Edit Files**: Make changes to `index.html`, `styles.css`, or `script.js` as needed.
3. **Test**: Open `index.html` in a web browser to test your changes.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
