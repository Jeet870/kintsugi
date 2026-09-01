package com.kintsugi.app.core.common

import android.text.Spanned
import androidx.core.text.HtmlCompat

/**
 * Utility functions for parsing HTML content (headings, blockquotes, paragraphs, lists) into formatted text.
 */
fun String.parseAsHtml(): CharSequence {
    if (this.isBlank()) return ""
    return if (this.contains("<") && this.contains(">")) {
        HtmlCompat.fromHtml(this, HtmlCompat.FROM_HTML_MODE_COMPACT)
    } else {
        this
    }
}

fun String.stripHtmlTags(): String {
    if (this.isBlank()) return ""
    return if (this.contains("<") && this.contains(">")) {
        HtmlCompat.fromHtml(this, HtmlCompat.FROM_HTML_MODE_COMPACT).toString().trim()
    } else {
        this.trim()
    }
}
