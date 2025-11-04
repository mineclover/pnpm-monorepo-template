import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import { compareImages, saveDiffImage } from '../src/visual-diff'

describe('visual-diff', () => {
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

  // Helper function to create an image with a rectangle
  async function createImageWithRectangle(
    width: number,
    height: number,
    rectX: number,
    rectY: number,
    rectWidth: number,
    rectHeight: number,
    bgColor: { r: number; g: number; b: number },
    rectColor: { r: number; g: number; b: number },
  ): Promise<Buffer> {
    const pixels = Buffer.alloc(width * height * 3)

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 3
        const isInRect = x >= rectX && x < rectX + rectWidth && y >= rectY && y < rectY + rectHeight

        const color = isInRect ? rectColor : bgColor

        pixels[idx] = color.r
        pixels[idx + 1] = color.g
        pixels[idx + 2] = color.b
      }
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

  describe('compareImages', () => {
    it('should return isMatch: true when images are identical', async () => {
      const image1 = await createSolidColorImage(100, 100, 255, 255, 255)
      const image2 = await createSolidColorImage(100, 100, 255, 255, 255)

      const result = await compareImages(image1, image2)

      expect(result.isMatch).toBe(true)
      expect(result.differencePercentage).toBe(0)
      expect(result.differentPixelCount).toBe(0)
      expect(result.dimensions).toEqual({ width: 100, height: 100 })
    })

    it('should return isMatch: false when images differ', async () => {
      const image1 = await createSolidColorImage(100, 100, 255, 255, 255)
      const image2 = await createSolidColorImage(100, 100, 0, 0, 0)

      const result = await compareImages(image1, image2)

      expect(result.isMatch).toBe(false)
      expect(result.differencePercentage).toBeGreaterThan(0)
      expect(result.differentPixelCount).toBeGreaterThan(0)
    })

    it('should detect partial differences correctly', async () => {
      // Create two images where only a small rectangle differs
      const bgColor = { r: 255, g: 255, b: 255 }
      const rect1Color = { r: 100, g: 100, b: 100 }
      const rect2Color = { r: 150, g: 150, b: 150 }

      const image1 = await createImageWithRectangle(100, 100, 25, 25, 50, 50, bgColor, rect1Color)

      const image2 = await createImageWithRectangle(100, 100, 25, 25, 50, 50, bgColor, rect2Color)

      const result = await compareImages(image1, image2)

      expect(result.isMatch).toBe(false)
      expect(result.differencePercentage).toBeGreaterThan(0)
      expect(result.differencePercentage).toBeLessThan(100)
      // The rectangle is 50x50 = 2500 pixels out of 100x100 = 10000 total
      expect(result.differentPixelCount).toBeLessThanOrEqual(2500)
    })

    it('should respect threshold option', async () => {
      const image1 = await createSolidColorImage(100, 100, 255, 255, 255)
      // Create an image that's slightly different
      const image2 = await createImageWithRectangle(
        100,
        100,
        0,
        0,
        1,
        1,
        { r: 255, g: 255, b: 255 },
        { r: 0, g: 0, b: 0 },
      )

      // Without threshold, should not match
      const result1 = await compareImages(image1, image2, { threshold: 0 })
      expect(result1.isMatch).toBe(false)

      // With high threshold, should match
      const result2 = await compareImages(image1, image2, { threshold: 10 })
      expect(result2.isMatch).toBe(true)
    })

    it('should throw error when image dimensions differ', async () => {
      const image1 = await createSolidColorImage(100, 100, 255, 255, 255)
      const image2 = await createSolidColorImage(50, 50, 255, 255, 255)

      await expect(compareImages(image1, image2)).rejects.toThrow('Image dimensions must match')
    })

    it('should return a valid diff image buffer', async () => {
      const image1 = await createSolidColorImage(100, 100, 255, 255, 255)
      const image2 = await createSolidColorImage(100, 100, 0, 0, 0)

      const result = await compareImages(image1, image2)

      expect(result.diffImageBuffer).toBeInstanceOf(Buffer)
      expect(result.diffImageBuffer.length).toBeGreaterThan(0)

      // Verify the buffer is a valid image
      const metadata = await sharp(result.diffImageBuffer).metadata()
      expect(metadata.width).toBe(100)
      expect(metadata.height).toBe(100)
    })
  })

  describe('saveDiffImage', () => {
    it('should save diff image to file', async () => {
      const image1 = await createSolidColorImage(50, 50, 255, 255, 255)
      const image2 = await createSolidColorImage(50, 50, 0, 0, 0)

      const result = await compareImages(image1, image2)

      const outputPath = '/tmp/test-diff.png'
      await saveDiffImage(result, outputPath)

      // Verify file was created and is readable
      const savedImage = await sharp(outputPath).metadata()
      expect(savedImage.width).toBe(50)
      expect(savedImage.height).toBe(50)
    })
  })
})
