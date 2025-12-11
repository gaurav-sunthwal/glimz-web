/**
 * Format duration from seconds to human-readable timestamp
 * Supports multiple input formats and returns HH:MM:SS or MM:SS format
 * 
 * @param {number|string} duration - Duration in seconds or already formatted string
 * @returns {string} Formatted duration string (HH:MM:SS or MM:SS)
 */
export const formatDuration = (duration) => {
    // Handle null, undefined, or empty values
    if (!duration && duration !== 0) return "N/A";

    // If already in timestamp format (HH:MM:SS or MM:SS), return as is
    if (typeof duration === "string" && duration.includes(":")) {
        return duration;
    }

    // Convert to number if it's a string
    let totalSeconds;
    if (typeof duration === "string") {
        totalSeconds = parseInt(duration, 10);
    } else if (typeof duration === "number") {
        totalSeconds = Math.floor(duration);
    } else {
        return "N/A";
    }

    // Validate the number
    if (isNaN(totalSeconds) || totalSeconds < 0) {
        return "N/A";
    }

    // Calculate hours, minutes, and seconds
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Format with leading zeros
    const paddedMinutes = minutes.toString().padStart(2, "0");
    const paddedSeconds = seconds.toString().padStart(2, "0");

    // Return HH:MM:SS if hours > 0, otherwise MM:SS
    if (hours > 0) {
        const paddedHours = hours.toString().padStart(2, "0");
        return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
    }

    return `${minutes}:${paddedSeconds}`;
};

/**
 * Format duration to a more readable format (e.g., "2h 30m", "45m", "30s")
 * 
 * @param {number|string} duration - Duration in seconds
 * @returns {string} Human-readable duration
 */
export const formatDurationHumanReadable = (duration) => {
    if (!duration && duration !== 0) return "N/A";

    let totalSeconds;
    if (typeof duration === "string") {
        totalSeconds = parseInt(duration, 10);
    } else if (typeof duration === "number") {
        totalSeconds = Math.floor(duration);
    } else {
        return "N/A";
    }

    if (isNaN(totalSeconds) || totalSeconds < 0) {
        return "N/A";
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 && hours === 0) parts.push(`${seconds}s`);

    return parts.length > 0 ? parts.join(" ") : "0s";
};

/**
 * Convert timestamp string (HH:MM:SS or MM:SS) to seconds
 * 
 * @param {string} timestamp - Timestamp string
 * @returns {number} Total seconds
 */
export const timestampToSeconds = (timestamp) => {
    if (!timestamp || typeof timestamp !== "string") return 0;

    const parts = timestamp.split(":").map(part => parseInt(part, 10));

    if (parts.length === 3) {
        // HH:MM:SS
        const [hours, minutes, seconds] = parts;
        return hours * 3600 + minutes * 60 + seconds;
    } else if (parts.length === 2) {
        // MM:SS
        const [minutes, seconds] = parts;
        return minutes * 60 + seconds;
    }

    return 0;
};
