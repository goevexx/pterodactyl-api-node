# Testing Guide

This document provides comprehensive information about testing the Pterodactyl n8n node.

## Quick Start

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- tests/unit/credentials/PterodactylClientApi.test.ts

# Run tests for specific directory
npm test -- tests/unit/transport
```

## Test Structure

```
tests/
├── unit/                      # Unit tests (mocked dependencies)
│   ├── credentials/          # Credential tests
│   │   ├── PterodactylClientApi.test.ts
│   │   └── PterodactylApplicationApi.test.ts
│   ├── transport/            # API request layer tests
│   │   ├── pterodactylApiRequest.test.ts
│   │   └── pterodactylApiRequestAllItems.test.ts
│   └── operations/           # Operation-specific tests
│       └── server/
│           ├── listServers.operation.test.ts
│           ├── getServer.operation.test.ts
│           └── powerAction.operation.test.ts
├── integration/              # Integration tests (real API - future)
├── fixtures/                 # Sample data and responses
│   ├── pterodactylResponses.ts
│   └── testCredentials.ts
└── helpers/                  # Test utilities and mocks
    ├── mockExecuteFunctions.ts
    └── mockHttpRequest.ts
```

## Coverage Requirements

- **Overall Coverage**: 80%+ (currently: 85.71%)
- **Transport Layer**: 80%+ (currently: 83.72%)
- **Credentials**: 95%+ (currently: 100%)
- **Operations**: 80%+ (currently: 100%)

## Writing Unit Tests

### Test Pattern

All unit tests follow this pattern:

```typescript
import { operationFunction } from '../../../path/to/operation';
import { createMockExecuteFunctions } from '../../helpers/mockExecuteFunctions';
import { testClientCredentials } from '../../fixtures/testCredentials';

describe('Operation Name', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = createMockExecuteFunctions();
    mockExecuteFunctions.getNodeParameter.mockReturnValue('clientApi');
    mockExecuteFunctions.getCredentials.mockResolvedValue(testClientCredentials);
  });

  it('should test specific behavior', async () => {
    // Arrange
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      statusCode: 200,
      body: { data: [] }
    });

    // Act
    const result = await operationFunction.call(mockExecuteFunctions, 0);

    // Assert
    expect(result).toBeDefined();
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalled();
  });
});
```

### Mocking n8n Functions

Use the helper functions:

```typescript
import { createMockExecuteFunctions } from '../../helpers/mockExecuteFunctions';

// Create mock with defaults
const mockFunctions = createMockExecuteFunctions();

// Override specific methods
mockFunctions.getNodeParameter.mockReturnValue('someValue');
mockFunctions.getCredentials.mockResolvedValue({ apiKey: 'test' });
mockFunctions.helpers.httpRequest.mockResolvedValue({ statusCode: 200 });
```

### Testing Error Scenarios

```typescript
it('should handle 404 errors', async () => {
  mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
    statusCode: 404,
    body: {
      errors: [{
        code: 'ResourceNotFoundException',
        detail: 'Server not found'
      }]
    }
  });

  await expect(
    operationFunction.call(mockExecuteFunctions, 0)
  ).rejects.toThrow('Server not found');
});
```

## Test Utilities

### Mock Functions

#### `createMockExecuteFunctions(overrides?)`
Creates a mock IExecuteFunctions object with all required methods.

```typescript
const mock = createMockExecuteFunctions({
  getNodeParameter: jest.fn().mockReturnValue('customValue')
});
```

#### `createMockHttpResponse(data, statusCode?)`
Creates a mock HTTP response.

```typescript
const response = createMockHttpResponse({ id: 1 }, 200);
```

### Fixtures

#### Test Credentials
```typescript
import {
  testClientCredentials,
  testApplicationCredentials
} from '../../fixtures/testCredentials';
```

#### Sample Responses
```typescript
import {
  sampleServerResponse,
  sampleDatabaseResponse,
  sampleBackupResponse
} from '../../fixtures/pterodactylResponses';
```

## Running Tests

### Unit Tests Only
```bash
npm test -- tests/unit
```

### Specific Test Suite
```bash
npm test -- tests/unit/transport/pterodactylApiRequest.test.ts
```

### With Coverage Report
```bash
npm run test:cov
```

Coverage reports are generated in:
- `coverage/lcov-report/index.html` - HTML report (open in browser)
- `coverage/lcov.info` - LCOV format for CI tools

### Watch Mode
```bash
npm run test:watch
```

In watch mode, press:
- `a` - run all tests
- `p` - filter by filename pattern
- `t` - filter by test name pattern
- `q` - quit

## Continuous Integration

Tests run automatically on:
- Every push to any branch
- Every pull request
- Before npm publish

The build fails if:
- Any test fails
- Coverage drops below 80%

## Troubleshooting

### Tests Timing Out

If tests timeout, increase the timeout:

```typescript
it('should handle long operation', async () => {
  // Test code
}, 10000); // 10 second timeout
```

### Mock Not Working

Ensure mocks are reset between tests:

```typescript
beforeEach(() => {
  jest.clearAllMocks();
  mockExecuteFunctions = createMockExecuteFunctions();
});
```

### Coverage Not Updating

Clear the coverage cache:

```bash
npm test -- --clearCache
npm run test:cov
```

### TypeScript Errors

Ensure `@types/jest` is installed:

```bash
npm install --save-dev @types/jest
```

## Test Coverage Summary

Current test coverage (as of latest run):

```
File                          | % Stmts | % Branch | % Funcs | % Lines |
------------------------------|---------|----------|---------|---------|
All files                     |   100   |  85.71   |   100   |   100   |
Credentials                   |   100   |   100    |   100   |   100   |
Transport Layer               |   100   |  83.72   |   100   |   100   |
Server Operations             |   100   |   100    |   100   |   100   |
```

**Total Tests**: 140 passing

## Best Practices

1. **Test Naming**: Use descriptive names that explain what is being tested
   - ✅ `should return all servers when returnAll is true`
   - ❌ `test1`

2. **One Assertion Per Test**: Focus each test on one specific behavior
   - Makes failures easier to debug
   - Tests serve as documentation

3. **AAA Pattern**: Arrange, Act, Assert
   ```typescript
   // Arrange - set up test data and mocks
   mockExecuteFunctions.getNodeParameter.mockReturnValue('value');

   // Act - call the function being tested
   const result = await operation.call(mockExecuteFunctions, 0);

   // Assert - verify the outcome
   expect(result).toBe('expected');
   ```

4. **Test Edge Cases**: Don't just test happy paths
   - Empty responses
   - Invalid inputs
   - Error conditions
   - Boundary values

5. **Keep Tests Fast**: Unit tests should run in milliseconds
   - Mock all external dependencies
   - Avoid real API calls in unit tests
   - Use integration tests for end-to-end scenarios

6. **Avoid Test Interdependence**: Each test should be independent
   - Use `beforeEach` to set up fresh state
   - Don't rely on test execution order

## Integration Tests (Future)

Integration tests will test against a real Pterodactyl panel instance. These are optional and require Docker setup.

### Prerequisites
- Docker and Docker Compose installed
- Pterodactyl test panel running (see `tests/integration/setup/README.md`)

### Running Integration Tests
```bash
# Start test environment
cd tests/integration/setup
docker-compose up -d

# Run integration tests
npm test -- tests/integration

# Stop test environment
docker-compose down
```

## Contributing

When adding new operations or features:

1. Write unit tests first (TDD approach)
2. Ensure coverage stays above 80%
3. Add test cases for error scenarios
4. Update this documentation if adding new test patterns

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [n8n Node Development](https://docs.n8n.io/integrations/creating-nodes/)
- [TypeScript Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
