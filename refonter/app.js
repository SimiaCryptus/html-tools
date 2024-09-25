import { transformText, getAvailableStyles, updateConfig } from './transform.js';

// DOM elements
const inputTextArea = document.getElementById('input-text');
const outputTextArea = document.getElementById('output-text');
const styleSelect = document.getElementById('style-select');
const transformButton = document.getElementById('transform-button');
const copyButton = document.getElementById('copy-button');
const autoTransformCheckbox = document.getElementById('auto-transform');

// Initialize the app
function init() {
  // Populate style select options
  const styles = getAvailableStyles();
  styles.forEach(style => {
    const option = document.createElement('option');
    option.value = style;
    option.textContent = style.charAt(0).toUpperCase() + style.slice(1);
    styleSelect.appendChild(option);
  });

  // Set up event listeners
  inputTextArea.addEventListener('input', handleInput);
  styleSelect.addEventListener('change', handleStyleChange);
  transformButton.addEventListener('click', handleTransformClick);
  copyButton.addEventListener('click', handleCopyClick);
  autoTransformCheckbox.addEventListener('change', handleAutoTransformChange);

  // Initial transform
  handleTransformClick();
}

// Handle input changes
function handleInput() {
  if (autoTransformCheckbox.checked) {
    handleTransformClick();
  }
}

// Handle style selection changes
function handleStyleChange() {
  handleTransformClick();
}

// Handle transform button click
function handleTransformClick() {
  const inputText = inputTextArea.value;
  const selectedStyle = styleSelect.value;
  const transformedText = transformText(inputText, selectedStyle);
  outputTextArea.value = transformedText;
}

// Handle copy button click
function handleCopyClick() {
  navigator.clipboard.writeText(outputTextArea.value)
    .then(() => alert('Transformed text copied to clipboard!'))
    .catch(err => console.error('Failed to copy text: ', err));
}

// Handle auto-transform checkbox changes
function handleAutoTransformChange() {
  updateConfig({ autoTransform: autoTransformCheckbox.checked });
  if (autoTransformCheckbox.checked) {
    handleTransformClick();
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);