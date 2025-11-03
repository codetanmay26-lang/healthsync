# HealthSync Testing & CI/CD Setup Guide

This document explains how to set up and use automated testing and code review tools for HealthSync.

## 🛠️ Tools Integrated

### 1. **Vitest** - Fast Unit Testing Framework

- Modern testing framework built for Vite
- Fast execution with hot module reloading
- Compatible with React Testing Library

### 2. **CodeRabbit** - AI-Powered Code Reviews

- Automated PR reviews using AI
- Context-aware suggestions
- Security and best practices checks

### 3. **GitHub Actions CI/CD**

- Automated builds on push/PR
- Security vulnerability scanning
- Lighthouse performance testing

---

## 📦 Installation

### Step 1: Install Testing Dependencies

```bash
npm install --save-dev vitest @vitest/ui @vitest/coverage-v8 jsdom eslint eslint-plugin-react eslint-plugin-react-hooks
```

Or if the dependencies are already in package.json:

```bash
npm install
```

---

## 🧪 Running Tests

### Run Tests in Watch Mode

```bash
npm test
```

### Run Tests Once (CI Mode)

```bash
npm run test:run
```

### Run Tests with UI

```bash
npm run test:ui
```

Opens an interactive UI at `http://localhost:51204`

### Run Tests with Coverage

```bash
npm run test:coverage
```

Generates coverage report in `coverage/` directory

---

## 🤖 Setting Up CodeRabbit

### Prerequisites

1. GitHub repository must be public or have CodeRabbit app installed
2. OpenAI API key (optional, uses CodeRabbit's key by default)

### Steps:

#### 1. Install CodeRabbit App on GitHub

- Go to https://github.com/apps/coderabbitai
- Click "Install" or "Configure"
- Select your repository: `codetanmay26-lang/healthsync`
- Grant necessary permissions

#### 2. Configure CodeRabbit (Optional)

The `.coderabbit.yaml` file is already created with HealthSync-specific rules:

- Focuses on React hooks usage
- Checks localStorage patterns
- Verifies error handling in async operations
- Ensures accessibility in patient/doctor interfaces
- Validates API key security

#### 3. Test CodeRabbit

- Create a new branch
- Make some changes
- Open a Pull Request
- CodeRabbit will automatically review within 1-2 minutes

---

## 🔄 GitHub Actions CI/CD

### What's Automated:

#### On Every Push/PR:

1. **Dependency Installation** - `npm ci`
2. **Security Audit** - `npm audit`
3. **Build Test** - `npm run build`
4. **Build Verification** - Checks dist/ folder exists
5. **Artifact Upload** - Saves build for 7 days
6. **Preview Test** - Tests `npm run serve`

#### On Pull Requests:

1. **CodeRabbit Review** - AI code review
2. **Lighthouse CI** - Performance testing
3. **Build Matrix** - Tests on Node 18.x & 20.x

### View CI/CD Results:

1. Go to your GitHub repository
2. Click "Actions" tab
3. View workflow runs and logs

---

## 📊 Current Test Coverage

### Existing Tests (src/test/app.test.jsx):

✅ **Authentication Flow**

- Token storage on login
- localStorage cleanup on logout

✅ **Prescription Upload**

- File type validation
- Supported formats: PDF, JPG, PNG

✅ **Medical Notation Parser**

- 1-0-1 notation validation
- Correct reminder count generation

✅ **Smart Reminders**

- localStorage persistence
- Reminder data structure

✅ **Role-based Access**

- Route mapping validation

---

## 🚀 Adding More Tests

### Example: Test PrescriptionUploader Component

Create `src/test/PrescriptionUploader.test.jsx`:

```javascript
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PrescriptionUploader from "../pages/patient-portal/components/PrescriptionUploader";

describe("PrescriptionUploader", () => {
  it("should render upload button", () => {
    render(<PrescriptionUploader patientId="123" />);
    expect(screen.getByText(/Upload Prescription/i)).toBeInTheDocument();
  });

  it("should show confirmation modal after analysis", async () => {
    // Add test logic
  });
});
```

Run: `npm test PrescriptionUploader`

---

## 🔐 Security Scanning

### Automated Vulnerability Checks:

- Runs on every push
- Uses `npm audit`
- Fails if high/critical vulnerabilities found

### Manual Security Audit:

```bash
npm audit
npm audit fix
npm audit fix --force  # For breaking changes
```

---

## 📈 Performance Testing (Lighthouse)

### What's Tested:

- Performance score
- Accessibility
- Best practices
- SEO
- Progressive Web App compliance

### View Results:

- Check GitHub Actions artifacts
- Download Lighthouse HTML report
- Review scores and recommendations

---

## 🐛 Debugging Failed Tests

### Common Issues:

**1. Tests fail locally but pass in CI**

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm test
```

**2. Import errors in tests**

```bash
# Check vitest.config.mjs has correct paths
# Verify imports use correct file extensions
```

**3. Environment variable issues**

```bash
# Check src/test/setup.js mocks
# Verify .env.test file if needed
```

---

## 📝 Best Practices

### Writing Tests:

1. **Test user behavior**, not implementation
2. Use `screen` queries from @testing-library/react
3. Mock external APIs (Gemini, etc.)
4. Keep tests isolated (no shared state)
5. Use descriptive test names

### Code Reviews with CodeRabbit:

1. Review AI suggestions carefully
2. Use `/ask` in PR comments to ask CodeRabbit questions
3. Use `/fix` to request code fixes
4. Mark false positives as "Not useful"

### CI/CD:

1. Fix failing builds before merging
2. Review security audit results
3. Check Lighthouse scores
4. Keep dependencies updated

---

## 🔧 Troubleshooting

### CodeRabbit Not Reviewing?

1. Check if app is installed on repo
2. Verify PR is from a branch (not fork)
3. Check GitHub Actions permissions
4. Wait 2-3 minutes after PR creation

### Tests Not Running?

1. Check Node version: `node --version` (need 18+)
2. Verify package.json scripts
3. Clear npm cache: `npm cache clean --force`
4. Reinstall: `npm install`

### Build Failing in CI?

1. Check workflow logs in GitHub Actions
2. Test build locally: `npm run build`
3. Verify all dependencies are in package.json
4. Check for environment-specific issues

---

## 📚 Resources

- **Vitest Docs**: https://vitest.dev
- **CodeRabbit Docs**: https://docs.coderabbit.ai
- **React Testing Library**: https://testing-library.com/react
- **GitHub Actions**: https://docs.github.com/actions

---

## ✅ Quick Start Checklist

- [ ] Install dependencies: `npm install`
- [ ] Run tests: `npm test`
- [ ] Install CodeRabbit app on GitHub
- [ ] Create test PR to verify CI/CD
- [ ] Review CodeRabbit suggestions
- [ ] Check GitHub Actions passed
- [ ] Add more tests as needed

---

## 🎯 Next Steps

1. **Expand Test Coverage**: Add tests for all components
2. **E2E Testing**: Consider Playwright or Cypress
3. **Visual Regression**: Add visual testing with Percy
4. **Performance Monitoring**: Integrate Sentry or similar
5. **Dependency Updates**: Set up Dependabot

---

_Last Updated: November 3, 2025_
