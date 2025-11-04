import sharp from 'sharp'
import type { MonochromeImage, RGBColor, VisualDiffOptions, VisualDiffResult } from './types'

const DEFAULT_COLOR_A: RGBColor = { r: 255, g: 0, b: 0 } // Red
const DEFAULT_COLOR_B: RGBColor = { r: 0, g: 255, b: 0 } // Green

/**
 * Converts an image to grayscale monochrome data for reference (A) image
 * @param imageBuffer - Input image buffer
 * @param color - Optional monochrome color (default: red)
 * @returns Monochrome image data with grayscale buffer and metadata
 */
export async function convertToMonochromeA(
  imageBuffer: Buffer,
  color: RGBColor = DEFAULT_COLOR_A,
): Promise<MonochromeImage> {
  const img = sharp(imageBuffer)
  const metadata = await img.metadata()

  const width = metadata.width ?? 0
  const height = metadata.height ?? 0

  // Convert to grayscale
  const grayscaleBuffer = await img.grayscale().raw().toBuffer()

  return {
    grayscaleBuffer,
    color,
    width,
    height,
  }
}

/**
 * Converts an image to grayscale monochrome data for screenshot (B) image
 * @param imageBuffer - Input image buffer
 * @param color - Optional monochrome color (default: green)
 * @returns Monochrome image data with grayscale buffer and metadata
 */
export async function convertToMonochromeB(
  imageBuffer: Buffer,
  color: RGBColor = DEFAULT_COLOR_B,
): Promise<MonochromeImage> {
  const img = sharp(imageBuffer)
  const metadata = await img.metadata()

  const width = metadata.width ?? 0
  const height = metadata.height ?? 0

  // Convert to grayscale
  const grayscaleBuffer = await img.grayscale().raw().toBuffer()

  return {
    grayscaleBuffer,
    color,
    width,
    height,
  }
}

/**
 * Compares two monochrome images and generates a diff
 * @param monochromeA - Reference monochrome image (from convertToMonochromeA)
 * @param monochromeB - Screenshot monochrome image (from convertToMonochromeB)
 * @param threshold - Optional threshold percentage (0-100, default: 0)
 * @param onlyShowDifferences - If true, only show colored differences (default: false)
 * @param colorThreshold - Minimum RGB value to consider a pixel as colored (default: 30)
 * @returns Visual diff result including match status and diff image
 */
export async function compareMonochromeImages(
  monochromeA: MonochromeImage,
  monochromeB: MonochromeImage,
  threshold = 0,
  onlyShowDifferences = false,
  colorThreshold = 30,
): Promise<VisualDiffResult> {
  const { grayscaleBuffer: gray1, color: color1, width: width1, height: height1 } = monochromeA
  const { grayscaleBuffer: gray2, color: color2, width: width2, height: height2 } = monochromeB

  // Ensure images have the same dimensions
  if (width1 !== width2 || height1 !== height2) {
    throw new Error(`Image dimensions must match. Reference: ${width1}x${height1}, Screenshot: ${width2}x${height2}`)
  }

  const width = width1
  const height = height1

  // Compare grayscale images and create diff
  const overlayPixels = Buffer.alloc(width * height * 3)
  let differentPixelCount = 0

  for (let i = 0; i < gray1.length; i++) {
    const grayValue1 = gray1[i]
    const grayValue2 = gray2[i]
    const pixelIndex = i * 3

    // Check if grayscale values differ
    if (grayValue1 !== grayValue2) {
      differentPixelCount++

      // Apply monochrome colors to different pixels and overlay
      const intensity1 = grayValue1 / 255
      const intensity2 = grayValue2 / 255

      const r1 = Math.round(color1.r * intensity1)
      const g1 = Math.round(color1.g * intensity1)
      const b1 = Math.round(color1.b * intensity1)

      const r2 = Math.round(color2.r * intensity2)
      const g2 = Math.round(color2.g * intensity2)
      const b2 = Math.round(color2.b * intensity2)

      // Overlay the monochrome colors
      const finalR = Math.min(255, r1 + r2)
      const finalG = Math.min(255, g1 + g2)
      const finalB = Math.min(255, b1 + b2)

      overlayPixels[pixelIndex] = finalR
      overlayPixels[pixelIndex + 1] = finalG
      overlayPixels[pixelIndex + 2] = finalB
    } else {
      // For matching pixels
      if (onlyShowDifferences) {
        // Make matching pixels transparent/black
        overlayPixels[pixelIndex] = 0
        overlayPixels[pixelIndex + 1] = 0
        overlayPixels[pixelIndex + 2] = 0
      } else {
        // Create a grayscale representation
        overlayPixels[pixelIndex] = grayValue1
        overlayPixels[pixelIndex + 1] = grayValue1
        overlayPixels[pixelIndex + 2] = grayValue1
      }
    }
  }

  // Calculate difference percentage
  const totalPixels = width * height
  const differencePercentage = (differentPixelCount / totalPixels) * 100

  // Calculate colored area percentage: simply use differentPixelCount
  // This represents the actual area where differences exist
  const coloredAreaPercentage = differencePercentage

  // Create diff image buffer
  const diffImageBuffer = await sharp(overlayPixels, {
    raw: {
      width,
      height,
      channels: 3,
    },
  })
    .png()
    .toBuffer()

  return {
    isMatch: differencePercentage <= threshold,
    differencePercentage,
    differentPixelCount,
    diffImageBuffer,
    dimensions: { width, height },
    coloredAreaPercentage,
  }
}

/**
 * Compares two images using monochrome conversion and overlay (convenience function)
 * @param referenceImage - Expected/reference image buffer
 * @param screenshotImage - Actual screenshot buffer
 * @param options - Comparison options
 * @returns Visual diff result including match status and diff image
 */
export async function compareImages(
  referenceImage: Buffer,
  screenshotImage: Buffer,
  options: VisualDiffOptions = {},
): Promise<VisualDiffResult> {
  const {
    threshold = 0,
    color1 = DEFAULT_COLOR_A,
    color2 = DEFAULT_COLOR_B,
    onlyShowDifferences = false,
    colorThreshold = 30,
  } = options

  const monochromeA = await convertToMonochromeA(referenceImage, color1)
  const monochromeB = await convertToMonochromeB(screenshotImage, color2)

  return compareMonochromeImages(monochromeA, monochromeB, threshold, onlyShowDifferences, colorThreshold)
}

/**
 * Saves the diff image to a file
 * @param diffResult - Result from compareImages
 * @param outputPath - Path to save the diff image
 */
export async function saveDiffImage(diffResult: VisualDiffResult, outputPath: string): Promise<void> {
  await sharp(diffResult.diffImageBuffer).toFile(outputPath)
}
