#!/bin/bash

# Script para testar integração BrowserStack localmente
# Execute: chmod +x scripts/test-browserstack-local.sh && ./scripts/test-browserstack-local.sh

set -e

echo "🧪 Testing BrowserStack Integration Locally"
echo "============================================"

# Verificar se as credenciais estão configuradas
if [ -z "$BROWSERSTACK_USERNAME" ] || [ -z "$BROWSERSTACK_ACCESS_KEY" ]; then
  echo "❌ ERRO: Configure as variáveis de ambiente:"
  echo "export BROWSERSTACK_USERNAME='seu_username'"
  echo "export BROWSERSTACK_ACCESS_KEY='sua_access_key'"
  exit 1
fi

echo "✅ Credenciais BrowserStack verificadas"

# Configurar variáveis padrão
export PLATFORM="${1:-android}"  # android, ios, ou both
export TEST_SUITE="${2:-smoke}"   # smoke, critical, all
export ANDROID_DEVICE="${3:-Google Pixel 8}"
export IOS_DEVICE="${4:-iPhone 15}"

echo "📱 Configuração:"
echo "  Platform: $PLATFORM"
echo "  Test Suite: $TEST_SUITE"
echo "  Android Device: $ANDROID_DEVICE"
echo "  iOS Device: $IOS_DEVICE"

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
  echo "📦 Instalando dependências..."
  npm ci
fi

# Função para build Android
build_android() {
  echo "🔨 Building Android APK..."
  
  cd android
  if [ ! -f "gradlew" ]; then
    echo "❌ gradlew não encontrado. Execute o projeto no Android Studio primeiro."
    exit 1
  fi
  
  chmod +x gradlew
  ./gradlew assembleRelease
  cd ..
  
  ANDROID_APP_PATH="android/app/build/outputs/apk/release/app-release.apk"
  
  if [ -f "$ANDROID_APP_PATH" ]; then
    echo "✅ Android APK criado: $ANDROID_APP_PATH"
    echo "📦 Tamanho: $(ls -lh "$ANDROID_APP_PATH" | awk '{print $5}')"
  else
    echo "❌ Falha ao criar Android APK"
    exit 1
  fi
}

# Função para upload
upload_to_browserstack() {
  local app_path=$1
  local platform=$2
  
  echo "📤 Uploading $platform app to BrowserStack..."
  
  if [ ! -f "$app_path" ]; then
    echo "❌ Arquivo não encontrado: $app_path"
    exit 1
  fi
  
  response=$(curl -u "$BROWSERSTACK_USERNAME:$BROWSERSTACK_ACCESS_KEY" \
    -X POST "https://api-cloud.browserstack.com/app-automate/upload" \
    -F "file=@$app_path" \
    -F "custom_id=rn-aw-test-$platform-local-$(date +%s)" \
    --silent)
  
  app_url=$(echo $response | jq -r '.app_url // empty')
  
  if [ -n "$app_url" ]; then
    echo "✅ $platform app uploaded: $app_url"
    echo "$app_url"
  else
    echo "❌ Failed to upload $platform app"
    echo "Response: $response"
    exit 1
  fi
}

# Função para executar testes
run_tests() {
  local platform=$1
  local config=$2
  local app_url=$3
  
  echo "🚀 Running $platform tests on BrowserStack..."
  
  # Configurar variáveis de ambiente
  export BROWSERSTACK_BUILD_NAME="RN-AW-Test-Local-$(date +%s)"
  export BROWSERSTACK_PROJECT_NAME="React Native AW Test - Local"
  
  if [ "$platform" = "android" ]; then
    export ANDROID_APP_URL="$app_url"
    export ANDROID_DEVICE="$ANDROID_DEVICE"
  elif [ "$platform" = "ios" ]; then
    export IOS_APP_URL="$app_url"
    export IOS_DEVICE="$IOS_DEVICE"
  fi
  
  # Determinar arquivos de teste
  case $TEST_SUITE in
    "smoke")
      TEST_FILES="e2e/app-launch.test.ts"
      ;;
    "critical")
      TEST_FILES="e2e/app-launch.test.ts e2e/authentication.test.ts"
      ;;
    "pokemon")
      TEST_FILES="e2e/pokemon-features.test.ts"
      ;;
    "all")
      TEST_FILES="e2e/*.test.ts"
      ;;
    *)
      TEST_FILES="e2e/app-launch.test.ts"
      ;;
  esac
  
  echo "🧪 Test files: $TEST_FILES"
  
  # Executar testes
  npx detox test \
    --configuration "$config" \
    --headless \
    --record-logs all \
    --take-screenshots failing \
    --maxWorkers 1 \
    $TEST_FILES
}

# Processo principal
echo ""
echo "🚀 Iniciando processo de teste..."

if [ "$PLATFORM" = "android" ] || [ "$PLATFORM" = "both" ]; then
  echo ""
  echo "📱 === ANDROID TESTING ==="
  
  # Build Android
  build_android
  
  # Upload para BrowserStack
  ANDROID_APP_URL=$(upload_to_browserstack "$ANDROID_APP_PATH" "android")
  
  # Executar testes
  echo "⏳ Aguardando 30s para o app estar disponível no BrowserStack..."
  sleep 30
  
  run_tests "android" "android.browserstack" "$ANDROID_APP_URL"
  
  echo "✅ Android tests completed!"
fi

if [ "$PLATFORM" = "ios" ] || [ "$PLATFORM" = "both" ]; then
  echo ""
  echo "🍎 === iOS TESTING ==="
  echo "❗ iOS testing requires macOS with Xcode installed"
  
  if [ "$(uname)" != "Darwin" ]; then
    echo "⚠️  Skipping iOS tests - not running on macOS"
  else
    echo "🔨 Building iOS app..."
    
    # Build iOS (requer macOS)
    cd ios
    bundle install 2>/dev/null || echo "Bundle install skipped"
    bundle exec pod install
    cd ..
    
    xcodebuild -workspace ios/rnAwTest.xcworkspace \
      -scheme rnAwTest \
      -configuration Release \
      -sdk iphoneos \
      -archivePath ios/build/rnAwTest.xcarchive \
      archive
      
    xcodebuild -exportArchive \
      -archivePath ios/build/rnAwTest.xcarchive \
      -exportPath ios/build/ \
      -exportOptionsPlist ios/ExportOptions.plist
      
    IOS_APP_PATH="ios/build/rnAwTest.ipa"
    
    if [ -f "$IOS_APP_PATH" ]; then
      # Upload e teste iOS
      IOS_APP_URL=$(upload_to_browserstack "$IOS_APP_PATH" "ios")
      
      echo "⏳ Aguardando 30s para o app estar disponível no BrowserStack..."
      sleep 30
      
      run_tests "ios" "ios.browserstack" "$IOS_APP_URL"
      
      echo "✅ iOS tests completed!"
    else
      echo "❌ iOS build failed"
    fi
  fi
fi

echo ""
echo "🎉 Teste BrowserStack local concluído!"
echo ""
echo "📊 Resultados disponíveis em:"
echo "  - BrowserStack Dashboard: https://app-automate.browserstack.com/dashboard"
echo "  - Logs locais: e2e/artifacts/"
echo ""
echo "💡 Para executar no GitHub Actions:"
echo "  1. Configure os secrets BROWSERSTACK_USERNAME e BROWSERSTACK_ACCESS_KEY"
echo "  2. Execute o workflow em Actions > 'BrowserStack Mobile App Testing'"
echo ""
echo "🔧 Para personalizar este script:"
echo "  ./scripts/test-browserstack-local.sh [platform] [test_suite] [android_device] [ios_device]"
echo "  Exemplo: ./scripts/test-browserstack-local.sh android smoke 'Samsung Galaxy S23'"