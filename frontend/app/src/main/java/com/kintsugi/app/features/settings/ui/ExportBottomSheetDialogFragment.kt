package com.kintsugi.app.features.settings.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.FragmentManager
import androidx.lifecycle.lifecycleScope
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.kintsugi.app.R
import com.kintsugi.app.databinding.BottomSheetExportDataBinding
import com.kintsugi.app.features.settings.data.ExportManager
import kotlinx.coroutines.launch

import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.firstOrNull
import javax.inject.Inject

/**
 * Bottom Sheet Dialog allowing users to select PDF, CSV, or JSON format for wellness data export.
 */
@AndroidEntryPoint
class ExportBottomSheetDialogFragment : BottomSheetDialogFragment() {

    @Inject
    lateinit var journalRepository: com.kintsugi.app.features.journal.data.JournalRepository

    private var _binding: BottomSheetExportDataBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = BottomSheetExportDataBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.btnExportPdf.setOnClickListener {
            performExport(ExportManager.ExportFormat.PDF)
        }

        binding.btnExportCsv.setOnClickListener {
            performExport(ExportManager.ExportFormat.CSV)
        }

        binding.btnExportJson.setOnClickListener {
            performExport(ExportManager.ExportFormat.JSON)
        }
    }

    private fun performExport(format: ExportManager.ExportFormat) {
        lifecycleScope.launch {
            binding.progressBar.visibility = View.VISIBLE
            val entries = journalRepository.observeEntries().firstOrNull() ?: emptyList()
            ExportManager.exportData(requireContext(), format, entries, 3)
            binding.progressBar.visibility = View.GONE
            dismiss()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        fun show(fragmentManager: FragmentManager) {
            ExportBottomSheetDialogFragment().show(fragmentManager, "ExportBottomSheet")
        }
    }
}
