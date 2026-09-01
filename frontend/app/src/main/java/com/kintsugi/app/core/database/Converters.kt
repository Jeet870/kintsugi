package com.kintsugi.app.core.database

import androidx.room.TypeConverter
import java.time.Instant
import java.time.LocalDate

class Converters {

    @TypeConverter
    fun fromEpochMilli(value: Long?): Instant? = value?.let { Instant.ofEpochMilli(it) }

    @TypeConverter
    fun toEpochMilli(instant: Instant?): Long? = instant?.toEpochMilli()

    @TypeConverter
    fun fromIsoString(value: String?): LocalDate? = value?.let { LocalDate.parse(it) }

    @TypeConverter
    fun toIsoString(date: LocalDate?): String? = date?.toString()
}
