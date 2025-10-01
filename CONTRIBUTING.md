# Contributing to n8n-nodes-pterodactyl

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful and inclusive. This project follows the [Contributor Covenant](https://www.contributor-covenant.org/).

## Development Setup

### Prerequisites

- Node.js 18.10.0 or higher
- npm 8.0.0 or higher
- n8n installed for testing

### Setup Steps

1. Fork and clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/pterodactyl-api-node.git
cd pterodactyl-api-node
```

2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

4. Link for local n8n testing:

```bash
npm link
# In your n8n directory:
npm link n8n-nodes-pterodactyl
```

## Development Workflow

### Code Style

This project uses:

- **TypeScript** with strict mode enabled
- **ESLint** for code quality
- **Prettier** for code formatting

Run these commands before committing:

```bash
npm run lint        # Check for linting errors
npm run lintfix     # Auto-fix linting issues
npm run format      # Format code with Prettier
```

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `chore`: Maintenance tasks
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `ci`: CI/CD changes
- `perf`: Performance improvements
- `style`: Code style changes

**Examples:**

```
feat(server): add startup variables operation
fix(backup): handle missing backup name parameter
docs: update README with new operations
```

### Adding New Operations

Follow this pattern when adding operations:

1. Create operation file: `nodes/Pterodactyl/actions/{resource}/{operation}.operation.ts`
2. Export operation properties and function
3. Update resource `index.ts`
4. Import in main `Pterodactyl.node.ts`
5. Add to operation dropdown
6. Route in execute method

See existing operations for examples.

### Testing

```bash
npm test              # Run tests
npm run test:watch    # Watch mode
npm run test:cov      # Coverage report
```

Always test your changes in a real n8n instance before submitting.

### Pull Request Process

1. Create a feature branch:

```bash
git checkout -b feat/your-feature-name
```

2. Make your changes following the guidelines above

3. Ensure all checks pass:

```bash
npm run build
npm run lint
npm run format -- --check
npm test
```

4. Commit with conventional commit format

5. Push and create a Pull Request

6. Fill out the PR template completely

7. Wait for review and address feedback

### Branch Protection

- Main branch requires PR reviews
- All CI checks must pass
- PR title must follow Conventional Commits format

## Need Help?

- Check existing [issues](https://github.com/nico-on-github/pterodactyl-api-node/issues)
- Review [n8n node documentation](https://docs.n8n.io/integrations/creating-nodes/)
- Ask in the PR or issue

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
