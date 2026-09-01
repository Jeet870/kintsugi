# Kintsugi Android Application

Native Android application built with **Kotlin**, **Android Jetpack Architecture (MVVM)**, **Hilt**, **Retrofit**, **Coroutines / Flow**, and **Material Design 3**.

---

## Android Architecture & Tech Stack

- **Pattern**: Model-View-ViewModel (MVVM) + Clean Repository Layer
- **Dependency Injection**: Google Hilt (`@HiltViewModel`, `@Inject`)
- **Networking**: Retrofit 2 + OkHttp 4 + `kotlinx.serialization`
- **UI Engine**: Material Design 3 Components + Custom Views (GlassCardView, FloatingParticlesView, PrimaryGradientButton)
- **Theme**: Enforced Dark Mode Sanctuary (`AppCompatDelegate.MODE_NIGHT_YES`)
- **Navigation**: Jetpack Navigation Component with Single-Activity Architecture (`MainActivity`)

---

## Directory Structure

```
frontend/
└── app/
    └── src/
        └── main/
            ├── java/com/kintsugi/app/
            │   ├── core/
            │   │   ├── common/
            │   │   ├── datastore/
            │   │   └── ui/
            │   ├── di/
            │   └── features/
            │       ├── auth/
            │       ├── dashboard/
            │       ├── journal/
            │       ├── moodtracker/
            │       ├── aicompanion/
            │       └── emergency/
            └── res/
                ├── layout/
                ├── navigation/
                └── values/
```

---

## Building & Running

1. **ADB Reverse Port Forwarding** (Connects physical Android device to local backend server):
   ```bash
   adb reverse tcp:8000 tcp:8000
   ```

2. **Assemble Debug APK**:
   ```bash
   ./gradlew assembleDebug
   ```

3. **Install & Launch on Connected Device**:
   ```bash
   adb install -r app/build/outputs/apk/debug/app-debug.apk
   adb shell am start -n com.kintsugi.app.debug/com.kintsugi.app.MainActivity
   ```

4. **Assemble Signed Release APK / AAB**:
   ```bash
   ./gradlew assembleRelease
   ./gradlew bundleRelease
   ```
