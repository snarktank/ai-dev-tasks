# TypeScript/JavaScript Configuration

## File Extensions

**Source Files:**
- `.ts` - TypeScript source files
- `.tsx` - TypeScript with JSX (React components)
- `.js` - JavaScript source files
- `.jsx` - JavaScript with JSX

**Test Files:**
- `.test.ts` - TypeScript unit tests
- `.test.tsx` - TypeScript component tests
- `.test.js` - JavaScript unit tests
- `.test.jsx` - JavaScript component tests
- `.spec.ts` - Alternative test naming convention
- `.spec.js` - Alternative test naming convention

## Testing

**Primary Test Framework:** Jest

**Test Command:**
```bash
npx jest [optional/path/to/test/file]
```

**Common Options:**
- `npx jest --watch` - Run tests in watch mode
- `npx jest --coverage` - Generate coverage report
- `npx jest --verbose` - Verbose output
- `npx jest path/to/specific.test.ts` - Run specific test file

**Alternative Frameworks:**
- Vitest: `npx vitest`
- Mocha: `npx mocha`

## File Organization

**Test Location:**
- **Co-located** (recommended): Place test files alongside the source files they test
  ```
  src/
    components/
      Button.tsx
      Button.test.tsx
  ```
- **Separate directory**: Tests in `__tests__/` directory
  ```
  src/
    components/
      Button.tsx
      __tests__/
        Button.test.tsx
  ```

**Project Structure Patterns:**
- `src/` - Source code
- `tests/` or `__tests__/` - Test files (if not co-located)
- `lib/` or `utils/` - Utility functions
- `types/` - TypeScript type definitions
- `components/` - React/UI components (if applicable)

## Conventions

- **Naming**: Use PascalCase for classes/components, camelCase for functions/variables
- **Imports**: Use ES6 imports (`import/export`)
- **Testing**: Use `describe()` and `it()` or `test()` blocks
- **Type Safety**: Leverage TypeScript types for better code quality
- **Configuration**: `tsconfig.json`, `package.json`, `jest.config.js`

## Example Task List Entry

```markdown
## Relevant Files

- `src/components/UserProfile.tsx` - Main user profile component
- `src/components/UserProfile.test.tsx` - Unit tests for UserProfile component
- `src/api/users.ts` - API client for user operations
- `src/api/users.test.ts` - Unit tests for user API client
- `lib/utils/validation.ts` - Input validation utilities
- `lib/utils/validation.test.ts` - Unit tests for validation utilities
```
