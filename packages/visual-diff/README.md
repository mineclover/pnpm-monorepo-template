# @template/visual-diff

Visual regression testing utility for comparing screenshots using monochrome conversion technique.

## Overview

This package provides a visual comparison tool that uses a unique monochrome overlay approach to detect differences between images. When two images are compared:

1. Both images are converted to monochrome using contrasting colors (default: red for reference, green for screenshot)
2. The monochrome images are overlayed
3. If the images match perfectly, the result appears as grayscale
4. If differences exist, the contrasting colors remain visible, making layout shifts immediately apparent

## Installation

```bash
pnpm add @template/visual-diff
```

## CLI Usage

The package provides a command-line interface for quick image comparisons.

### Commands

#### `compare`
Compare two images and generate a full diff image with grayscale background.

```bash
visual-diff compare -a <reference-image> -b <screenshot-image> [options]
```

**Options:**
- `-a, --image-a <path>` - Path to the first image (reference) [required]
- `-b, --image-b <path>` - Path to the second image (screenshot) [required]
- `-o, --output <path>` - Output path for diff image (default: `./diff-output.png`)
- `-t, --threshold <number>` - Threshold for considering images as matching (0-100) (default: `0`)
- `--color-a <r,g,b>` - RGB color for image A (default: `255,0,0`)
- `--color-b <r,g,b>` - RGB color for image B (default: `0,255,0`)
- `--color-threshold <number>` - Minimum RGB threshold for colored pixels (0-255) (default: `30`)

**Example:**
```bash
visual-diff compare -a reference.png -b screenshot.png -o diff.png
```

#### `compare-diff`
Compare two images and generate a diff image showing only the differences (no grayscale background).

```bash
visual-diff compare-diff -a <reference-image> -b <screenshot-image> [options]
```

**Options:**
Same as `compare` command.

**Example:**
```bash
visual-diff compare-diff -a reference.png -b screenshot.png -o diff-only.png
```

### Output Files

Both commands generate two output files:
- **Image file** (`.png`) - Visual diff image
- **Text file** (`.txt`) - Comparison results report

**Text report includes:**
- Match result (YES/NO)
- Difference percentage
- Different pixel count
- Colored area percentage
- Image dimensions
- Output image path

### CLI Examples

**Basic comparison:**
```bash
visual-diff compare -a samples/A.png -b samples/B.png
# Outputs: diff-output.png, diff-output.txt
```

**Custom output path:**
```bash
visual-diff compare -a ref.png -b test.png -o results/my-diff.png
# Outputs: results/my-diff.png, results/my-diff.txt
```

**Only show differences:**
```bash
visual-diff compare-diff -a ref.png -b test.png -o diff-only.png
# Outputs: diff-only.png, diff-only.txt
```

**With custom colors:**
```bash
visual-diff compare -a ref.png -b test.png --color-a 0,0,255 --color-b 255,255,0
# Blue for reference, yellow for screenshot
```

**With threshold:**
```bash
visual-diff compare -a ref.png -b test.png -t 0.5
# Allow up to 0.5% difference
```

## Programmatic Usage

### Simple API (All-in-One)

```typescript
import { compareImages } from '@template/visual-diff'
import { readFileSync } from 'fs'

const referenceImage = readFileSync('./expected.png')
const screenshotImage = readFileSync('./actual.png')

const result = await compareImages(referenceImage, screenshotImage)

console.log('Match:', result.isMatch)
console.log('Difference:', result.differencePercentage + '%')
console.log('Different pixels:', result.differentPixelCount)
```

### Split API (3 Separate Functions)

For better performance when comparing multiple screenshots against the same reference, use the split API:

```typescript
import {
  convertToMonochromeA,
  convertToMonochromeB,
  compareMonochromeImages,
} from '@template/visual-diff'

// Step 1: Convert reference image once (cache this!)
const referenceImage = readFileSync('./expected.png')
const monochromeA = await convertToMonochromeA(referenceImage)

// Step 2: Convert each screenshot
const screenshot1 = readFileSync('./actual1.png')
const monochromeB1 = await convertToMonochromeB(screenshot1)

const screenshot2 = readFileSync('./actual2.png')
const monochromeB2 = await convertToMonochromeB(screenshot2)

// Step 3: Compare against the cached reference
const result1 = await compareMonochromeImages(monochromeA, monochromeB1)
const result2 = await compareMonochromeImages(monochromeA, monochromeB2)
```

**Benefits of Split API:**
- Convert reference image once and reuse it for multiple comparisons
- Better performance for batch testing
- More flexible workflow

### With Custom Options

```typescript
import { compareImages } from '@template/visual-diff'

const result = await compareImages(referenceImage, screenshotImage, {
  // Allow up to 1% difference
  threshold: 1,

  // Custom monochrome colors
  color1: { r: 255, g: 0, b: 0 },    // Red for reference
  color2: { r: 0, g: 255, b: 0 },    // Green for screenshot
})
```

### Custom Colors with Split API

```typescript
import { convertToMonochromeA, convertToMonochromeB } from '@template/visual-diff'

// Use custom colors
const monochromeA = await convertToMonochromeA(referenceImage, {
  r: 0,
  g: 0,
  b: 255, // Blue
})

const monochromeB = await convertToMonochromeB(screenshotImage, {
  r: 255,
  g: 255,
  b: 0, // Yellow
})

const result = await compareMonochromeImages(monochromeA, monochromeB, 0.5)
```

### Saving Diff Images

```typescript
import { compareImages, saveDiffImage } from '@template/visual-diff'

const result = await compareImages(referenceImage, screenshotImage)

// Save the diff image showing only the differences
await saveDiffImage(result, './diff-output.png')
```

### Using with Vitest Browser Mode

```typescript
import { test, expect } from 'vitest'
import { compareImages } from '@template/visual-diff'

test('visual regression test', async ({ page }) => {
  await page.goto('http://localhost:3000')

  const screenshot = await page.screenshot()
  const reference = await readFile('./snapshots/homepage.png')

  const result = await compareImages(reference, screenshot, {
    threshold: 0.5, // Allow 0.5% difference
  })

  expect(result.isMatch).toBe(true)

  // Save diff image on failure
  if (!result.isMatch) {
    await saveDiffImage(result, `./diffs/homepage-${Date.now()}.png`)
  }
})
```

## API

### Split API Functions

#### `convertToMonochromeA(imageBuffer, color?)`

Converts a reference image (A) to monochrome format.

**Parameters:**
- `imageBuffer: Buffer` - Input image buffer
- `color?: RGBColor` - Optional monochrome color (default: red `{r: 255, g: 0, b: 0}`)

**Returns:** `Promise<MonochromeImage>`

#### `convertToMonochromeB(imageBuffer, color?)`

Converts a screenshot image (B) to monochrome format.

**Parameters:**
- `imageBuffer: Buffer` - Input image buffer
- `color?: RGBColor` - Optional monochrome color (default: green `{r: 0, g: 255, b: 0}`)

**Returns:** `Promise<MonochromeImage>`

#### `compareMonochromeImages(monochromeA, monochromeB, threshold?)`

Compares two monochrome images and generates a diff.

**Parameters:**
- `monochromeA: MonochromeImage` - Reference monochrome image (from `convertToMonochromeA`)
- `monochromeB: MonochromeImage` - Screenshot monochrome image (from `convertToMonochromeB`)
- `threshold?: number` - Optional threshold percentage (0-100, default: 0)

**Returns:** `Promise<VisualDiffResult>`

### Convenience Functions

#### `compareImages(referenceImage, screenshotImage, options?)`

Compares two images in one step (internally uses the split API).

**Parameters:**
- `referenceImage: Buffer` - Expected/reference image
- `screenshotImage: Buffer` - Actual screenshot to compare
- `options?: VisualDiffOptions` - Optional comparison settings

**Returns:** `Promise<VisualDiffResult>`

#### `saveDiffImage(result, outputPath)`

Saves the diff image from a comparison result to a file.

**Parameters:**
- `result: VisualDiffResult` - Result from compareImages or compareMonochromeImages
- `outputPath: string` - Path where the diff image will be saved

**Returns:** `Promise<void>`

## Types

### `MonochromeImage`

```typescript
interface MonochromeImage {
  grayscaleBuffer: Buffer  // Grayscale buffer (single channel, 8-bit per pixel)
  color: RGBColor          // Color to be used for this monochrome image
  width: number            // Image width in pixels
  height: number           // Image height in pixels
}
```

### `VisualDiffResult`

```typescript
interface VisualDiffResult {
  isMatch: boolean                // Whether images match within threshold
  differencePercentage: number    // Percentage of different pixels (0-100)
  differentPixelCount: number     // Total number of different pixels
  diffImageBuffer: Buffer         // PNG buffer of the diff image
  dimensions: {
    width: number
    height: number
  }
}
```

### `VisualDiffOptions`

```typescript
interface VisualDiffOptions {
  threshold?: number        // Match threshold in percentage (0-100), default: 0
  color1?: RGBColor        // Monochrome color for reference, default: red
  color2?: RGBColor        // Monochrome color for screenshot, default: green
}
```

### `RGBColor`

```typescript
interface RGBColor {
  r: number  // Red channel (0-255)
  g: number  // Green channel (0-255)
  b: number  // Blue channel (0-255)
}
```

## How It Works

The visual comparison uses a monochrome overlay technique:

1. **Monochrome Conversion**: Each image is converted to grayscale, then tinted with a distinct color (red for reference, green for screenshot by default)

2. **Overlay**: The two monochrome images are overlayed pixel by pixel

3. **Difference Detection**:
   - Matching pixels appear as grayscale (since red + green at same intensity = gray)
   - Different pixels retain their distinct colors, making layout shifts visible
   - Only the different pixels are highlighted in the output

4. **Metrics**: The tool calculates both the percentage and absolute count of different pixels

This approach provides:
- Clear visual indication of where differences occur
- Quantitative metrics for automated testing
- Grayscale output when images match (confirming correctness)
- Colored output when images differ (highlighting problems)

## License

MIT
