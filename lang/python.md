# Python Configuration

## File Extensions

**Source Files:**
- `.py` - Python source files

**Test Files:**
- `test_*.py` - Test files (pytest convention)
- `*_test.py` - Alternative test naming convention

## Testing

**Primary Test Framework:** pytest

**Test Command:**
```bash
pytest [optional/path/to/test_file.py]
```

**Common Options:**
- `pytest -v` - Verbose output with test names
- `pytest -s` - Show print statements
- `pytest --cov` - Generate coverage report
- `pytest --cov=src` - Coverage for specific directory
- `pytest -k "test_name"` - Run tests matching pattern
- `pytest --maxfail=1` - Stop after first failure

**Alternative Frameworks:**
- unittest: `python -m unittest`
- nose2: `nose2`

## File Organization

**Test Location:**
- **Separate tests/ directory** (recommended): Mirror source structure in tests/
  ```
  project/
    src/
      mypackage/
        module.py
    tests/
      mypackage/
        test_module.py
  ```
- **Co-located**: Tests alongside source in same directory
  ```
  mypackage/
    module.py
    test_module.py
  ```

**Project Structure Patterns:**
- `src/` - Source code (src layout)
- `tests/` - Test files
- `docs/` - Documentation
- Package root layout (alternative):
  ```
  mypackage/
    __init__.py
    module.py
  tests/
    test_module.py
  ```

## Conventions

- **Naming**: Use snake_case for functions, variables, and file names
- **Imports**: Use absolute imports from project root
- **Testing**: Use pytest fixtures for setup/teardown
- **Type Hints**: Use type annotations (Python 3.6+)
- **Virtual Environment**: `venv/`, `.venv/`, or `virtualenv/`
- **Dependencies**: `requirements.txt`, `setup.py`, or `pyproject.toml`
- **Code Style**: Follow PEP 8 style guide

## Example Task List Entry

```markdown
## Relevant Files

- `src/mypackage/user_profile.py` - User profile module with business logic
- `tests/mypackage/test_user_profile.py` - Unit tests for user profile module
- `src/mypackage/api/users.py` - API client for user operations
- `tests/mypackage/api/test_users.py` - Unit tests for user API client
- `src/mypackage/utils/validation.py` - Input validation utilities
- `tests/mypackage/utils/test_validation.py` - Unit tests for validation utilities
```

## Common Test Patterns

**Fixtures:**
```python
@pytest.fixture
def sample_user():
    return User(name="Test User", email="test@example.com")

def test_user_creation(sample_user):
    assert sample_user.name == "Test User"
```

**Parameterization:**
```python
@pytest.mark.parametrize("input,expected", [
    (1, 2),
    (2, 4),
])
def test_double(input, expected):
    assert input * 2 == expected
```
