---
on:
  push:
    branches: [main, develop]
  pull_request:
    types: [opened, synchronize, ready_for_review]
  workflow_dispatch:
    inputs:
      platform:
        description: 'Platform to test'
        required: false
        type: choice
        default: 'both'
        options:
          - ios
          - android
          - both
      device_ios:
        description: 'iOS device for testing'
        required: false
        default: 'iPhone 15'
      device_android:
        description: 'Android device for testing'
        required: false
        default: 'Google Pixel 8'
      test_suite:
        description: 'Test suite to run'
        required: false
        type: choice
        default: 'all'
        options:
          - all
          - smoke
          - critical
          - pokemon
          - auth
          - tournament

permissions:
  contents: read
  actions: read
  issues: write
  pull-requests: write

engine: claude
timeout_minutes: 45

network:
  allowed:
    - defaults
    - '*.browserstack.com'
    - 'api.browserstack.com'
    - 'hub-cloud.browserstack.com'
    - 'upload.browserstack.com'

tools:
  bash:
    - 'curl:*'
    - 'jq:*'
    - 'npm:*'
    - 'npx:*'
    - 'node:*'
    - 'unzip:*'
    - 'wget:*'
    - 'echo'
    - 'ls'
    - 'pwd'
    - 'cat'
    - 'head'
    - 'tail'
    - 'grep'
    - 'wc'
    - 'find'
    - 'mkdir'
    - 'cp'
    - 'mv'
    - 'rm'
    - 'date'
  web-fetch:
  edit:

safe-outputs:
  create-issue:
    title-prefix: '[BrowserStack] '
    labels: [automation, testing, browserstack, e2e]
  add-comment:
    max: 3
    target: 'pull_request'
---

# BrowserStack Mobile App Testing

Executa testes E2E automatizados no BrowserStack para o app React Native em dispositivos reais.

## Configuração e Execução

### Parâmetros de Entrada:

````bash
# Determine os parâmetros de entrada automaticamente com base no contexto do trigger:

- **Platform**: Padrão 'both' (iOS e Android), pode ser especificado via workflow_dispatch
- **iOS Device**: Padrão 'iPhone 15', pode ser especificado via workflow_dispatch
- **Android Device**: Padrão 'Google Pixel 8', pode ser especificado via workflow_dispatch
- **Test Suite**: Padrão 'all', pode ser especificado via workflow_dispatch

### Etapas de Execução:

#### 1. Verificação de Credenciais

Primeiro, verifique se as credenciais do BrowserStack estão configuradas:

```bash
# Verificar se as variáveis de ambiente estão definidas
if [ -z "$BROWSERSTACK_USERNAME" ] || [ -z "$BROWSERSTACK_ACCESS_KEY" ]; then
  echo "❌ ERRO: Credenciais do BrowserStack não configuradas"
  echo "Configure BROWSERSTACK_USERNAME e BROWSERSTACK_ACCESS_KEY nos secrets do GitHub"
  exit 1
fi

echo "✅ Credenciais do BrowserStack verificadas"
````

#### 2. Preparação do Ambiente

Configure o ambiente de teste:

```bash
# Instalar dependências
npm ci

# Verificar se o Detox está configurado
npx detox --version

# Configurar variáveis para BrowserStack
# Configurar parâmetros de entrada (detectados automaticamente pelo contexto)
export PLATFORM="${PLATFORM:-both}"
export IOS_DEVICE="${IOS_DEVICE:-iPhone 15}"
export ANDROID_DEVICE="${ANDROID_DEVICE:-Google Pixel 8}"
export TEST_SUITE="${TEST_SUITE:-all}"
```

#### 3. Build das Aplicações

Compile as aplicações para iOS e Android conforme necessário:

**Para iOS (se platform = ios ou both):**

```bash
if [ "$PLATFORM" = "ios" ] || [ "$PLATFORM" = "both" ]; then
  echo "🔨 Building iOS app..."

  # Build do app iOS
  cd ios
  bundle install
  bundle exec pod install
  cd ..

  # Build para BrowserStack (Release)
  xcodebuild -workspace ios/rnAwTest.xcworkspace \
    -scheme rnAwTest \
    -configuration Release \
    -sdk iphoneos \
    -archivePath ios/build/rnAwTest.xcarchive \
    archive

  # Criar IPA
  xcodebuild -exportArchive \
    -archivePath ios/build/rnAwTest.xcarchive \
    -exportPath ios/build/ \
    -exportOptionsPlist ios/ExportOptions.plist

  IOS_APP_PATH="ios/build/rnAwTest.ipa"
  echo "✅ iOS app built: $IOS_APP_PATH"
fi
```

**Para Android (se platform = android ou both):**

```bash
if [ "$PLATFORM" = "android" ] || [ "$PLATFORM" = "both" ]; then
  echo "🔨 Building Android app..."

  # Build do APK para BrowserStack
  cd android
  ./gradlew assembleRelease
  cd ..

  ANDROID_APP_PATH="android/app/build/outputs/apk/release/app-release.apk"
  echo "✅ Android app built: $ANDROID_APP_PATH"
fi
```

#### 4. Upload para BrowserStack

Faça upload das aplicações para o BrowserStack:

```bash
# Função para upload
upload_to_browserstack() {
  local app_path=$1
  local platform=$2

  echo "📤 Uploading $platform app to BrowserStack..."

  response=$(curl -u "$BROWSERSTACK_USERNAME:$BROWSERSTACK_ACCESS_KEY" \
    -X POST "https://api-cloud.browserstack.com/app-automate/upload" \
    -F "file=@$app_path" \
    -F "custom_id=rn-aw-test-$platform-$(date +%s)")

  # Verificar se a resposta é um JSON válido
  if echo "$response" | jq . >/dev/null 2>&1; then
    app_url=$(echo $response | jq -r '.app_url')
  else
    echo "❌ Invalid JSON response from BrowserStack upload API"
    echo "Response: $response"
    exit 1
  fi

  if [ "$app_url" != "null" ] && [ -n "$app_url" ]; then
    echo "✅ $platform app uploaded: $app_url"
    echo "$app_url"
  else
    echo "❌ Failed to upload $platform app"
    echo "Response: $response"
    exit 1
  fi
}

# Upload das aplicações
if [ "$PLATFORM" = "ios" ] || [ "$PLATFORM" = "both" ]; then
  IOS_APP_URL=$(upload_to_browserstack "$IOS_APP_PATH" "ios")
fi

if [ "$PLATFORM" = "android" ] || [ "$PLATFORM" = "both" ]; then
  ANDROID_APP_URL=$(upload_to_browserstack "$ANDROID_APP_PATH" "android")
fi
```

#### 5. Configuração dos Testes Detox para BrowserStack

Crie uma configuração específica para BrowserStack:

```bash
# Criar configuração Detox para BrowserStack
cat > .detoxrc.browserstack.js << 'EOF'
/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      '$0': 'jest',
      config: 'e2e/jest.config.js',
    },
    jest: {
      setupTimeout: 300000, // 5 minutos para BrowserStack
    },
  },
  apps: {
    'ios.browserstack': {
      type: 'browserstack.app',
      app: process.env.IOS_APP_URL,
    },
    'android.browserstack': {
      type: 'browserstack.app',
      app: process.env.ANDROID_APP_URL,
    },
  },
  devices: {
    'ios.browserstack': {
      type: 'browserstack.device',
      device: process.env.IOS_DEVICE || 'iPhone 15',
      os_version: '17',
    },
    'android.browserstack': {
      type: 'browserstack.device',
      device: process.env.ANDROID_DEVICE || 'Google Pixel 8',
      os_version: '14.0',
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
};
EOF

export DETOX_CONFIGURATION_PATH=".detoxrc.browserstack.js"
```

#### 6. Seleção de Testes

````bash
# Determine quais testes executar baseado no parâmetro test_suite:

```bash
# Determinar arquivos de teste baseado na suite
get_test_files() {
  local suite=$1

  case $suite in
    "smoke")
      echo "e2e/app-launch.test.ts"
      ;;
    "critical")
      echo "e2e/app-launch.test.ts e2e/authentication.test.ts"
      ;;
    "pokemon")
      echo "e2e/pokemon-features.test.ts e2e/team-building-battle.test.ts"
      ;;
    "auth")
      echo "e2e/authentication.test.ts"
      ;;
    "tournament")
      echo "e2e/tournament-system.test.ts"
      ;;
    "all"|*)
      echo "e2e/*.test.ts"
      ;;
  esac
}

TEST_FILES=$(get_test_files "$TEST_SUITE")
echo "🧪 Test files to run: $TEST_FILES"
````

#### 7. Execução dos Testes

````bash
# Execute os testes no BrowserStack:

```bash
# Configurar variáveis de ambiente para BrowserStack
export BROWSERSTACK_USERNAME="$BROWSERSTACK_USERNAME"
export BROWSERSTACK_ACCESS_KEY="$BROWSERSTACK_ACCESS_KEY"
export BROWSERSTACK_BUILD_NAME="RN-AW-Test-$(date +%Y%m%d-%H%M%S)"
export BROWSERSTACK_PROJECT_NAME="React Native AW Test"

# Função para executar testes em uma plataforma
run_tests_on_platform() {
  local platform=$1
  local config=$2
  local app_url=$3

  echo "🚀 Running tests on $platform..."

  export IOS_APP_URL="$IOS_APP_URL"
  export ANDROID_APP_URL="$ANDROID_APP_URL"

  # Executar testes com timeout estendido
  timeout 2400 npx detox test \
    --configuration "$config" \
    --headless \
    --record-logs all \
    --take-screenshots failing \
    --record-videos failing \
    --maxWorkers 1 \
    $TEST_FILES || return 1

  echo "✅ Tests completed on $platform"
}

# Executar testes conforme plataforma selecionada
TESTS_PASSED=true

if [ "$PLATFORM" = "ios" ] || [ "$PLATFORM" = "both" ]; then
  if ! run_tests_on_platform "iOS" "ios.browserstack" "$IOS_APP_URL"; then
    TESTS_PASSED=false
    echo "❌ iOS tests failed"
  fi
fi

if [ "$PLATFORM" = "android" ] || [ "$PLATFORM" = "both" ]; then
  if ! run_tests_on_platform "Android" "android.browserstack" "$ANDROID_APP_URL"; then
    TESTS_PASSED=false
    echo "❌ Android tests failed"
  fi
fi
````

#### 8. Coleta de Resultados e Relatórios

````bash
# Colete os resultados e gere relatórios:

```bash
# Coletar resultados dos testes
echo "📊 Collecting test results..."

# Gerar resumo dos resultados
TOTAL_TESTS=$(find e2e -name "*.test.ts" | wc -l)
FAILED_TESTS=$(grep -r "FAIL\|Error" e2e/artifacts/ 2>/dev/null | wc -l || echo "0")
PASSED_TESTS=$((TOTAL_TESTS - FAILED_TESTS))

# Coletar links das sessões BrowserStack
BROWSERSTACK_RESPONSE=$(curl -u "$BROWSERSTACK_USERNAME:$BROWSERSTACK_ACCESS_KEY" \
  "https://api.browserstack.com/app-automate/builds.json")

# Verificar se a resposta é um JSON válido
if echo "$BROWSERSTACK_RESPONSE" | jq . >/dev/null 2>&1; then
  BROWSERSTACK_SESSIONS=$(echo "$BROWSERSTACK_RESPONSE" | \
    jq -r --arg build "$BROWSERSTACK_BUILD_NAME" \
    '.[] | select(.name == $build) | .hashed_id')

  if [ -n "$BROWSERSTACK_SESSIONS" ] && [ "$BROWSERSTACK_SESSIONS" != "null" ]; then
    echo "📱 BrowserStack Build: https://app-automate.browserstack.com/dashboard/v2/builds/$BROWSERSTACK_SESSIONS"
  else
    echo "⚠️ BrowserStack build not found or no sessions available"
  fi
else
  echo "⚠️ Invalid JSON response from BrowserStack API"
  echo "Response: $BROWSERSTACK_RESPONSE"
fi

# Preparar relatório
TEST_REPORT="## 📱 BrowserStack Test Results

### Test Summary
- **Platform(s)**: $PLATFORM
- **Total Tests**: $TOTAL_TESTS
- **Passed**: $PASSED_TESTS
- **Failed**: $FAILED_TESTS
- **Status**: $([ "$TESTS_PASSED" = "true" ] && echo "✅ PASSED" || echo "❌ FAILED")

### Device Configuration
- **iOS Device**: $IOS_DEVICE
- **Android Device**: $ANDROID_DEVICE
- **Test Suite**: $TEST_SUITE

### BrowserStack Session
🔗 [View Test Sessions](https://app-automate.browserstack.com/dashboard/v2/builds/$BROWSERSTACK_SESSIONS)

## 📊 Resultados dos Testes

- **SHA**: $(git rev-parse HEAD)
- **Branch**: $(git rev-parse --abbrev-ref HEAD)
- **Author**: $(git log -1 --pretty=format:'%an')""

if [ "$TESTS_PASSED" = "false" ]; then
  TEST_REPORT="$TEST_REPORT

### 🚨 Test Failures
$(find e2e/artifacts -name "*.log" -exec echo "#### {}" \; -exec head -10 {} \; 2>/dev/null || echo "No detailed logs available")"
fi

echo "$TEST_REPORT" > test-results.md
````

#### 9. Publicação dos Resultados

Publique os resultados baseado no contexto:

```bash
# Decidir como reportar baseado no contexto
# Determinar se é um pull request verificando se existe GITHUB_HEAD_REF
if [ -n "$GITHUB_HEAD_REF" ]; then
  # Comentar no PR
  echo "💬 Adding comment to pull request"

  cat test-results.md

elif [ "$TESTS_PASSED" = "false" ]; then
  # Criar issue para falhas em push/workflow_dispatch
  echo "🐛 Creating issue for test failures"

  ISSUE_TITLE="Test Failures on BrowserStack - $(git rev-parse --abbrev-ref HEAD) ($(date +%Y%m%d-%H%M%S))"
  ISSUE_BODY="$(cat test-results.md)

### How to Reproduce
1. Go to Actions tab
2. Run 'BrowserStack Mobile App Testing' workflow
3. Use the same parameters as this run

### Next Steps
- [ ] Investigate failing tests
- [ ] Fix identified issues
- [ ] Re-run tests to verify fixes

/cc @$(git log -1 --pretty=format:'%an')"

  # Note: O safe-outputs irá criar o issue automaticamente
  echo "Issue will be created automatically with title: $ISSUE_TITLE"
else
  echo "✅ All tests passed! No additional reporting needed."
fi

# Finalizar com status apropriado
if [ "$TESTS_PASSED" = "true" ]; then
  echo "🎉 All BrowserStack tests passed successfully!"
  exit 0
else
  echo "💥 Some tests failed. Check the reports above."
  exit 1
fi
```

## Configuração Necessária

### 1. Secrets do GitHub (obrigatório)

Configure estes secrets em Settings > Secrets and variables > Actions:

```
BROWSERSTACK_USERNAME=your_browserstack_username
BROWSERSTACK_ACCESS_KEY=your_browserstack_access_key
```

### 2. Arquivo de Exportação iOS

Crie `ios/ExportOptions.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>development</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>compileBitcode</key>
    <false/>
    <key>stripSwiftSymbols</key>
    <true/>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
</dict>
</plist>
```

### 3. Dispositivos Suportados

**iOS:**

- iPhone 15, iPhone 14, iPhone 13
- iPad Air, iPad Pro
- Múltiplas versões do iOS (16, 17)

**Android:**

- Google Pixel 8, Pixel 7
- Samsung Galaxy S24, S23
- OnePlus 11, 10T
- Múltiplas versões do Android (12, 13, 14)

## Uso do Workflow

### Execução Automática

- Executa automaticamente em push para `main`/`develop`
- Executa automaticamente em PRs

### Execução Manual

1. Vá para Actions > "BrowserStack Mobile App Testing"
2. Clique em "Run workflow"
3. Selecione os parâmetros desejados
4. Clique em "Run workflow"

### Monitoramento

- Acompanhe o progresso na aba Actions
- Veja sessões detalhadas no dashboard do BrowserStack
- Receba comentários automáticos em PRs
- Issues automáticos para falhas

**Este workflow garante que seu app React Native seja testado em dispositivos reais do BrowserStack, fornecendo feedback rápido e confiável sobre a qualidade do código.**
