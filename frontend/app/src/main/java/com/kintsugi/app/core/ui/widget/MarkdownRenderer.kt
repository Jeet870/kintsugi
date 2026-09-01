package com.kintsugi.app.core.ui.widget

import android.content.Context
import android.widget.TextView
import io.noties.markwon.Markwon

/**
 * Reusable Markdown Rendering Helper for the Kintsugi Design System.
 * Powered by Markwon for rich, formatted headings, lists, bold, italics, quotes, and code blocks.
 */
object MarkdownRenderer {

    private var markwonInstance: Markwon? = null

    private fun getMarkwon(context: Context): Markwon {
        return markwonInstance ?: synchronized(this) {
            markwonInstance ?: Markwon.create(context.applicationContext).also { markwonInstance = it }
        }
    }

    /**
     * Renders markdown text into the specified TextView.
     */
    fun render(textView: TextView, markdownContent: String?) {
        if (markdownContent.isNullOrBlank()) {
            textView.text = ""
            return
        }
        val markwon = getMarkwon(textView.context)
        markwon.setMarkdown(textView, markdownContent)
    }
}
