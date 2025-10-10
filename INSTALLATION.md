# 🚀 Installation Guide - RN AW Test

Complete setup guide for the React Native 0.82 New Architecture project.

## 📱 Prerequisites

### System Requirements

- **Node.js** 20+ 
- **npm** or **yarn**
- **React Native CLI**
- **Git**

### Platform-Specific Requirements

#### iOS Development (macOS only)
- **Xcode** 15+
- **Xcode Command Line Tools**
- **CocoaPods** (via Bundler)
- **Ruby** (for CocoaPods)
- **iOS Simulator** or physical device

#### Android Development
- **Android Studio**
- **Android SDK** (API 34+)
- **Java Development Kit** 17+
- **Android Emulator** or physical device

### Verification Commands

```bash
# Check Node.js version
node --version  # Should be 20+

# Check React Native CLI
npx react-native --version

# Check platform tools
xcode-select --version    # macOS only
java --version            # Should be 17+
```

## 💾 Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/jramalhoinvillia/rn-aw-test.git
cd rn-aw-test
```

### 2. Install JavaScript Dependencies

```bash
# Using npm
npm install

# OR using yarn
yarn install
```

### 3. Set Up Environment Variables

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
# Most values can be left as defaults for development
```

### 4. Platform Setup

#### iOS Setup (macOS only)

```bash
# Install Ruby dependencies
bundle install

# Install CocoaPods dependencies
cd ios
bundle exec pod install
cd ..
```

**Note:** If you encounter issues with pod install:

```bash
# Clean and reinstall pods
cd ios
rm -rf Pods Podfile.lock
bundle exec pod install --repo-update
cd ..
```

#### Android Setup

```bash
# Clean Android build (if needed)
cd android
./gradlew clean
cd ..
```

**Android Studio Setup:**
1. Open Android Studio
2. Configure SDK (API 34+)
3. Create/start an Android emulator
4. Enable USB debugging (for physical device)

### 5. Initialize Git Hooks

```bash
# Set up Husky for code quality
npm run prepare
```

### 6. Verify Installation

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Run tests
npm test
```

## 🏃 Running the App

### Start Metro Bundler

```bash
# Start the Metro bundler
npm start

# OR with cache reset
npm run start:reset
```

### Run on iOS

```bash
# Debug mode
npm run ios

# Specific simulator
npx react-native run-ios --simulator="iPhone 15 Pro"

# Release mode
npm run ios:release
```

### Run on Android

```bash
# Debug mode
npm run android

# Release mode
npm run android:release
```

## 🔍 Troubleshooting

### Common Issues

#### Metro Bundler Issues

```bash
# Clear Metro cache
npm run start:reset

# OR manually
npx react-native start --reset-cache
```

#### iOS Build Issues

```bash
# Clean iOS build
npm run clean:ios

# Reinstall pods
cd ios
rm -rf Pods Podfile.lock
bundle exec pod install
cd ..
```

#### Android Build Issues

```bash
# Clean Android build
npm run clean:android

# Clean all builds
npm run clean
```

#### Node Modules Issues

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Environment Issues

#### React Native Environment

```bash
# Check RN environment
npx @react-native-community/cli doctor

# Fix common issues
npx @react-native-community/cli clean
```

#### TypeScript Issues

```bash
# Check TypeScript configuration
npm run type-check

# Restart TypeScript server (VS Code)
# Command Palette: "TypeScript: Restart TS Server"
```

### Platform-Specific Issues

#### iOS

**Xcode Issues:**
```bash
# Clean Xcode derived data
rm -rf ~/Library/Developer/Xcode/DerivedData

# Reset iOS simulator
xcrun simctl erase all
```

**CocoaPods Issues:**
```bash
# Update CocoaPods
sudo gem install cocoapods
pod repo update

# Clear CocoaPods cache
pod cache clean --all
```

#### Android

**Gradle Issues:**
```bash
# Clean Gradle cache
cd android
./gradlew clean
./gradlew cleanBuildCache
cd ..
```

**Android SDK Issues:**
```bash
# Check Android SDK
echo $ANDROID_HOME
echo $ANDROID_SDK_ROOT

# Update SDK tools in Android Studio
```

## 📊 Performance Optimization

### Development Performance

```bash
# Enable Flipper for debugging
# Already configured in debug builds

# Use Hermes engine (enabled by default)
# Check android/app/build.gradle: enableHermes: true
```

### Build Performance

```bash
# Parallel builds (Android)
# Add to android/gradle.properties:
# org.gradle.parallel=true
# org.gradle.configureondemand=true

# Increase heap size
# org.gradle.jvmargs=-Xmx8g -XX:MaxMetaspaceSize=512m
```

## 🛠️ Development Tools

### Recommended VS Code Extensions

```bash
# Install recommended extensions
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-eslint
code --install-extension bradlc.vscode-tailwindcss
```

### Debugging Tools

- **Flipper** - React Native debugging (auto-configured)
- **React DevTools** - Component inspection
- **Reactotron** - State management debugging
- **Chrome DevTools** - JavaScript debugging

## 📝 Next Steps

After successful installation:

1. **Explore the app** - Run on iOS/Android to see features
2. **Read the code** - Check `src/` directory structure
3. **Run tests** - Execute `npm test` to see testing setup
4. **Check documentation** - Review README.md and CONTRIBUTING.md
5. **Start developing** - Add new features following the established patterns

## 🌐 Deployment

### Development Builds

```bash
# Android APK
npm run build:android

# iOS Archive
npm run build:ios
```

### Production Setup

- Configure signing certificates
- Set up CI/CD pipeline (GitHub Actions included)
- Configure app store metadata
- Set up crash reporting and analytics

---

**Need Help?**

- Check [React Native Documentation](https://reactnative.dev/docs/environment-setup)
- Review [New Architecture Guide](https://reactnative.dev/docs/the-new-architecture/landing-page)
- Open an issue on GitHub
- Check CONTRIBUTING.md for development guidelines

**Happy Coding! 🚀**
