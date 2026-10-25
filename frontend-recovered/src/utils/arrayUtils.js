/**
 * Splits an array into chunks of the specified size
 * @param {Array} array - The array to chunk
 * @param {number} size - The size of each chunk
 * @returns {Array} Array of arrays where each sub-array contains up to 'size' elements
 */
export const chunkArray = (array, size) => {
  if (!Array.isArray(array) || size <= 0) {
    return [];
  }
  
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  
  return chunks;
};
