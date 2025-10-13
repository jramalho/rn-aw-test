# App Store Deployment Guide

This guide covers deploying the RN AW Test app to Apple App Store (iOS) and Google Play Store (Android) using Fastlane automation.

## Table of Contents

- [Prerequisites](#prerequisites)
- [iOS Deployment](#ios-deployment)
  - [Initial Setup](#ios-initial-setup)
  - [TestFlight Beta](#ios-testflight-beta)
  - [App Store Release](#ios-app-store-release)
- [Android Deployment](#android-deployment)
  - [Initial Setup](#android-initial-setup)
  - [Internal Testing](#android-internal-testing)
  - [Beta Release](#android-beta-release)
  - [Production Release](#android-production-release)
- [App Store Assets](#app-store-assets)
- [Troubleshooting](#troubleshooting)
- [CI/CD Integration](#cicd-integration)

## Prerequisites

### General

- **Fastlane**: Install via Bundler (recommended)
  ```bash
  bundle install
  ```
- **Git**: Version control for code signing certificates
- **Node.js**: 20+ for React Native

### iOS Prerequisites

- **macOS**: Xcode 15+ required
- **Apple Developer Account**: Paid membership ($99/year)
- **App Store Connect Access**: App must be created
- **Code Signing**: Certificates and provisioning profiles

### Android Prerequisites

- **Google Play Console Account**: One-time $25 fee
- **Service Account**: For API access
- **Signing Key**: Generated keystore for app signing

## iOS Deployment

### iOS Initial Setup

#### 1. Configure Apple Developer Account

Edit `ios/fastlane/Appfile`:

```ruby
apple_id("your-email@example.com")
app_identifier("com.yourcompany.rnawtest")
itc_team_id("YOUR_ITC_TEAM_ID")
team_id("YOUR_TEAM_ID")
```

**Finding Your Team IDs:**

- **App Store Connect Team ID**: Log in to [App Store Connect](https://appstoreconnect.apple.com) → Select your account → Users and Access → Keys → View Team ID
- **Developer Portal Team ID**: Log in to [Apple Developer](https://developer.apple.com) → Account → Membership → Team ID

#### 2. Setup Code Signing with Match

Match is Fastlane's code signing solution that syncs certificates and profiles across your team using a Git repository.

**a. Create a private Git repository for certificates:**

```bash
# Example: GitHub private repo
git clone git@github.com:yourorg/certificates.git
```

**b. Configure Match:**

Edit `ios/fastlane/Matchfile`:

```ruby
git_url("git@github.com:yourorg/certificates.git")
app_identifier(["com.yourcompany.rnawtest"])
type("appstore")
storage_mode("git")
```

**c. Initialize Match:**

```bash
cd ios
bundle exec fastlane match init
bundle exec fastlane match appstore
```

You'll be prompted to:

- Create a passphrase (store securely!)
- Authenticate with Apple Developer account

#### 3. Create App in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **My Apps** → **+** → **New App**
3. Fill in app details:
   - **Platform**: iOS
   - **Name**: RN AW Test
   - **Primary Language**: English
   - **Bundle ID**: Select your bundle ID
   - **SKU**: Unique identifier (e.g., rnawtest-001)
   - **User Access**: Full Access

### iOS TestFlight Beta

Deploy beta builds to TestFlight for internal and external testing:

```bash
cd ios
bundle exec fastlane beta
```

**What this does:**

1. Ensures git status is clean
2. Increments build number automatically
3. Builds release IPA
4. Uploads to TestFlight
5. Commits version bump
6. Pushes to git repository

**Testing the Build:**

1. Go to App Store Connect → TestFlight
2. The build will appear after processing (10-30 minutes)
3. Add internal testers (up to 100)
4. Submit for external testing (requires review)

### iOS App Store Release

Deploy production release to the App Store:

```bash
cd ios
bundle exec fastlane release
```

**What this does:**

1. Increments version number (patch by default)
2. Increments build number
3. Builds release IPA
4. Uploads to App Store
5. Creates git tag
6. Commits and pushes changes

**Submitting for Review:**

1. Go to App Store Connect → My Apps → Your App
2. Click on the version in **App Store** tab
3. Fill in required metadata (if not done)
4. Add screenshots and app preview (see [App Store Assets](#app-store-assets))
5. Click **Submit for Review**

**Review Process:**

- Takes 1-3 days typically
- Check status in App Store Connect
- Respond to any rejection feedback

## Android Deployment

### Android Initial Setup

#### 1. Generate Signing Key

Generate a keystore for signing your Android app:

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore rnawtest-release.keystore \
  -alias rnawtest-key -keyalg RSA -keysize 2048 -validity 10000
```

**Important:** Store the keystore and passwords securely! You cannot recover them.

#### 2. Configure Signing in Gradle

Edit `android/gradle.properties`:

```properties
MYAPP_RELEASE_STORE_FILE=rnawtest-release.keystore
MYAPP_RELEASE_KEY_ALIAS=rnawtest-key
MYAPP_RELEASE_STORE_PASSWORD=your_keystore_password
MYAPP_RELEASE_KEY_PASSWORD=your_key_password
```

Add to `.gitignore`:

```
android/app/*.keystore
android/gradle.properties
```

Edit `android/app/build.gradle` (signing config should already exist):

```gradle
android {
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

#### 3. Setup Google Play Console API

**a. Create Service Account:**

1. Go to [Google Play Console](https://play.google.com/console)
2. Select **Setup** → **API access**
3. Click **Create new service account**
4. Follow the link to Google Cloud Platform
5. Create service account with name `fastlane-deploy`
6. Grant **Service Account User** role
7. Create JSON key and download

**b. Grant Permissions:**

1. Back in Play Console → API access
2. Find your service account
3. Click **Grant access**
4. Select permissions:
   - **Releases**: Create and edit releases
   - **App access**: View app information
   - **Order management**: View financial data (optional)

**c. Configure Fastlane:**

Edit `android/fastlane/Appfile`:

```ruby
package_name("com.rnawtest")
json_key_file("path/to/service-account.json")
```

**Important:** Store the JSON key securely and add to `.gitignore`!

#### 4. Create App in Google Play Console

1. Go to [Play Console](https://play.google.com/console)
2. Click **Create app**
3. Fill in details:
   - **App name**: RN AW Test
   - **Default language**: English
   - **App or game**: App
   - **Free or paid**: Free
4. Complete **Store presence** questionnaire
5. Fill in **Store listing** (see [App Store Assets](#app-store-assets))

### Android Internal Testing

Deploy to Internal Testing track for quick testing with up to 100 testers:

```bash
cd android
bundle exec fastlane internal
```

**What this does:**

1. Builds release AAB
2. Uploads to Internal Testing track
3. Makes build available immediately

**Testing:**

1. Go to Play Console → Testing → Internal testing
2. Create **Email list** of testers
3. Share the **Internal test link** with testers
4. Testers opt-in and install via Play Store

### Android Beta Release

Deploy to Beta track for wider testing with up to 50,000 users:

```bash
cd android
bundle exec fastlane beta
```

**What this does:**

1. Increments version code
2. Builds release AAB
3. Uploads to Beta track
4. Commits version bump
5. Pushes to repository

**Testing:**

1. Go to Play Console → Testing → Open testing or Closed testing
2. Create test groups
3. Beta builds require review (faster than production)

### Android Production Release

Deploy to Production for all users:

```bash
cd android
bundle exec fastlane release
```

**What this does:**

1. Increments version code
2. Builds release AAB
3. Uploads to Production with 10% rollout
4. Creates git tag
5. Commits and pushes changes

**Rollout Strategy:**

- Starts with 10% of users
- Monitor crash reports and reviews
- Gradually increase: 25% → 50% → 100%
- Can halt and rollback if issues detected

**Production Release Steps:**

1. Go to Play Console → Production
2. Review the release
3. Gradually increase rollout percentage
4. Monitor **Vitals** for crashes
5. Full rollout when stable

## App Store Assets

### iOS App Store Requirements

**App Icon:**

- 1024x1024 px (PNG, no alpha channel)

**Screenshots (required for at least one device):**

- iPhone 6.7": 1290 x 2796 px (3 devices)
- iPhone 6.5": 1242 x 2688 px (iPhone 11 Pro Max)
- iPhone 5.5": 1242 x 2208 px (iPhone 8 Plus)
- iPad Pro 12.9": 2048 x 2732 px (3rd gen)
- iPad Pro 11": 1668 x 2388 px (2nd gen)

**App Preview (optional):**

- 15-30 second video
- Same dimensions as screenshots
- Portrait or landscape

**Metadata:**

- App description (4000 chars max)
- Keywords (100 chars max)
- Support URL
- Privacy Policy URL
- Copyright text

### Android Play Store Requirements

**App Icon:**

- 512x512 px (PNG, 32-bit)

**Feature Graphic:**

- 1024 x 500 px (PNG or JPEG)
- Used in Play Store listings

**Screenshots (2-8 required):**

- Phone: 1080 x 1920 px minimum
- 7" Tablet: 1200 x 1920 px minimum
- 10" Tablet: 1920 x 2560 px minimum

**Promo Video (optional):**

- YouTube video URL

**Metadata:**

- Short description (80 chars max)
- Full description (4000 chars max)
- Privacy Policy URL
- Content rating questionnaire

### Generating Screenshots with Fastlane

**iOS:**

```bash
cd ios
bundle exec fastlane snapshot init
# Configure snapfile and tests
bundle exec fastlane screenshots
```

**Android:**

```bash
cd android
bundle exec fastlane screengrab init
# Configure screengrab configuration
bundle exec fastlane screenshots
```

## Troubleshooting

### iOS Issues

**"No profiles for 'com.yourapp' were found"**

- Solution: Run `bundle exec fastlane match appstore` again
- Ensure Appfile has correct bundle ID

**"Could not find a team with ID 'XXXXX'"**

- Solution: Verify team IDs in Appfile
- Check [Apple Developer](https://developer.apple.com) membership

**"User credentials are invalid"**

- Solution: Check Apple ID and password
- Enable two-factor authentication
- Generate app-specific password if needed

**Build hangs during upload**

- Solution: Check internet connection
- Verify App Store Connect service status
- Try manual upload with Application Loader

### Android Issues

**"Google Api Error: forbidden"**

- Solution: Verify service account has correct permissions
- Re-grant access in Play Console → API access

**"Package name 'com.yourapp' does not exist"**

- Solution: Create app in Play Console first
- Ensure package name matches Appfile

**"Version code X has already been used"**

- Solution: Increment version code manually
- Run `bundle exec fastlane increment_version_code`

**Signing errors**

- Solution: Verify keystore path and passwords
- Check `android/gradle.properties` configuration
- Ensure keystore file exists

### General Issues

**"Gemfile not found"**

- Solution: Run `bundle install` in project root
- Ensure Ruby is installed

**"Lane 'xyz' not found"**

- Solution: Verify Fastfile syntax
- Check for typos in lane names

**Git push fails**

- Solution: Ensure git remote is configured
- Check repository permissions
- Pull latest changes before running lane

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to App Stores

on:
  push:
    tags:
      - 'v*.*.*'
  workflow_dispatch:
    inputs:
      platform:
        description: 'Platform to deploy'
        required: true
        type: choice
        options:
          - ios
          - android
          - both
      track:
        description: 'Release track'
        required: true
        type: choice
        options:
          - beta
          - production

jobs:
  deploy-ios:
    if: github.event.inputs.platform == 'ios' || github.event.inputs.platform == 'both'
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          bundler-cache: true

      - name: Install dependencies
        run: npm ci

      - name: Install pods
        run: cd ios && bundle exec pod install

      - name: Setup Match
        env:
          MATCH_PASSWORD: ${{ secrets.MATCH_PASSWORD }}
          MATCH_GIT_TOKEN: ${{ secrets.MATCH_GIT_TOKEN }}
        run: |
          cd ios
          bundle exec fastlane match appstore --readonly

      - name: Deploy to TestFlight
        if: github.event.inputs.track == 'beta'
        env:
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_APP_SPECIFIC_PASSWORD: ${{ secrets.APPLE_APP_SPECIFIC_PASSWORD }}
        run: cd ios && bundle exec fastlane beta

      - name: Deploy to App Store
        if: github.event.inputs.track == 'production'
        env:
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_APP_SPECIFIC_PASSWORD: ${{ secrets.APPLE_APP_SPECIFIC_PASSWORD }}
        run: cd ios && bundle exec fastlane release

  deploy-android:
    if: github.event.inputs.platform == 'android' || github.event.inputs.platform == 'both'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          bundler-cache: true

      - name: Install dependencies
        run: npm ci

      - name: Setup signing
        env:
          ANDROID_SIGNING_KEY: ${{ secrets.ANDROID_SIGNING_KEY_BASE64 }}
        run: |
          echo "$ANDROID_SIGNING_KEY" | base64 -d > android/app/rnawtest-release.keystore

      - name: Deploy to Beta
        if: github.event.inputs.track == 'beta'
        env:
          PLAY_STORE_JSON_KEY: ${{ secrets.PLAY_STORE_SERVICE_ACCOUNT_JSON }}
        run: |
          echo "$PLAY_STORE_JSON_KEY" > android/fastlane/service-account.json
          cd android && bundle exec fastlane beta

      - name: Deploy to Production
        if: github.event.inputs.track == 'production'
        env:
          PLAY_STORE_JSON_KEY: ${{ secrets.PLAY_STORE_SERVICE_ACCOUNT_JSON }}
        run: |
          echo "$PLAY_STORE_JSON_KEY" > android/fastlane/service-account.json
          cd android && bundle exec fastlane release
```

**Required Secrets (GitHub Repository Settings → Secrets):**

**iOS:**

- `APPLE_ID`: Apple Developer email
- `APPLE_APP_SPECIFIC_PASSWORD`: Generated from appleid.apple.com
- `MATCH_PASSWORD`: Encryption password for Match certificates
- `MATCH_GIT_TOKEN`: Personal access token for certificates repository

**Android:**

- `PLAY_STORE_SERVICE_ACCOUNT_JSON`: Service account JSON content
- `ANDROID_SIGNING_KEY_BASE64`: Base64 encoded keystore file
- `ANDROID_KEYSTORE_PASSWORD`: Keystore password
- `ANDROID_KEY_PASSWORD`: Key password
- `ANDROID_KEY_ALIAS`: Key alias

## Additional Resources

### Official Documentation

- [Fastlane iOS Documentation](https://docs.fastlane.tools/getting-started/ios/setup/)
- [Fastlane Android Documentation](https://docs.fastlane.tools/getting-started/android/setup/)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)

### Code Signing

- [Match Documentation](https://docs.fastlane.tools/actions/match/)
- [iOS Code Signing Guide](https://codesigning.guide/)
- [Android App Signing](https://developer.android.com/studio/publish/app-signing)

### Best Practices

- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy](https://play.google.com/about/developer-content-policy/)
- [React Native Publishing](https://reactnative.dev/docs/publishing-to-app-store)

---

**Note:** This guide assumes you have already completed the initial React Native setup and have a working development environment. For initial setup, see [INSTALLATION.md](../INSTALLATION.md).
