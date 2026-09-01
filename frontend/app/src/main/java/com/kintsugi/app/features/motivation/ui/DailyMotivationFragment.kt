package com.kintsugi.app.features.motivation.ui

import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import com.kintsugi.app.R
import com.kintsugi.app.core.common.Result
import com.kintsugi.app.core.model.ContentDto
import com.kintsugi.app.core.navigation.Destinations
import com.kintsugi.app.core.navigation.navigateSafe
import com.kintsugi.app.core.navigation.popBackStackSafe
import com.kintsugi.app.databinding.FragmentDailyMotivationBinding
import com.kintsugi.app.databinding.ItemSelfCareInteractiveBinding
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

data class SelfCareTask(
    val id: String,
    val emoji: String,
    val title: String,
    val description: String
)

/**
 * Editorial Daily Inspiration Fragment matching Kintsugi's modern violet design system.
 */
@AndroidEntryPoint
class DailyMotivationFragment : Fragment() {

    private var _binding: FragmentDailyMotivationBinding? = null
    private val binding get() = _binding!!

    private val viewModel: DailyMotivationViewModel by viewModels()

    private var isHeroFavorite = false
    private var currentAffirmationIndex = 0
    private var currentAffirmations: List<String> = emptyList()

    private val selfCareTasks = listOf(
        SelfCareTask("water", "💧", "Drink Water", "Hydrate your body with quiet mindfulness."),
        SelfCareTask("breath", "🧘", "Take Deep Breaths", "Spend 5 minutes centering your breath."),
        SelfCareTask("stretch", "🌿", "Stretch & Move", "Gentle movement to ease body tension."),
        SelfCareTask("outside", "🌅", "Go Outside", "Feel fresh air and sunlight on your face."),
        SelfCareTask("journal", "📝", "Write Journal Entry", "Reflect on one positive moment from today."),
        SelfCareTask("mood", "😊", "Mood Check-in", "Log how you are feeling in your sanctuary.")
    )

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentDailyMotivationBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupHeader()
        setupGreetingHeader()
        setupQuoteActions()
        setupAffirmationCarousel()
        setupSelfCareChecklist()
        setupContinueJourney()
        observeViewModel()
    }

    private fun setupHeader() {
        binding.toolbar.apply {
            setTitle("Daily Inspiration")
            setSubtitle("Small moments create lasting change.")
        }
    }

    private fun setupGreetingHeader() {
        val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
        val greetingText = when (hour) {
            in 4..11 -> "Good Morning 🌅"
            in 12..17 -> "Good Afternoon ☀️"
            else -> "Good Evening 🌙"
        }
        binding.tvGreeting.text = greetingText

        val dateFormat = SimpleDateFormat("EEEE, MMMM d", Locale.getDefault())
        binding.tvHeroDate.text = dateFormat.format(Date())
    }

    private fun setupQuoteActions() {
        // Load favorite state
        val prefs = requireContext().getSharedPreferences("kintsugi_motivation_prefs", Context.MODE_PRIVATE)
        isHeroFavorite = prefs.getBoolean("hero_quote_favorite", false)
        updateFavoriteIconState()

        binding.btnFavoriteHero.setOnClickListener {
            isHeroFavorite = !isHeroFavorite
            prefs.edit().putBoolean("hero_quote_favorite", isHeroFavorite).apply()
            updateFavoriteIconState()

            val msg = if (isHeroFavorite) "Saved to your favorites ❤️" else "Removed from favorites"
            Toast.makeText(requireContext(), msg, Toast.LENGTH_SHORT).show()
        }

        binding.btnCopyHero.setOnClickListener {
            copyQuoteToClipboard()
        }

        binding.btnShareHero.setOnClickListener {
            shareInspiration()
        }

        binding.btnRefreshHero.setOnClickListener {
            if (currentAffirmations.isNotEmpty()) {
                currentAffirmationIndex = (0 until currentAffirmations.size).random()
                updateAffirmationDisplay()
            }
            Toast.makeText(requireContext(), "Shuffled new reflection ✦", Toast.LENGTH_SHORT).show()
        }

        binding.btnActionSave.setOnClickListener {
            Toast.makeText(requireContext(), "Saved to your Sanctuary Collection ✨", Toast.LENGTH_SHORT).show()
        }

        binding.btnActionShare.setOnClickListener {
            shareInspiration()
        }

        binding.btnActionDownload.setOnClickListener {
            copyQuoteToClipboard()
        }

        binding.btnActionShuffle.setOnClickListener {
            if (currentAffirmations.isNotEmpty()) {
                currentAffirmationIndex = (0 until currentAffirmations.size).random()
                updateAffirmationDisplay()
            }
            Toast.makeText(requireContext(), "Shuffled new reflection ✦", Toast.LENGTH_SHORT).show()
        }
    }

    private fun updateFavoriteIconState() {
        if (isHeroFavorite) {
            binding.ivHeroFavoriteIc.setImageResource(R.drawable.ic_emergency_filled)
            binding.ivHeroFavoriteIc.setColorFilter(Color.parseColor("#FB7185"))
        } else {
            binding.ivHeroFavoriteIc.setImageResource(R.drawable.ic_emergency_outline)
            binding.ivHeroFavoriteIc.setColorFilter(Color.parseColor("#FB7185"))
        }
    }

    private fun setupAffirmationCarousel() {
        binding.btnAffirmationPrev.setOnClickListener {
            if (currentAffirmations.isNotEmpty()) {
                currentAffirmationIndex = if (currentAffirmationIndex > 0) currentAffirmationIndex - 1 else currentAffirmations.size - 1
                updateAffirmationDisplay()
            }
        }

        binding.btnAffirmationNext.setOnClickListener {
            if (currentAffirmations.isNotEmpty()) {
                currentAffirmationIndex = (currentAffirmationIndex + 1) % currentAffirmations.size
                updateAffirmationDisplay()
            }
        }

        binding.btnSeeAllAffirmations.setOnClickListener {
            Toast.makeText(requireContext(), "Daily Affirmations Sanctuary", Toast.LENGTH_SHORT).show()
        }
    }

    private fun updateAffirmationDisplay() {
        if (currentAffirmations.isNotEmpty()) {
            binding.tvAffirmationText.text = currentAffirmations[currentAffirmationIndex]

            // Update Indicator Dots
            val dots = listOf(binding.dotAff0, binding.dotAff1, binding.dotAff2)
            dots.forEachIndexed { index, dot ->
                if (index == currentAffirmationIndex % dots.size) {
                    dot.backgroundTintList = android.content.res.ColorStateList.valueOf(Color.parseColor("#A855F7"))
                } else {
                    dot.backgroundTintList = android.content.res.ColorStateList.valueOf(Color.parseColor("#3B2A5E"))
                }
            }
        }
    }

    private fun setupSelfCareChecklist() {
        binding.containerSelfCareChecklist.removeAllViews()
        val prefs = requireContext().getSharedPreferences("kintsugi_self_care_prefs", Context.MODE_PRIVATE)

        selfCareTasks.forEach { task ->
            val itemBinding = ItemSelfCareInteractiveBinding.inflate(layoutInflater, binding.containerSelfCareChecklist, false)

            itemBinding.tvSelfCareEmoji.text = task.emoji
            itemBinding.tvSelfCareTitle.text = task.title
            itemBinding.tvSelfCareDesc.text = task.description

            val isChecked = prefs.getBoolean("task_${task.id}", false)
            itemBinding.cbSelfCare.isChecked = isChecked

            itemBinding.cbSelfCare.setOnCheckedChangeListener { _, checked ->
                prefs.edit().putBoolean("task_${task.id}", checked).apply()
                updateChecklistProgress()
            }

            itemBinding.root.setOnClickListener {
                itemBinding.cbSelfCare.isChecked = !itemBinding.cbSelfCare.isChecked
            }

            binding.containerSelfCareChecklist.addView(itemBinding.root)
        }

        updateChecklistProgress()
    }

    private fun updateChecklistProgress() {
        val prefs = requireContext().getSharedPreferences("kintsugi_self_care_prefs", Context.MODE_PRIVATE)
        val completedCount = selfCareTasks.count { prefs.getBoolean("task_${it.id}", false) }
        val total = selfCareTasks.size
        val percent = ((completedCount.toFloat() / total.toFloat()) * 100).toInt()

        binding.pbSelfCareProgress.progress = percent
        binding.tvSelfCareProgressText.text = "$completedCount / $total ($percent%)"
    }

    private fun setupContinueJourney() {
        binding.btnOpenJournal.setOnClickListener {
            navigateSafe(Destinations.Journal.EDITOR_DESTINATION_ID)
        }

        binding.btnContinueJournal.setOnClickListener {
            navigateSafe(Destinations.Journal.DESTINATION_ID)
        }

        binding.btnContinueAi.setOnClickListener {
            navigateSafe(Destinations.AICompanion.DESTINATION_ID)
        }

        binding.btnContinueBreathing.setOnClickListener {
            navigateSafe(Destinations.Breathing.DESTINATION_ID)
        }

        binding.btnCrisisGetHelp.setOnClickListener {
            navigateSafe(Destinations.Emergency.DESTINATION_ID)
        }
    }

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.contentState.collect { result ->
                    when (result) {
                        is Result.Success -> renderContent(result.data)
                        is Result.Error -> {
                            Toast.makeText(requireContext(), "Unable to load today's inspiration.", Toast.LENGTH_SHORT).show()
                        }
                        else -> {}
                    }
                }
            }
        }
    }

    private fun renderContent(content: ContentDto) {
        val displayQuote = if (content.quote.isNotBlank()) {
            content.quote
        } else {
            "Even the cracks in your heart are stitches holding your courage together."
        }
        binding.tvDailyQuote.text = "\"$displayQuote\""
        binding.tvAuthor.text = "— ${content.author ?: "Kintsugi Guide"}"

        currentAffirmations = if (content.affirmations.isNotEmpty()) {
            content.affirmations
        } else {
            listOf(
                "I am a garden where resilience and kindness grow side by side.",
                "I am enough just as I am.",
                "Today is a fresh beginning filled with possibility.",
                "I deserve peace, space, and self-compassion.",
                "My feelings matter, and I honor my journey."
            )
        }
        currentAffirmationIndex = 0
        updateAffirmationDisplay()
    }

    private fun copyQuoteToClipboard() {
        val quote = binding.tvDailyQuote.text.toString()
        val clipboard = requireContext().getSystemService(Context.CLIPBOARD_SERVICE) as android.content.ClipboardManager
        val clip = android.content.ClipData.newPlainText("Quote", quote)
        clipboard.setPrimaryClip(clip)
        Toast.makeText(requireContext(), "Quote copied to clipboard 📋", Toast.LENGTH_SHORT).show()
    }

    private fun shareInspiration() {
        val quoteText = binding.tvDailyQuote.text.toString()
        val authorText = binding.tvAuthor.text.toString()
        val shareIntent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_TEXT, "$quoteText\n\n$authorText\nShared from Kintsugi Mindfulness ✦")
        }
        startActivity(Intent.createChooser(shareIntent, "Share Today's Inspiration"))
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
