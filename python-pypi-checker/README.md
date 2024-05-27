# Python PyPI Checker

This project is a web-based tool for analyzing and updating the packages listed in your `requirements.txt` file. It fetches the latest versions of the packages from PyPI and allows you to generate an updated `requirements.txt`.

## Features

- **Paste Requirements**: Paste the content of your `requirements.txt` file into the provided textarea.
- **Check Latest Versions**: Click the "Check Latest Versions" button to fetch the latest versions of the packages from PyPI.
- **View Package Details**: Click on any package row to view detailed information about the package, including all available versions.
- **Generate New Requirements**: Generate a new `requirements.txt` file with the latest versions of the packages.

## How to Use

1. Clone the repository:
    ```
<div id="znofak"></div>sh
    git clone https://github.com/yourusername/python-pypi-checker.git
    cd python-pypi-checker
    ```

2. Open the `index.html` file in your web browser.

3. Paste the content of your `requirements.txt` file into the textarea.

4. Click the "Check Latest Versions" button to fetch the latest versions of the packages.

5. Click on any package row to view detailed information about the package.

6. Click the "Generate New Requirements" button to generate a new `requirements.txt` file with the latest versions of the packages.

## Files

- `index.html`: The main HTML file for the web interface.
- `script.js`: The JavaScript file that handles the logic for fetching package versions and updating the UI.
- `styles.css`: The CSS file for styling the web interface.
- `README.md`: This file.

## Dependencies

This project does not have any server-side dependencies. It uses the PyPI JSON API to fetch package information.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
