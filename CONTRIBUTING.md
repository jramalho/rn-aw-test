# Contributing to RN AW Test

We welcome contributions to this React Native 0.82 New Architecture showcase project! This document provides guidelines for contributing effectively.

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- React Native development environment set up
- Git
- Understanding of React Native New Architecture concepts

### Fork and Clone

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/rn-aw-test.git`
3. Add upstream remote: `git remote add upstream https://github.com/jramalhoinvillia/rn-aw-test.git`

### Set Up Development Environment

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Install iOS dependencies (macOS only)
cd ios && bundle exec pod install && cd ..

# Set up Git hooks
npm run prepare
```

## 📝 Development Workflow

### Branch Naming Convention

- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes  
- `docs/documentation-update` - Documentation changes
- `refactor/component-name` - Code refactoring
- `test/test-description` - Test additions/improvements

### Code Style

- **TypeScript**: Use strict TypeScript with proper typing
- **ESLint**: Follow the configured ESLint rules
- **Prettier**: Code formatting is enforced
- **File naming**: Use PascalCase for components, camelCase for utilities
- **Import order**: External libraries → Internal imports → Types

### Commit Messages

Use conventional commits format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

**Examples:**
```
feat(auth): add biometric authentication
fix(navigation): resolve deep linking issue
docs(readme): update installation instructions
test(button): add accessibility tests
```

## 🧪 Testing Guidelines

### Writing Tests

- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test component interactions
- **Accessibility Tests**: Ensure proper accessibility support
- **Coverage**: Aim for >80% code coverage

### Test Structure

```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup
  });

  it('should render correctly', () => {
    // Test implementation
  });

  it('should handle user interactions', () => {
    // Test user interactions
  });

  it('should be accessible', () => {
    // Test accessibility
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run E2E tests
npm run test:e2e:build:android
npm run test:e2e:test:android
```

## 🏗️ New Architecture Guidelines

### TurboModules

- Use TurboModules for new native functionality
- Follow the official TurboModule spec
- Include proper TypeScript definitions
- Add comprehensive tests

### Fabric Components

- Create new UI components using Fabric
- Ensure proper native view management
- Test on both iOS and Android
- Document component props and behavior

### Performance Considerations

- Leverage JSI for performance-critical code
- Use React.memo() and useMemo() appropriately  
- Implement proper list virtualization
- Monitor bundle size impact

## 📱 Platform-Specific Guidelines

### iOS

- Follow iOS Human Interface Guidelines
- Test on multiple iOS versions and devices
- Ensure proper safe area handling
- Use iOS-specific optimizations where appropriate

### Android

- Follow Material Design guidelines
- Test on multiple Android versions and screen sizes
- Handle Android-specific permissions properly
- Optimize for different device capabilities

## 🚦 Pull Request Process

### Before Submitting

1. **Ensure all tests pass**: `npm test`
2. **Check TypeScript**: `npm run type-check`
3. **Lint your code**: `npm run lint:fix`
4. **Update documentation** if needed
5. **Add/update tests** for new functionality

### PR Requirements

- **Clear title and description**
- **Link to related issues**
- **Screenshots/videos** for UI changes
- **Performance impact assessment**
- **Breaking changes documented**

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature  
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Accessibility tested

## Screenshots/Videos
(If applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests pass
- [ ] Documentation updated
```

## 🛠️ Development Tools

### Recommended VS Code Extensions

- React Native Tools
- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- Auto Rename Tag
- GitLens

### Debugging

- **Flipper**: For React Native debugging
- **React DevTools**: For component inspection  
- **Reactotron**: For state management debugging
- **Native debugging**: Xcode/Android Studio for native issues

## 📊 Performance Guidelines

### Bundle Size

- Monitor bundle impact of new dependencies
- Use tree-shaking-friendly imports
- Implement code splitting where appropriate

### Runtime Performance

- Profile with React DevTools Profiler
- Use Performance Monitor in development
- Test on lower-end devices
- Monitor memory usage

### New Architecture Benefits

- Leverage synchronous native calls
- Use Concurrent Features appropriately
- Implement proper error boundaries
- Optimize for Hermes engine

## 🐛 Bug Reports

### Creating Issues

When reporting bugs:

1. **Use the bug report template**
2. **Provide clear reproduction steps**
3. **Include environment details**
4. **Add screenshots/logs** if applicable
5. **Check for existing issues** first

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen

## Actual Behavior  
What actually happens

## Environment
- OS: [e.g. iOS 17.0, Android 14]
- Device: [e.g. iPhone 15, Pixel 7]
- React Native: 0.82.0
- Node: 20.x

## Additional Context
Any other relevant information
```

## 💡 Feature Requests

### Proposing Features

1. **Check existing issues** and discussions
2. **Use the feature request template**
3. **Explain the use case** clearly
4. **Consider New Architecture benefits**
5. **Discuss implementation approach**

## 🤝 Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help newcomers learn
- Follow community guidelines
- Report inappropriate behavior

## 🙏 Recognition

Contributors will be:

- **Listed in README.md**
- **Credited in release notes**
- **Given appropriate GitHub roles**
- **Recognized in project discussions**

## 📚 Learning Resources

### New Architecture

- [Official New Architecture Docs](https://reactnative.dev/docs/the-new-architecture/landing-page)
- [Fabric Renderer Guide](https://reactnative.dev/docs/fabric-renderer)
- [TurboModules Documentation](https://reactnative.dev/docs/turbo-modules)

### React Native

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [React Native Community](https://github.com/react-native-community)
- [Awesome React Native](https://github.com/jondot/awesome-react-native)

### TypeScript

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://github.com/typescript-cheatsheets/react)

---

**Thank you for contributing to RN AW Test! 🚀**

For questions, reach out through:
- GitHub Issues
- GitHub Discussions  
- Project maintainers
