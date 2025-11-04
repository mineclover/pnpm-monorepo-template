/**
 * Monochrome image data with grayscale buffer and color information
 */
export interface MonochromeImage {
  /**
   * Grayscale buffer (single channel, 8-bit per pixel)
   */
  grayscaleBuffer: Buffer

  /**
   * Color to be used for this monochrome image in comparison
   */
  color: RGBColor

  /**
   * Image width in pixels
   */
  width: number

  /**
   * Image height in pixels
   */
  height: number
}

/**
 * Result of a visual comparison between two images
 */
export interface VisualDiffResult {
  /**
   * Whether the images match (true) or have differences (false)
   */
  isMatch: boolean

  /**
   * Percentage of different pixels (0-100)
   */
  differencePercentage: number

  /**
   * Total number of pixels that differ
   */
  differentPixelCount: number

  /**
   * Buffer containing the diff image (only different pixels highlighted)
   * Returns grayscale if images match, colored diff if they don't match
   */
  diffImageBuffer: Buffer

  /**
   * Dimensions of the compared images
   */
  dimensions: {
    width: number
    height: number
  }
}

/**
 * Options for visual comparison
 */
export interface VisualDiffOptions {
  /**
   * Threshold for considering images as matching (0-100)
   * Default: 0 (exact match required)
   */
  threshold?: number

  /**
   * First monochrome color (for reference image)
   * Default: { r: 255, g: 0, b: 0 } (red)
   */
  color1?: RGBColor

  /**
   * Second monochrome color (for screenshot image)
   * Default: { r: 0, g: 255, b: 0 } (green)
   */
  color2?: RGBColor
}

/**
 * RGB color representation
 */
export interface RGBColor {
  r: number
  g: number
  b: number
}
