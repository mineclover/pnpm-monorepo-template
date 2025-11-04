# Testing Conventions

## Test Result Storage

All test results should be stored in `__test_results__/` directory with the folder name matching the test filename (without `.test.ts` extension).

**Structure:**
```
__test_results__/
  └── {test-filename}/
      ├── result files...
      └── output files...
```

**Example:**
- Test file: `sample-images.test.ts`
- Result directory: `__test_results__/sample-images/`

**Implementation:**
```typescript
const testFileName = path.basename(__filename, '.test.ts')
const testResultsDir = path.join(__dirname, '../__test_results__', testFileName)
```

**Note:** The `__test_results__/` directory is git-ignored and should contain generated test outputs like images, JSON reports, and other artifacts.
