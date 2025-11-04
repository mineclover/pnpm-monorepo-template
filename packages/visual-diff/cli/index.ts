import * as fs from 'node:fs'
import * as path from 'node:path'
import { Command } from 'commander'
import { compareImages } from '../src/visual-diff.js'

const program = new Command()

program.name('visual-diff').description('CLI tool for comparing images and generating visual diffs').version('0.1.0')

// Helper functions
const parseColor = (colorStr: string) => {
  const [r, g, b] = colorStr.split(',').map(Number)
  return { r, g, b }
}

const compareAndSave = async (
  imageA: Buffer,
  imageB: Buffer,
  options: {
    threshold: number
    colorA: string
    colorB: string
    colorThreshold: string
    onlyShowDifferences: boolean
    output: string
  },
) => {
  const color1 = parseColor(options.colorA)
  const color2 = parseColor(options.colorB)

  console.log('Comparing images...')
  const result = await compareImages(imageA, imageB, {
    threshold: parseFloat(options.threshold.toString()),
    color1,
    color2,
    onlyShowDifferences: options.onlyShowDifferences,
    colorThreshold: parseInt(options.colorThreshold, 10),
  })

  const outputPath = path.resolve(options.output)
  await fs.promises.writeFile(outputPath, result.diffImageBuffer)

  // Create text report
  const reportText = `=== Comparison Results ===
Match: ${result.isMatch ? 'YES' : 'NO'}
Difference: ${result.differencePercentage.toFixed(2)}%
Different Pixels: ${result.differentPixelCount}
Colored Area: ${result.coloredAreaPercentage.toFixed(2)}%
Dimensions: ${result.dimensions.width}x${result.dimensions.height}
Output Image: ${outputPath}
`

  // Save text report
  const textOutputPath = outputPath.replace(/\.(png|jpg|jpeg)$/i, '.txt')
  await fs.promises.writeFile(textOutputPath, reportText, 'utf-8')

  console.log(`\n${reportText}`)
  console.log(`Report saved to: ${textOutputPath}`)
}

// compare command - full comparison with grayscale background
program
  .command('compare')
  .description('Compare two images and generate a full diff image with grayscale background')
  .requiredOption('-a, --image-a <path>', 'Path to the first image (reference)')
  .requiredOption('-b, --image-b <path>', 'Path to the second image (screenshot)')
  .option('-o, --output <path>', 'Output path for diff image', './diff-output.png')
  .option('-t, --threshold <number>', 'Threshold for considering images as matching (0-100)', '0')
  .option('--color-a <r,g,b>', 'RGB color for image A (e.g., "255,0,0")', '255,0,0')
  .option('--color-b <r,g,b>', 'RGB color for image B (e.g., "0,255,0")', '0,255,0')
  .option('--color-threshold <number>', 'Minimum RGB threshold for colored pixels (0-255)', '30')
  .action(async (options) => {
    try {
      const imageA = fs.readFileSync(path.resolve(options.imageA))
      const imageB = fs.readFileSync(path.resolve(options.imageB))

      await compareAndSave(imageA, imageB, {
        ...options,
        onlyShowDifferences: false,
      })
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

// compare-diff command - only show differences
program
  .command('compare-diff')
  .description('Compare two images and generate a diff image showing only the differences')
  .requiredOption('-a, --image-a <path>', 'Path to the first image (reference)')
  .requiredOption('-b, --image-b <path>', 'Path to the second image (screenshot)')
  .option('-o, --output <path>', 'Output path for diff image', './diff-only-output.png')
  .option('-t, --threshold <number>', 'Threshold for considering images as matching (0-100)', '0')
  .option('--color-a <r,g,b>', 'RGB color for image A (e.g., "255,0,0")', '255,0,0')
  .option('--color-b <r,g,b>', 'RGB color for image B (e.g., "0,255,0")', '0,255,0')
  .option('--color-threshold <number>', 'Minimum RGB threshold for colored pixels (0-255)', '30')
  .action(async (options) => {
    try {
      const imageA = fs.readFileSync(path.resolve(options.imageA))
      const imageB = fs.readFileSync(path.resolve(options.imageB))

      await compareAndSave(imageA, imageB, {
        ...options,
        onlyShowDifferences: true,
      })
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

program.parse()
