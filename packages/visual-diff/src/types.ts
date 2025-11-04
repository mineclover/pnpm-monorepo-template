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

  /**
   * Percentage of colored (different) pixels in the output image (0-100)
   * This represents how much of the final diff image contains colored differences
   * Same as differencePercentage, but explicitly represents colored area coverage
   */
  coloredAreaPercentage: number
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

  /**
   * If true, only show colored differences (remove grayscale matching pixels)
   * Default: false
   */
  onlyShowDifferences?: boolean

  /**
   * Minimum RGB threshold to consider a pixel as "colored" (0-255)
   * Pixels with all RGB values below this threshold are considered as "not colored"
   * Used for calculating coloredAreaPercentage
   * Default: 30
   */
  colorThreshold?: number
}

/**
 * RGB color representation
 */
export interface RGBColor {
  r: number
  g: number
  b: number
}
