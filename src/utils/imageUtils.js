// Utility functions for handling images and placeholders

export const getPlaceholderImage = (width, height, seed) => {
  const randomSeed = seed || Math.floor(Math.random() * 1000);
  return `https://picsum.photos/${width}/${height}?random=${randomSeed}`;
};

export const getThumbnailUrl = (videoId) => {
  // Generate consistent thumbnail based on video ID
  const hash = videoId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const seed = Math.abs(hash) % 1000;
  return getPlaceholderImage(400, 600, seed);
};

export const getHeroImageUrl = (videoId) => {
  // Generate consistent hero image based on video ID
  const hash = videoId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const seed = Math.abs(hash) % 1000;
  return getPlaceholderImage(1920, 1080, seed);
};

export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};
