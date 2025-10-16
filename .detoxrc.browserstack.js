/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      $0: 'jest',
      config: 'e2e/jest.config.js',
    },
    jest: {
      setupTimeout: 300000, // 5 minutos para BrowserStack
      testTimeout: 180000, // 3 minutos por teste
    },
  },
  apps: {
    'ios.browserstack': {
      type: 'browserstack.app',
      app: process.env.IOS_APP_URL,
      capabilities: {
        'browserstack.debug': true,
        'browserstack.video': true,
        'browserstack.networkLogs': true,
        'browserstack.appiumLogs': true,
        project: 'React Native AW Test',
        build: process.env.BROWSERSTACK_BUILD_NAME || 'RN-AW-Test-Local',
        name: 'iOS E2E Tests',
      },
    },
    'android.browserstack': {
      type: 'browserstack.app',
      app: process.env.ANDROID_APP_URL,
      capabilities: {
        'browserstack.debug': true,
        'browserstack.video': true,
        'browserstack.networkLogs': true,
        'browserstack.appiumLogs': true,
        project: 'React Native AW Test',
        build: process.env.BROWSERSTACK_BUILD_NAME || 'RN-AW-Test-Local',
        name: 'Android E2E Tests',
      },
    },
  },
  devices: {
    'ios.browserstack': {
      type: 'browserstack.device',
      device: process.env.IOS_DEVICE || 'iPhone 15',
      os_version: process.env.IOS_VERSION || '17',
      capabilities: {
        'browserstack.user': process.env.BROWSERSTACK_USERNAME,
        'browserstack.key': process.env.BROWSERSTACK_ACCESS_KEY,
        'browserstack.debug': true,
        'browserstack.video': true,
        'browserstack.networkLogs': true,
        'browserstack.appiumLogs': true,
        autoAcceptAlerts: true,
        autoGrantPermissions: true,
      },
    },
    'android.browserstack': {
      type: 'browserstack.device',
      device: process.env.ANDROID_DEVICE || 'Google Pixel 8',
      os_version: process.env.ANDROID_VERSION || '14.0',
      capabilities: {
        'browserstack.user': process.env.BROWSERSTACK_USERNAME,
        'browserstack.key': process.env.BROWSERSTACK_ACCESS_KEY,
        'browserstack.debug': true,
        'browserstack.video': true,
        'browserstack.networkLogs': true,
        'browserstack.appiumLogs': true,
        autoGrantPermissions: true,
      },
    },
  },
  configurations: {
    'ios.browserstack': {
      device: 'ios.browserstack',
      app: 'ios.browserstack',
    },
    'android.browserstack': {
      device: 'android.browserstack',
      app: 'android.browserstack',
    },
  },
  artifacts: {
    rootDir: './e2e/artifacts',
    pathBuilder: './e2e/jest.config.js',
    plugins: {
      log: {
        enabled: true,
        keepOnlyFailedTestsArtifacts: false,
      },
      screenshot: {
        enabled: true,
        shouldTakeAutomaticSnapshots: true,
        keepOnlyFailedTestsArtifacts: false,
        takeWhen: {
          testStart: false,
          testDone: true,
          testFailure: true,
        },
      },
      video: {
        enabled: true,
        keepOnlyFailedTestsArtifacts: false,
        takeWhen: {
          testStart: false,
          testDone: true,
          testFailure: true,
        },
      },
      instruments: {
        enabled: false,
      },
      timeline: {
        enabled: false,
      },
    },
  },
  behavior: {
    init: {
      exposeGlobals: false,
    },
    cleanup: {
      shutdownDevice: false,
    },
  },
  logger: {
    level: process.env.CI ? 'info' : 'debug',
    overrideConsole: true,
    options: {
      showLoggerName: true,
      showLevel: true,
      showMetadata: false,
    },
  },
};
