# Go Configuration

## File Extensions

**Source Files:**
- `.go` - Go source files

**Test Files:**
- `*_test.go` - Test files (must end with `_test.go`)

## Testing

**Built-in Test Framework:** `testing` package

**Test Command:**
```bash
go test ./...
```

**Common Options:**
- `go test -v ./...` - Verbose output showing all tests
- `go test -run TestName` - Run specific test by name
- `go test -cover` - Show coverage percentage
- `go test -coverprofile=coverage.out` - Generate coverage profile
- `go test -bench=.` - Run benchmarks
- `go test ./path/to/package` - Test specific package
- `go test -race` - Run with race detector

**Coverage Visualization:**
```bash
go test -coverprofile=coverage.out
go tool cover -html=coverage.out
```

## File Organization

**Test Location:**
- **Co-located** (standard): Test files alongside source files in same package
  ```
  mypackage/
    user.go
    user_test.go
    profile.go
    profile_test.go
  ```

**Project Structure Patterns:**
- `cmd/` - Main applications for this project
- `pkg/` - Library code that's ok to use by external applications
- `internal/` - Private application and library code (not importable)
- `api/` - API definitions (OpenAPI/Swagger, protocol buffers)
- `web/` - Web application specific components
- `scripts/` - Build, install, analysis scripts
- `test/` - Additional external test apps and test data (integration tests)

**Standard Layout Example:**
```
project/
  cmd/
    myapp/
      main.go
  internal/
    user/
      user.go
      user_test.go
  pkg/
    api/
      api.go
      api_test.go
```

## Conventions

- **Naming**:
  - Use MixedCaps or mixedCaps (no underscores)
  - Exported names start with capital letter
  - Package names are lowercase, single word
- **Testing**:
  - Test functions start with `Test` prefix: `func TestUserCreation(t *testing.T)`
  - Benchmark functions start with `Benchmark` prefix
  - Use table-driven tests for multiple test cases
- **Packages**: One package per directory
- **Imports**: Use `go mod` for dependency management
- **Configuration**: `go.mod`, `go.sum`
- **Formatting**: Use `gofmt` or `goimports` for automatic formatting

## Example Task List Entry

```markdown
## Relevant Files

- `internal/user/profile.go` - User profile business logic
- `internal/user/profile_test.go` - Unit tests for user profile
- `pkg/api/users.go` - Public API client for user operations
- `pkg/api/users_test.go` - Unit tests for user API client
- `internal/utils/validation.go` - Input validation utilities
- `internal/utils/validation_test.go` - Unit tests for validation utilities
```

## Common Test Patterns

**Basic Test:**
```go
func TestUserCreation(t *testing.T) {
    user := NewUser("Test User", "test@example.com")
    if user.Name != "Test User" {
        t.Errorf("expected name %q, got %q", "Test User", user.Name)
    }
}
```

**Table-Driven Test:**
```go
func TestDouble(t *testing.T) {
    tests := []struct {
        input    int
        expected int
    }{
        {1, 2},
        {2, 4},
        {3, 6},
    }

    for _, tt := range tests {
        result := Double(tt.input)
        if result != tt.expected {
            t.Errorf("Double(%d) = %d; want %d", tt.input, result, tt.expected)
        }
    }
}
```

**Subtests:**
```go
func TestUser(t *testing.T) {
    t.Run("Creation", func(t *testing.T) {
        user := NewUser("Test")
        if user.Name != "Test" {
            t.Error("unexpected name")
        }
    })

    t.Run("Validation", func(t *testing.T) {
        err := ValidateUser(User{})
        if err == nil {
            t.Error("expected validation error")
        }
    })
}
```
