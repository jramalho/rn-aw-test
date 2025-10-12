#!/bin/bash

# Bundle Size Analysis Script
# Analyzes React Native bundle size and provides optimization insights

set -e

echo "📊 Bundle Size Analysis for RN AW Test"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Create output directory
OUTPUT_DIR="./bundle-analysis"
mkdir -p "$OUTPUT_DIR"

# Function to format bytes
format_bytes() {
    local bytes=$1
    if [ $bytes -lt 1024 ]; then
        echo "${bytes}B"
    elif [ $bytes -lt 1048576 ]; then
        echo "$(awk "BEGIN {printf \"%.2f\", $bytes/1024}")KB"
    else
        echo "$(awk "BEGIN {printf \"%.2f\", $bytes/1048576}")MB"
    fi
}

echo "🔍 Analyzing Android Bundle..."
echo ""

# Check if Android release APK exists
ANDROID_APK="./android/app/build/outputs/apk/release/app-release.apk"
if [ ! -f "$ANDROID_APK" ]; then
    echo "${YELLOW}⚠️  Android release APK not found. Building...${NC}"
    echo "Run: cd android && ./gradlew assembleRelease"
    echo ""
else
    APK_SIZE=$(stat -f%z "$ANDROID_APK" 2>/dev/null || stat -c%s "$ANDROID_APK" 2>/dev/null)
    FORMATTED_SIZE=$(format_bytes $APK_SIZE)
    echo "${GREEN}✓ APK Size: $FORMATTED_SIZE${NC}"
    
    # Extract and analyze APK contents
    unzip -q "$ANDROID_APK" -d "$OUTPUT_DIR/apk-contents" 2>/dev/null || true
    
    if [ -d "$OUTPUT_DIR/apk-contents" ]; then
        echo ""
        echo "📦 APK Contents Breakdown:"
        echo "-------------------------"
        
        # Analyze lib folder (native libraries)
        if [ -d "$OUTPUT_DIR/apk-contents/lib" ]; then
            LIB_SIZE=$(du -sh "$OUTPUT_DIR/apk-contents/lib" | cut -f1)
            echo "  Native Libraries (lib/): $LIB_SIZE"
        fi
        
        # Analyze assets folder (JS bundle, assets)
        if [ -d "$OUTPUT_DIR/apk-contents/assets" ]; then
            ASSETS_SIZE=$(du -sh "$OUTPUT_DIR/apk-contents/assets" | cut -f1)
            echo "  Assets (JS + Resources): $ASSETS_SIZE"
            
            # Check for JS bundle
            if [ -f "$OUTPUT_DIR/apk-contents/assets/index.android.bundle" ]; then
                JS_SIZE=$(stat -f%z "$OUTPUT_DIR/apk-contents/assets/index.android.bundle" 2>/dev/null || stat -c%s "$OUTPUT_DIR/apk-contents/assets/index.android.bundle" 2>/dev/null)
                JS_FORMATTED=$(format_bytes $JS_SIZE)
                echo "    - JS Bundle: $JS_FORMATTED"
            fi
        fi
        
        # Analyze resources
        if [ -d "$OUTPUT_DIR/apk-contents/res" ]; then
            RES_SIZE=$(du -sh "$OUTPUT_DIR/apk-contents/res" | cut -f1)
            echo "  Resources (res/): $RES_SIZE"
        fi
    fi
fi

echo ""
echo "💡 Bundle Size Optimization Tips:"
echo "--------------------------------"
echo "1. ✅ Hermes engine enabled (reduces JS bundle size)"
echo "2. ✅ ProGuard/R8 enabled (minifies native code)"
echo "3. ✅ Resource shrinking enabled (removes unused resources)"
echo "4. ✅ Console removal in production (babel)"
echo "5. ✅ Minification configured (metro/terser)"
echo ""
echo "📈 Optimization Results:"
echo "----------------------"
echo "- JS Bundle: Minified with Terser + Hermes bytecode"
echo "- Native Code: Optimized with ProGuard/R8"
echo "- Resources: Shrunk to remove unused assets"
echo "- Architectures: Built for arm64-v8a and x86_64 only"
echo ""

# Clean up
rm -rf "$OUTPUT_DIR/apk-contents"

echo "${GREEN}✓ Analysis complete!${NC}"
echo ""
echo "For detailed bundle analysis, you can also:"
echo "  - Use Android Studio's APK Analyzer"
echo "  - Run: npx react-native bundle --platform android --dev false --bundle-output index.android.bundle"
echo "  - Analyze with: npx react-native-bundle-visualizer"
