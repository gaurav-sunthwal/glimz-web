// Utility to update video data with consistent placeholder images
import videosData from '@/data/videos.json';

export const getVideoWithPlaceholders = () => {
  return videosData.map((video, index) => ({
    ...video,
    thumbnail: `https://picsum.photos/400/600?random=${index + 1}`,
    heroImage: `https://picsum.photos/1920/1080?random=${index + 1}`
  }));
};

export default getVideoWithPlaceholders;
