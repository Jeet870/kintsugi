package com.kintsugi.app.features.settings.data

import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.Paint
import android.graphics.pdf.PdfDocument
import androidx.core.content.FileProvider
import com.kintsugi.app.core.database.entity.JournalEntryEntity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Utility for exporting user wellness data into PDF, CSV, or JSON format.
 * Generates file artifacts and launches the Android Share Sheet safely via FileProvider.
 */
object ExportManager {

    enum class ExportFormat {
        PDF, CSV, JSON
    }

    suspend fun exportData(
        context: Context,
        format: ExportFormat,
        journalEntries: List<JournalEntryEntity>,
        activeStreak: Int = 3
    ) = withContext(Dispatchers.IO) {
        val file = when (format) {
            ExportFormat.PDF -> generatePdfReport(context, journalEntries, activeStreak)
            ExportFormat.CSV -> generateCsvExport(context, journalEntries)
            ExportFormat.JSON -> generateJsonExport(context, journalEntries, activeStreak)
        }

        val contentUri = FileProvider.getUriForFile(
            context,
            "${context.packageName}.fileprovider",
            file
        )

        val shareIntent = Intent(Intent.ACTION_SEND).apply {
            type = when (format) {
                ExportFormat.PDF -> "application/pdf"
                ExportFormat.CSV -> "text/csv"
                ExportFormat.JSON -> "application/json"
            }
            putExtra(Intent.EXTRA_STREAM, contentUri)
            putExtra(Intent.EXTRA_SUBJECT, "Kintsugi Wellness Data Export")
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }

        val chooserIntent = Intent.createChooser(shareIntent, "Export Wellness Data")
        chooserIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(chooserIntent)
    }

    private fun generatePdfReport(
        context: Context,
        journalEntries: List<JournalEntryEntity>,
        activeStreak: Int
    ): File {
        val document = PdfDocument()
        val pageInfo = PdfDocument.PageInfo.Builder(595, 842, 1).create() // A4 Size
        val page = document.startPage(pageInfo)
        val canvas = page.canvas

        val paint = Paint().apply {
            isAntiAlias = true
        }

        // Header Background
        paint.color = Color.parseColor("#1A1232")
        canvas.drawRect(0f, 0f, 595f, 100f, paint)

        // Title
        paint.color = Color.parseColor("#FFFFFF")
        paint.textSize = 22f
        paint.isFakeBoldText = true
        canvas.drawText("Kintsugi Wellness Report", 40f, 50f, paint)

        paint.color = Color.parseColor("#C9B8FF")
        paint.textSize = 12f
        paint.isFakeBoldText = false
        val dateFormat = SimpleDateFormat("MMMM dd, yyyy", Locale.getDefault())
        canvas.drawText("Generated on ${dateFormat.format(Date())}", 40f, 75f, paint)

        // Summary Stats
        var yPos = 140f
        paint.color = Color.parseColor("#09090B")
        paint.textSize = 16f
        paint.isFakeBoldText = true
        canvas.drawText("Executive Summary", 40f, yPos, paint)

        yPos += 24f
        paint.color = Color.parseColor("#4A4A5A")
        paint.textSize = 12f
        paint.isFakeBoldText = false
        canvas.drawText("Active Wellness Streak: $activeStreak Days", 40f, yPos, paint)
        canvas.drawText("Total Journal Reflections: ${journalEntries.size}", 250f, yPos, paint)

        yPos += 40f
        paint.color = Color.parseColor("#09090B")
        paint.textSize = 16f
        paint.isFakeBoldText = true
        canvas.drawText("Journal Entries Summary", 40f, yPos, paint)

        yPos += 20f
        paint.color = Color.parseColor("#71717A")
        paint.textSize = 10f
        paint.isFakeBoldText = false

        journalEntries.take(8).forEach { entry ->
            yPos += 25f
            if (yPos < 780f) {
                paint.color = Color.parseColor("#18181B")
                paint.textSize = 12f
                paint.isFakeBoldText = true
                canvas.drawText(entry.title.take(35), 40f, yPos, paint)

                paint.color = Color.parseColor("#71717A")
                paint.textSize = 10f
                paint.isFakeBoldText = false
                val snippet = entry.content.replace("\n", " ").take(60)
                canvas.drawText(snippet, 40f, yPos + 14f, paint)
                yPos += 14f
            }
        }

        document.finishPage(page)

        val file = File(context.cacheDir, "kintsugi_wellness_report.pdf")
        FileOutputStream(file).use { out ->
            document.writeTo(out)
        }
        document.close()
        return file
    }

    private fun generateCsvExport(
        context: Context,
        journalEntries: List<JournalEntryEntity>
    ): File {
        val file = File(context.cacheDir, "kintsugi_wellness_data.csv")
        file.printWriter().use { out ->
            out.println("ID,Date,Title,MoodTag,ContentSnippet")
            journalEntries.forEach { entry ->
                val safeTitle = entry.title.replace("\"", "\"\"")
                val safeSnippet = entry.content.replace("\n", " ").replace("\"", "\"\"").take(100)
                out.println("${entry.id},\"${entry.updatedAt}\",\"$safeTitle\",\"${entry.moodTag}\",\"$safeSnippet\"")
            }
        }
        return file
    }

    private fun generateJsonExport(
        context: Context,
        journalEntries: List<JournalEntryEntity>,
        activeStreak: Int
    ): File {
        val file = File(context.cacheDir, "kintsugi_wellness_data.json")
        val jsonStringBuilder = StringBuilder()
        jsonStringBuilder.append("{\n")
        jsonStringBuilder.append("  \"exportedAt\": \"${Date()}\",\n")
        jsonStringBuilder.append("  \"activeStreak\": $activeStreak,\n")
        jsonStringBuilder.append("  \"journalEntries\": [\n")
        journalEntries.forEachIndexed { index, entry ->
            val safeTitle = entry.title.replace("\"", "\\\"").replace("\n", " ")
            val safeContent = entry.content.replace("\"", "\\\"").replace("\n", "\\n")
            jsonStringBuilder.append("    {\n")
            jsonStringBuilder.append("      \"id\": ${entry.id},\n")
            jsonStringBuilder.append("      \"title\": \"$safeTitle\",\n")
            jsonStringBuilder.append("      \"moodTag\": \"${entry.moodTag}\",\n")
            jsonStringBuilder.append("      \"content\": \"$safeContent\"\n")
            jsonStringBuilder.append("    }${if (index < journalEntries.size - 1) "," else ""}\n")
        }
        jsonStringBuilder.append("  ]\n")
        jsonStringBuilder.append("}")

        file.writeText(jsonStringBuilder.toString())
        return file
    }
}
