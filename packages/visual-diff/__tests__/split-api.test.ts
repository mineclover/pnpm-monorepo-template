import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import { compareMonochromeImages, convertToMonochromeA, convertToMonochromeB } from '../src/visual-diff'

describe('Split API', () => {
  // Helper function to create a solid color image
  async function createSolidColorImage(
    width: number,
    height: number,
    r: number,
    g: number,
    b: number,
  ): Promise<Buffer> {
    const pixels = Buffer.alloc(width * height * 3)

    for (let i = 0; i < pixels.length; i += 3) {
      pixels[i] = r
      pixels[i + 1] = g
      pixels[i + 2] = b
    }

    return sharp(pixels, {
      raw: {
        width,
        height,
        channels: 3,
      },
    })
      .png()
      .toBuffer()
  }

  describe('convertToMonochromeA', () => {
    it('should convert image to monochrome A format', async () => {
      const image = await createSolidColorImage(50, 50, 255, 255, 255)
      const monochromeA = await convertToMonochromeA(image)

      expect(monochromeA).toHaveProperty('grayscaleBuffer')
      expect(monochromeA).toHaveProperty('color')
      expect(monochromeA).toHaveProperty('width', 50)
      expect(monochromeA).toHaveProperty('height', 50)
      expect(monochromeA.grayscaleBuffer).toBeInstanceOf(Buffer)
      expect(monochromeA.grayscaleBuffer.length).toBe(50 * 50)
      expect(monochromeA.color).toEqual({ r: 255, g: 0, b: 0 }) // Default red
    })

    it('should accept custom color', async () => {
      const image = await createSolidColorImage(50, 50, 255, 255, 255)
      const customColor = { r: 0, g: 0, b: 255 }
      const monochromeA = await convertToMonochromeA(image, customColor)

      expect(monochromeA.color).toEqual(customColor)
    })
  })

  describe('convertToMonochromeB', () => {
    it('should convert image to monochrome B format', async () => {
      const image = await createSolidColorImage(50, 50, 0, 0, 0)
      const monochromeB = await convertToMonochromeB(image)

      expect(monochromeB).toHaveProperty('grayscaleBuffer')
      expect(monochromeB).toHaveProperty('color')
      expect(monochromeB).toHaveProperty('width', 50)
      expect(monochromeB).toHaveProperty('height', 50)
      expect(monochromeB.grayscaleBuffer).toBeInstanceOf(Buffer)
      expect(monochromeB.grayscaleBuffer.length).toBe(50 * 50)
      expect(monochromeB.color).toEqual({ r: 0, g: 255, b: 0 }) // Default green
    })

    it('should accept custom color', async () => {
      const image = await createSolidColorImage(50, 50, 0, 0, 0)
      const customColor = { r: 255, g: 255, b: 0 }
      const monochromeB = await convertToMonochromeB(image, customColor)

      expect(monochromeB.color).toEqual(customColor)
    })
  })

  describe('compareMonochromeImages', () => {
    it('should compare identical monochrome images', async () => {
      const image1 = await createSolidColorImage(100, 100, 255, 255, 255)
      const image2 = await createSolidColorImage(100, 100, 255, 255, 255)

      const monochromeA = await convertToMonochromeA(image1)
      const monochromeB = await convertToMonochromeB(image2)

      const result = await compareMonochromeImages(monochromeA, monochromeB)

      expect(result.isMatch).toBe(true)
      expect(result.differencePercentage).toBe(0)
      expect(result.differentPixelCount).toBe(0)
    })

    it('should detect differences in monochrome images', async () => {
      const image1 = await createSolidColorImage(100, 100, 255, 255, 255)
      const image2 = await createSolidColorImage(100, 100, 0, 0, 0)

      const monochromeA = await convertToMonochromeA(image1)
      const monochromeB = await convertToMonochromeB(image2)

      const result = await compareMonochromeImages(monochromeA, monochromeB)

      expect(result.isMatch).toBe(false)
      expect(result.differencePercentage).toBe(100)
      expect(result.differentPixelCount).toBe(100 * 100)
    })

    it('should respect threshold parameter', async () => {
      const image1 = await createSolidColorImage(100, 100, 255, 255, 255)
      const image2 = await createSolidColorImage(100, 100, 254, 254, 254)

      const monochromeA = await convertToMonochromeA(image1)
      const monochromeB = await convertToMonochromeB(image2)

      // Without threshold, should not match
      const result1 = await compareMonochromeImages(monochromeA, monochromeB, 0)
      expect(result1.isMatch).toBe(false)

      // With high threshold, should match
      const result2 = await compareMonochromeImages(monochromeA, monochromeB, 100)
      expect(result2.isMatch).toBe(true)
    })

    it('should throw error for mismatched dimensions', async () => {
      const image1 = await createSolidColorImage(100, 100, 255, 255, 255)
      const image2 = await createSolidColorImage(50, 50, 255, 255, 255)

      const monochromeA = await convertToMonochromeA(image1)
      const monochromeB = await convertToMonochromeB(image2)

      await expect(compareMonochromeImages(monochromeA, monochromeB)).rejects.toThrow('Image dimensions must match')
    })
  })

  describe('Full workflow', () => {
    it('should work end-to-end with split API', async () => {
      // Create reference image
      const referenceImage = await createSolidColorImage(100, 100, 200, 200, 200)

      // Convert to monochrome A (can be done once and cached)
      const monochromeA = await convertToMonochromeA(referenceImage)

      // Test multiple screenshots against the same reference
      const screenshot1 = await createSolidColorImage(100, 100, 200, 200, 200)
      const screenshot2 = await createSolidColorImage(100, 100, 100, 100, 100)

      const monochromeB1 = await convertToMonochromeB(screenshot1)
      const monochromeB2 = await convertToMonochromeB(screenshot2)

      const result1 = await compareMonochromeImages(monochromeA, monochromeB1)
      const result2 = await compareMonochromeImages(monochromeA, monochromeB2)

      expect(result1.isMatch).toBe(true)
      expect(result2.isMatch).toBe(false)
    })
  })
})
