# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# React Native ProGuard rules
-keep,includedescriptorclasses class com.facebook.react.** { *; }
-keep,includedescriptorclasses class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# Keep native methods
-keepclassmembers class * {
    native <methods>;
}

# Keep Hermes
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# Okhttp
-dontwarn okhttp3.**
-dontwarn okio.**
-keepnames class okhttp3.internal.publicsuffix.PublicSuffixDatabase

# Zustand
-keep class zustand.** { *; }

# React Navigation
-keep class com.swmansion.** { *; }
-keep class com.th3rdwave.** { *; }

# Async Storage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# Vector Icons
-keep class com.oblador.vectoricons.** { *; }

# Reanimated
-keep class com.swmansion.reanimated.** { *; }

# Gesture Handler
-keep class com.swmansion.gesturehandler.** { *; }

# Paper
-keep class com.reactnativepaper.** { *; }

# Safe Area Context
-keep class com.th3rdwave.safeareacontext.** { *; }

# Screens
-keep class com.swmansion.rnscreens.** { *; }

# Optimization settings
-optimizations !code/simplification/arithmetic,!code/simplification/cast,!field/*,!class/merging/*
-optimizationpasses 5
-allowaccessmodification
-dontpreverify

# Remove logging in production
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}

# Keep line numbers for debugging stack traces
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
