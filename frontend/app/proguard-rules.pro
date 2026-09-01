-keep class com.kintsugi.app.core.model.** { *; }
-keep class com.kintsugi.app.core.database.entity.** { *; }
-keepclassmembers class * {
    @com.squareup.moshi.Json *;
}
