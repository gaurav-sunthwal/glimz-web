// Utility functions for handling images and placeholders

export const getPlaceholderImage = (width: number, height: number, seed?: string | number): string => {
  const randomSeed = seed || Math.floor(Math.random() * 1000);
  return `https://picsum.photos/${width}/${height}?random=${randomSeed}`;
};

export const getThumbnailUrl = (videoId: string): string => {
  // Generate consistent thumbnail based on video ID
  const hash = videoId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const seed = Math.abs(hash) % 1000;
  return getPlaceholderImage(400, 600, seed);
};

export const getHeroImageUrl = (videoId: string): string => {
  // Generate consistent hero image based on video ID
  const hash = videoId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const seed = Math.abs(hash) % 1000;
  return getPlaceholderImage(1920, 1080, seed);
};

export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};