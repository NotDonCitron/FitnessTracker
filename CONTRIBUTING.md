# Contributing to FitTracker

Thank you for your interest in contributing to FitTracker! This document provides guidelines and information for contributors.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/fittracker.git
   cd fittracker
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Start the development server**:
   ```bash
   npm run dev
   ```

## 🛠️ Development Workflow

### Branch Naming Convention
- `feature/description` - for new features
- `fix/description` - for bug fixes
- `docs/description` - for documentation updates
- `refactor/description` - for code refactoring

### Making Changes

1. **Create a new branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the coding standards below

3. **Test your changes** thoroughly:
   ```bash
   npm run build
   npm run lint
   ```

4. **Commit your changes** with a descriptive message:
   ```bash
   git commit -m "feat: add new exercise category filter"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** on GitHub

## 📝 Coding Standards

### TypeScript
- Use TypeScript for all new code
- Define proper interfaces and types
- Avoid `any` type when possible
- Use meaningful variable and function names

### React Components
- Use functional components with hooks
- Follow the single responsibility principle
- Keep components under 200 lines when possible
- Use proper prop types and interfaces

### Styling
- Use Tailwind CSS classes
- Follow the existing design system
- Ensure responsive design (mobile-first)
- Test dark/light theme compatibility

### File Organization
- Keep related files together
- Use descriptive file names
- Follow the existing folder structure:
  ```
  src/
  ├── components/     # React components
  ├── hooks/         # Custom hooks
  ├── types/         # TypeScript types
  ├── utils/         # Utility functions
  └── contexts/      # React contexts
  ```

## 🧪 Testing

- Test your changes on both desktop and mobile
- Verify dark/light theme compatibility
- Test with different screen sizes
- Ensure localStorage functionality works
- Test Pokémon reward system integration

## 🎯 Areas for Contribution

### High Priority
- Bug fixes and performance improvements
- Mobile responsiveness enhancements
- Accessibility improvements
- Error handling and edge cases

### Medium Priority
- New exercise additions to the database
- Additional statistics and charts
- UI/UX improvements
- Code refactoring and optimization

### Low Priority
- New features and enhancements
- Additional Pokémon integrations
- Advanced analytics
- Social features

## 🐛 Bug Reports

When reporting bugs, please include:
- **Description**: Clear description of the issue
- **Steps to reproduce**: Detailed steps to recreate the bug
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Environment**: Browser, OS, device type
- **Screenshots**: If applicable

## 💡 Feature Requests

For new features, please:
- Check if the feature already exists or is planned
- Provide a clear use case and benefit
- Consider the impact on existing functionality
- Be open to discussion and feedback

## 📋 Pull Request Guidelines

### Before Submitting
- [ ] Code follows the project's coding standards
- [ ] Changes are tested thoroughly
- [ ] Documentation is updated if needed
- [ ] Commit messages are clear and descriptive
- [ ] No console.log statements left in code
- [ ] TypeScript types are properly defined

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement

## Testing
- [ ] Tested on desktop
- [ ] Tested on mobile
- [ ] Tested dark/light themes
- [ ] Tested with sample data

## Screenshots
If applicable, add screenshots

## Additional Notes
Any additional information
```

## 🎨 Design Guidelines

### Colors
- Follow the existing color palette
- Ensure sufficient contrast ratios
- Test in both light and dark themes

### Typography
- Use consistent font sizes and weights
- Maintain proper hierarchy
- Ensure readability on all devices

### Spacing
- Use Tailwind's spacing system (8px grid)
- Maintain consistent margins and padding
- Ensure proper alignment

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- GitHub contributors page

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Code Review**: All PRs receive thorough review and feedback

## 📜 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Focus on the code, not the person
- Be patient with new contributors

Thank you for contributing to FitTracker! 🏋️‍♂️✨