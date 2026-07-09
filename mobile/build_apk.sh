#!/bin/bash
set -e

echo "=============================================="
echo "   EDGS Mobile App - APK compiler"
echo "=============================================="

# Prebuild native folder
echo "🔨 Running prebuild..."
npx expo prebuild --platform android --no-install

# Check Java environment
if [ -z "$JAVA_HOME" ]; then
    echo "⚠️ Warning: JAVA_HOME is not set. Trying to build using system defaults..."
fi

# Build APK
echo "🏗️ Building release APK..."
cd android
./gradlew assembleRelease

echo "=============================================="
echo "🎉 APK built successfully!"
echo "📍 Output location: mobile/android/app/build/outputs/apk/release/app-release.apk"
echo "=============================================="
