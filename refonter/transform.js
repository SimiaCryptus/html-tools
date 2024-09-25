// Character sets for text transformation
const characterSets = {
  uppercase: {"a": "A", "b": "B", "c": "C", "d": "D", "e": "E", "f": "F", "g": "G", "h": "H", "i": "I", "j": "J", "k": "K", "l": "L", "m": "M", "n": "N", "o": "O", "p": "P", "q": "Q", "r": "R", "s": "S", "t": "T", "u": "U", "v": "V", "w": "W", "x": "X", "y": "Y", "z": "Z"},
  smallcapsBold: {"a": "ᴬ", "b": "ᴮ", "c": "ᴮ", "d": "ᴰ", "e": "ᴱ", "f": "ᴱ", "g": "ᴳ", "h": "ᴴ", "i": "ᴵ", "j": "ᴶ", "k": "ᴷ", "l": "ᴸ", "m": "ᴹ", "n": "ᴺ", "o": "ᴼ", "p": "ᴾ", "q": "Q", "r": "ᴿ", "s": "ˢ", "t": "ᵀ", "u": "ᵁ", "v": "ᵛ", "w": "ᵂ", "x": "ˣ", "y": "ʸ", "z": "ᶻ"},
  fancy: {"a": "𝓪", "b": "𝓫", "c": "𝓬", "d": "𝓭", "e": "𝓮", "f": "𝓯", "g": "𝓰", "h": "𝓱", "i": "𝓲", "j": "𝓳", "k": "𝓴", "l": "𝓵", "m": "𝓶", "n": "𝓷", "o": "𝓸", "p": "𝓹", "q": "𝓺", "r": "𝓻", "s": "𝓼", "t": "𝓽", "u": "𝓾", "v": "𝓿", "w": "𝔀", "x": "𝔁", "y": "𝔂", "z": "𝔃"},
  bold: {"a": "𝐚", "b": "𝐛", "c": "𝐜", "d": "𝐝", "e": "𝐞", "f": "𝐟", "g": "𝐠", "h": "𝐡", "i": "𝐢", "j": "𝐣", "k": "𝐤", "l": "𝐥", "m": "𝐦", "n": "𝐧", "o": "𝐨", "p": "𝐩", "q": "𝐪", "r": "𝐫", "s": "𝐬", "t": "𝐭", "u": "𝐮", "v": "𝐯", "w": "𝐰", "x": "𝐱", "y": "𝐲", "z": "𝐳"},
  italic: {"a": "𝑎", "b": "𝑏", "c": "𝑐", "d": "𝑑", "e": "𝑒", "f": "𝑓", "g": "𝑔", "h": "ℎ", "i": "𝑖", "j": "𝑗", "k": "𝑘", "l": "𝑙", "m": "𝑚", "n": "𝑛", "o": "𝑜", "p": "𝑝", "q": "𝑞", "r": "𝑟", "s": "𝑠", "t": "𝑡", "u": "𝑢", "v": "𝑣", "w": "𝑤", "x": "𝑥", "y": "𝑦", "z": "𝑧"},
  underline: {"a": "𝗮", "b": "𝗯", "c": "𝗰", "d": "𝗱", "e": "𝗲", "f": "𝗳", "g": "𝗴", "h": "𝗵", "i": "𝗶", "j": "𝗷", "k": "𝗸", "l": "𝗹", "m": "𝗺", "n": "𝗻", "o": "𝗼", "p": "𝗽", "q": "𝗾", "r": "𝗿", "s": "𝘀", "t": "𝘁", "u": "𝘂", "v": "𝘃", "w": "𝘄", "x": "𝘅", "y": "𝘆", "z": "𝘇"},
   strikethrough: {"a": "̶a", "b": "̶b", "c": "̶c", "d": "̶d", "e": "̶e", "f": "̶f", "g": "̶g", "h": "̶h", "i": "̶i", "j": "̶j", "k": "̶k", "l": "̶l", "m": "̶m", "n": "̶n", "o": "̶o", "p": "̶p", "q": "̶q", "r": "̶r", "s": "̶s", "t": "̶t", "u": "̶u", "v": "̶v", "w": "̶w", "x": "̶x", "y": "̶y", "z": "̶z"},
  script: {"a": "𝓐", "b": "𝓑", "c": "𝓒", "d": "𝓓", "e": "𝓔", "f": "𝓕", "g": "𝓖", "h": "𝓗", "i": "𝓘", "j": "𝓙", "k": "𝓚", "l": "𝓛", "m": "𝓜", "n": "𝓝", "o": "𝓞", "p": "𝓟", "q": "𝓠", "r": "𝓡", "s": "𝓢", "t": "𝓣", "u": "𝓤", "v": "𝓥", "w": "𝓦", "x": "𝓨", "y": "𝓩", "z": "𝓩"},
   smallcaps: {"a": "ᴀ", "b": "ʙ", "c": "ᴄ", "d": "ᴅ", "e": "ᴇ", "f": "ғ", "g": "ɢ", "h": "ʜ", "i": "ɪ", "j": "ᴊ", "k": "ᴋ", "l": "ʟ", "m": "ᴍ", "n": "ɴ", "o": "ᴏ", "p": "ᴘ", "q": "Q", "r": "ʀ", "s": "s", "t": "ᴛ", "u": "ᴜ", "v": "ᴠ", "w": "ᴡ", "x": "x", "y": "ʏ", "z": "ᴢ"},
  outline: {"a": "𝗮", "b": "𝗯", "c": "𝗰", "d": "𝗱", "e": "𝗲", "f": "𝗳", "g": "𝗴", "h": "𝗵", "i": "𝗶", "j": "𝗷", "k": "𝗸", "l": "𝗹", "m": "𝗺", "n": "𝗻", "o": "𝗼", "p": "𝗽", "q": "𝗾", "r": "𝗿", "s": "𝘀", "t": "𝘁", "u": "𝘂", "v": "𝘃", "w": "𝘄", "x": "𝘅", "y": "𝘆", "z": "𝘇"},
  shadow: {"a": "𝑎", "b": "𝑏", "c": "𝑐", "d": "𝑑", "e": "𝑒", "f": "𝑓", "g": "𝑔", "h": "ℎ", "i": "𝑖", "j": "𝑗", "k": "𝑘", "l": "𝑙", "m": "𝑚", "n": "𝑛", "o": "𝑜", "p": "𝑝", "q": "𝑞", "r": "𝑟", "s": "𝑠", "t": "𝑡", "u": "𝑢", "v": "𝑣", "w": "𝑤", "x": "𝑥", "y": "𝑦", "z": "𝑧"}
};

// Configuration
const config = {
  maxInputLength: 1000,
  preserveWhitespace: true,
  autoTransform: true
};

/**
 * Transform input text using the specified character set
 * @param {string} input - The input text to transform
 * @param {string} style - The style to apply (fancy, bold, or italic)
 * @returns {string} The transformed text
 */
function transformText(input, style) {
  if (input.length > config.maxInputLength) {
    console.warn(`Input exceeds maximum length of ${config.maxInputLength} characters. Truncating.`);
    input = input.slice(0, config.maxInputLength);
  }

  const charSet = characterSets[style] || characterSets.fancy;
  let output = '';

  for (let char of input) {
    const lowerChar = char.toLowerCase();
    if (charSet[lowerChar]) {
      output += charSet[lowerChar];
    } else if (config.preserveWhitespace || char.trim()) {
      output += char;
    }
  }

  return output;
}

/**
 * Get available transformation styles
 * @returns {string[]} Array of available styles
 */
function getAvailableStyles() {
  return Object.keys(characterSets);
}

/**
 * Update configuration settings
 * @param {Object} newConfig - New configuration settings
 */
function updateConfig(newConfig) {
  Object.assign(config, newConfig);
}

// Export functions for use in other modules
export { transformText, getAvailableStyles, updateConfig };