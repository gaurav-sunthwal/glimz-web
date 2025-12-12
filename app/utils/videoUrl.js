// Helper function to create URL-safe slug from title
export const createSlug = (title) => {
    if (!title) return '';
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Helper function to create video URL with title slug and content_id as query parameter
export const createVideoUrl = (videoId, videoTitle) => {
    const titleSlug = createSlug(videoTitle);
    return titleSlug ? `/${titleSlug}?c=${videoId}` : `/?c=${videoId}`;
};
