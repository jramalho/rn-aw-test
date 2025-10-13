# Deployment Quick Reference

Quick commands and checklists for deploying RN AW Test to App Store and Play Store.

## Prerequisites Checklist

### iOS

- [ ] macOS with Xcode 15+ installed
- [ ] Apple Developer account (paid)
- [ ] App created in App Store Connect
- [ ] `ios/fastlane/Appfile` configured
- [ ] Match certificates setup (`bundle exec fastlane match appstore`)
- [ ] Bundle installed (`bundle install`)

### Android

- [ ] Signing keystore generated
- [ ] `android/gradle.properties` configured with signing info
- [ ] Google Play Console account
- [ ] App created in Play Console
- [ ] Service account JSON downloaded
- [ ] `android/fastlane/Appfile` configured
- [ ] Bundle installed (`bundle install`)

## Quick Commands

### iOS

```bash
# Build IPA locally
cd ios && bundle exec fastlane build

# Deploy to TestFlight
cd ios && bundle exec fastlane beta

# Deploy to App Store
cd ios && bundle exec fastlane release

# Generate screenshots
cd ios && bundle exec fastlane screenshots

# Run tests
cd ios && bundle exec fastlane test

# Setup code signing
cd ios && bundle exec fastlane match appstore
```

**Via npm scripts:**

```bash
npm run deploy:ios:build     # Build IPA
npm run deploy:ios:beta      # Deploy to TestFlight
npm run deploy:ios:release   # Deploy to App Store
```

### Android

```bash
# Build APK locally
cd android && bundle exec fastlane build

# Build AAB (App Bundle)
cd android && bundle exec fastlane bundle

# Deploy to Internal Testing
cd android && bundle exec fastlane internal

# Deploy to Beta
cd android && bundle exec fastlane beta

# Deploy to Production
cd android && bundle exec fastlane release

# Run tests
cd android && bundle exec fastlane test

# Increment version code
cd android && bundle exec fastlane increment_version_code
```

**Via npm scripts:**

```bash
npm run deploy:android:build      # Build APK
npm run deploy:android:bundle     # Build AAB
npm run deploy:android:internal   # Deploy to Internal Testing
npm run deploy:android:beta       # Deploy to Beta
npm run deploy:android:release    # Deploy to Production
```

## Environment Setup

### iOS Environment Variables

Required for CI/CD:

```bash
export APPLE_ID="your-email@example.com"
export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"
export MATCH_PASSWORD="your-match-password"
export MATCH_GIT_TOKEN="ghp_xxx"  # For private certificates repo
```

Generate App-Specific Password:

1. Go to https://appleid.apple.com
2. Sign In
3. Security → App-Specific Passwords
4. Generate new password

### Android Environment Variables

Required for CI/CD:

```bash
export PLAY_STORE_JSON_KEY="path/to/service-account.json"
export ANDROID_KEYSTORE_PATH="path/to/rnawtest-release.keystore"
export ANDROID_KEYSTORE_PASSWORD="your-keystore-password"
export ANDROID_KEY_PASSWORD="your-key-password"
export ANDROID_KEY_ALIAS="rnawtest-key"
```

## Common Issues

### iOS

**Issue**: "No profiles for bundle ID found"

```bash
# Solution
cd ios && bundle exec fastlane match appstore --force
```

**Issue**: "Authentication failed"

```bash
# Solution: Generate app-specific password
# Use it instead of Apple ID password
```

**Issue**: Build number already exists

```bash
# Solution: Increment manually in Xcode
# Or let Fastlane handle it automatically
```

### Android

**Issue**: "Version code already exists"

```bash
# Solution
cd android && bundle exec fastlane increment_version_code
```

**Issue**: "Google API Error: forbidden"

```bash
# Solution: Re-grant API access in Play Console
# Setup → API access → Service Account → Grant access
```

**Issue**: Signing errors

```bash
# Verify keystore
keytool -list -v -keystore android/app/rnawtest-release.keystore

# Check gradle.properties configuration
cat android/gradle.properties | grep MYAPP_RELEASE
```

## Version Management

### iOS Version Numbering

Managed in `ios/rnAwTest/Info.plist`:

- **CFBundleShortVersionString**: Marketing version (e.g., 1.0.0)
- **CFBundleVersion**: Build number (e.g., 42)

Fastlane automatically increments build numbers.

### Android Version Numbering

Managed in `android/app/build.gradle`:

- **versionName**: Marketing version (e.g., "1.0.0")
- **versionCode**: Integer build number (e.g., 42)

Fastlane automatically increments version codes.

### Semantic Versioning

Follow [semver](https://semver.org/):

- **Major**: Breaking changes (1.0.0 → 2.0.0)
- **Minor**: New features (1.0.0 → 1.1.0)
- **Patch**: Bug fixes (1.0.0 → 1.0.1)

## Deployment Workflow

### Beta Testing Workflow

1. **Code Complete**: Merge features to main branch
2. **Version Bump**: Let Fastlane handle automatically
3. **Deploy Beta**:
   ```bash
   npm run deploy:ios:beta
   npm run deploy:android:beta
   ```
4. **Test**: Internal team tests via TestFlight/Internal Testing
5. **Collect Feedback**: Fix issues, repeat if needed

### Production Release Workflow

1. **Beta Validated**: All beta testing complete
2. **Create Release Branch**: `git checkout -b release/v1.0.0`
3. **Update Changelog**: Document all changes
4. **Deploy Production**:
   ```bash
   npm run deploy:ios:release
   npm run deploy:android:release
   ```
5. **Submit for Review**: iOS manual, Android automatic
6. **Monitor Release**: Check crash reports and reviews
7. **Tag Release**: `git tag v1.0.0 && git push --tags`

## Monitoring Post-Release

### iOS

- **App Store Connect → Analytics**: Download, crash, engagement metrics
- **TestFlight**: Beta tester feedback
- **Xcode Organizer**: Crash reports and energy reports

### Android

- **Play Console → Statistics**: Installation, crash, ANR data
- **Android Vitals**: Performance metrics
- **Pre-launch Reports**: Automated testing results

## Rollback Procedures

### iOS

1. Go to App Store Connect → My Apps → Your App
2. Select **App Store** tab
3. Click on the problematic version
4. Click **Remove from Sale**
5. Previous version remains available to users

### Android

1. Go to Play Console → Production
2. Click on the problematic release
3. Click **Create new release**
4. Select previous bundle
5. Roll out previous version (100% rollout)

## Additional Resources

- Full guide: [docs/APP_STORE_DEPLOYMENT.md](./APP_STORE_DEPLOYMENT.md)
- Fastlane docs: https://docs.fastlane.tools
- App Store Connect: https://appstoreconnect.apple.com
- Play Console: https://play.google.com/console

---

**Last Updated**: October 2025
