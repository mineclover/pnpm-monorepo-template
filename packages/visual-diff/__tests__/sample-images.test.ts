import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { compareImages, convertToMonochromeA, convertToMonochromeB, saveDiffImage } from '../src/visual-diff'

describe('Sample Images Comparison', () => {
  // Setup test result directory based on test filename
  const testFileName = path.basename(__filename, '.test.ts') // 'sample-images'
  const testResultsDir = path.join(__dirname, '../__test_results__', testFileName)

  // Ensure test results directory exists
  if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true })
  }

  it('should compare A.png and B.png with custom colors and output JSON results (with grayscale)', async () => {
    // Read sample images
    const imageAPath = path.join(__dirname, '../samples/A.png')
    const imageBPath = path.join(__dirname, '../samples/B.png')

    const imageABuffer = fs.readFileSync(imageAPath)
    const imageBBuffer = fs.readFileSync(imageBPath)

    // Convert images with custom colors
    // A.png -> Blue color (RGB: 0, 0, 255)
    const monochromeA = await convertToMonochromeA(imageABuffer, { r: 0, g: 0, b: 255 })

    // B.png -> Yellow color (RGB: 255, 255, 0)
    const monochromeB = await convertToMonochromeB(imageBBuffer, { r: 255, g: 255, b: 0 })

    // Compare images using the convenience function with custom colors
    const result = await compareImages(imageABuffer, imageBBuffer, {
      threshold: 0,
      color1: { r: 0, g: 0, b: 255 }, // Blue for A
      color2: { r: 255, g: 255, b: 0 }, // Yellow for B
    })

    // Save diff image
    const diffOutputPath = path.join(testResultsDir, 'diff-result.png')
    await saveDiffImage(result, diffOutputPath)

    // Create JSON output
    const jsonOutput = {
      comparison: {
        imageA: {
          path: imageAPath,
          dimensions: {
            width: monochromeA.width,
            height: monochromeA.height,
          },
          color: monochromeA.color,
        },
        imageB: {
          path: imageBPath,
          dimensions: {
            width: monochromeB.width,
            height: monochromeB.height,
          },
          color: monochromeB.color,
        },
      },
      result: {
        isMatch: result.isMatch,
        differencePercentage: result.differencePercentage,
        differentPixelCount: result.differentPixelCount,
        totalPixels: result.dimensions.width * result.dimensions.height,
        dimensions: result.dimensions,
        coloredAreaPercentage: result.coloredAreaPercentage,
      },
      output: {
        diffImage: diffOutputPath,
      },
      timestamp: new Date().toISOString(),
    }

    // Save JSON output
    const jsonOutputPath = path.join(testResultsDir, 'comparison-result.json')
    fs.writeFileSync(jsonOutputPath, JSON.stringify(jsonOutput, null, 2))

    // Log results to console
    console.log('\n=== Visual Diff Comparison Results ===')
    console.log(JSON.stringify(jsonOutput, null, 2))
    console.log('======================================\n')

    // Assertions
    expect(result.diffImageBuffer).toBeInstanceOf(Buffer)
    expect(result.diffImageBuffer.length).toBeGreaterThan(0)
    expect(result.dimensions.width).toBeGreaterThan(0)
    expect(result.dimensions.height).toBeGreaterThan(0)
    expect(fs.existsSync(diffOutputPath)).toBe(true)
    expect(fs.existsSync(jsonOutputPath)).toBe(true)
  })

  it('should compare A.png and B.png with only colored differences (no grayscale)', async () => {
    // Read sample images
    const imageAPath = path.join(__dirname, '../samples/A.png')
    const imageBPath = path.join(__dirname, '../samples/B.png')

    const imageABuffer = fs.readFileSync(imageAPath)
    const imageBBuffer = fs.readFileSync(imageBPath)

    // Convert images with custom colors
    // A.png -> Blue color (RGB: 0, 0, 255)
    const monochromeA = await convertToMonochromeA(imageABuffer, { r: 0, g: 0, b: 255 })

    // B.png -> Yellow color (RGB: 255, 255, 0)
    const monochromeB = await convertToMonochromeB(imageBBuffer, { r: 255, g: 255, b: 0 })

    // Compare images with onlyShowDifferences option enabled
    const result = await compareImages(imageABuffer, imageBBuffer, {
      threshold: 0,
      color1: { r: 0, g: 0, b: 255 }, // Blue for A
      color2: { r: 255, g: 255, b: 0 }, // Yellow for B
      onlyShowDifferences: true, // Only show colored differences
    })

    // Save diff image (only differences)
    const diffOutputPath = path.join(testResultsDir, 'diff-result-only-colors.png')
    await saveDiffImage(result, diffOutputPath)

    // Create JSON output
    const jsonOutput = {
      comparison: {
        imageA: {
          path: imageAPath,
          dimensions: {
            width: monochromeA.width,
            height: monochromeA.height,
          },
          color: monochromeA.color,
        },
        imageB: {
          path: imageBPath,
          dimensions: {
            width: monochromeB.width,
            height: monochromeB.height,
          },
          color: monochromeB.color,
        },
      },
      result: {
        isMatch: result.isMatch,
        differencePercentage: result.differencePercentage,
        differentPixelCount: result.differentPixelCount,
        totalPixels: result.dimensions.width * result.dimensions.height,
        dimensions: result.dimensions,
        coloredAreaPercentage: result.coloredAreaPercentage,
      },
      output: {
        diffImage: diffOutputPath,
      },
      options: {
        onlyShowDifferences: true,
      },
      timestamp: new Date().toISOString(),
    }

    // Save JSON output
    const jsonOutputPath = path.join(testResultsDir, 'comparison-result-only-colors.json')
    fs.writeFileSync(jsonOutputPath, JSON.stringify(jsonOutput, null, 2))

    // Log results to console
    console.log('\n=== Visual Diff Comparison Results (Only Colors) ===')
    console.log(JSON.stringify(jsonOutput, null, 2))
    console.log('====================================================\n')

    // Assertions
    expect(result.diffImageBuffer).toBeInstanceOf(Buffer)
    expect(result.diffImageBuffer.length).toBeGreaterThan(0)
    expect(result.dimensions.width).toBeGreaterThan(0)
    expect(result.dimensions.height).toBeGreaterThan(0)
    expect(fs.existsSync(diffOutputPath)).toBe(true)
    expect(fs.existsSync(jsonOutputPath)).toBe(true)
  })
})
