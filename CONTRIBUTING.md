# Contributing to pathbunny

Thank you for your interest in contributing to pathbunny! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Git
- TypeScript knowledge

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/gurkanfikretgunak/pathbunny.git
   cd pathbunny
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Project**
   ```bash
   npm run build
   ```

4. **Run in Development Mode**
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
pathbunny/
├── src/
│   ├── commands/          # Command implementations
│   │   ├── add.ts
│   │   ├── list.ts
│   │   ├── navigate.ts
│   │   ├── remove.ts
│   │   └── update.ts
│   ├── utils/             # Utility modules
│   │   ├── storage.ts     # JSON storage management
│   │   ├── platform.ts    # Cross-platform support
│   │   └── logger.ts      # Logging and output
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   └── index.ts           # Main CLI entry point
├── dist/                  # Compiled JavaScript
├── tests/                 # Test files
└── docs/                  # Documentation
```

## 🎯 How to Contribute

### 1. Reporting Bugs

Before creating a bug report, please:
- Check existing issues to avoid duplicates
- Test with the latest version
- Provide detailed reproduction steps

**Bug Report Template:**
```markdown
## Bug Description
Brief description of the bug.

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Environment
- OS: [e.g., macOS 14.0]
- Node.js: [e.g., 18.17.0]
- pathbunny version: [e.g., 1.0.0]
- Shell: [e.g., zsh, bash]
```

### 2. Feature Requests

We welcome feature requests! Please:
- Check existing issues and discussions
- Provide clear use cases
- Explain the expected behavior
- Consider implementation complexity

### 3. Code Contributions

#### Pull Request Process

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Follow the coding standards
   - Add tests for new functionality
   - Update documentation if needed

3. **Test Your Changes**
   ```bash
   npm run build
   npm test
   npm run lint
   ```

4. **Commit Your Changes**
   ```bash
   git commit -m "feat: add amazing new feature"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 Coding Standards

### TypeScript Guidelines

- Use TypeScript strict mode
- Prefer explicit types over `any`
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

```typescript
/**
 * Adds a new directory shortcut
 * @param name - The shortcut name
 * @param path - The directory path
 * @param description - Optional description
 * @returns Command result with success status
 */
public addShortcut(name: string, path: string, description?: string): CommandResult {
  // Implementation
}
```

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in objects/arrays
- Use meaningful commit messages

### Error Handling

- Always handle errors gracefully
- Provide helpful error messages
- Use the `CommandResult` interface for consistency

```typescript
try {
  // Operation
  return { success: true, message: 'Success!' };
} catch (error) {
  return { 
    success: false, 
    message: `Operation failed: ${error}` 
  };
}
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- storage.test.ts
```

### Writing Tests

- Write unit tests for new features
- Test error conditions
- Mock external dependencies
- Use descriptive test names

```typescript
describe('StorageManager', () => {
  describe('addShortcut', () => {
    it('should add a new shortcut successfully', () => {
      // Test implementation
    });

    it('should return error for invalid path', () => {
      // Test implementation
    });
  });
});
```

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for all public methods
- Document complex algorithms
- Include usage examples

### README Updates

When adding features:
- Update command documentation
- Add usage examples
- Update feature list

## 🔄 Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new command for exporting shortcuts
fix: resolve path resolution issue on Windows
docs: update installation instructions
test: add unit tests for storage manager
refactor: improve error handling in commands
```

## 🎨 Design Principles

### User Experience
- Commands should be intuitive and memorable
- Error messages should be helpful and actionable
- Output should be well-formatted and colorful

### Code Quality
- Prefer composition over inheritance
- Keep functions small and focused
- Use dependency injection for testability
- Handle edge cases gracefully

### Performance
- Minimize file system operations
- Cache frequently accessed data
- Use lazy loading where appropriate

## 🤝 Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Help others learn and grow
- Focus on constructive feedback
- Celebrate diverse perspectives

### Communication

- Use clear, concise language
- Provide context in discussions
- Ask questions when unsure
- Share knowledge and resources

## 🆘 Getting Help

### Development Questions
- Check existing documentation
- Search through issues and discussions
- Ask in GitHub Discussions
- Tag maintainers when needed

### Review Process
- All PRs require review from maintainers
- Address feedback promptly
- Keep PRs focused and small
- Update based on review comments

## 🏆 Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes
- GitHub contributors page

Thank you for contributing to pathbunny! 🚀
