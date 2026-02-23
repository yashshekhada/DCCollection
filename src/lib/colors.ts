export const STANDARD_COLORS = [
    { name: 'Black', hex: '#000000' },
    { name: 'Orange', hex: '#FFA500' },
    { name: 'Skin/Cream', hex: '#F5DEB3' },
    { name: 'Blue', hex: '#0000FF' },
    { name: 'Gray', hex: '#808080' },
    { name: 'Green', hex: '#008000' },
    { name: 'Maroon', hex: '#800000' }
];

const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

// Calculates the Euclidean distance between two RGB colors
const colorDistance = (color1: { r: number, g: number, b: number }, color2: { r: number, g: number, b: number }) => {
    return Math.sqrt(
        Math.pow(color1.r - color2.r, 2) +
        Math.pow(color1.g - color2.g, 2) +
        Math.pow(color1.b - color2.b, 2)
    );
};

export const getClosestColorName = (hex: string): string => {
    const rgb = hexToRgb(hex);
    if (!rgb) return "";

    let minDistance = Infinity;
    let closestName = "";

    for (const color of STANDARD_COLORS) {
        const standardRgb = hexToRgb(color.hex);
        if (standardRgb) {
            const dist = colorDistance(rgb, standardRgb);
            if (dist < minDistance) {
                minDistance = dist;
                closestName = color.name;
            }
        }
    }

    // Only return if it's reasonably close, otherwise let them name it themselves or return the closest anyway
    return closestName;
};
