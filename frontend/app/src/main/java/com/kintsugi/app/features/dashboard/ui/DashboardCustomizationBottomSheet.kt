package com.kintsugi.app.features.dashboard.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.recyclerview.widget.ItemTouchHelper
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.bottomsheet.BottomSheetBehavior
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.kintsugi.app.R
import com.kintsugi.app.databinding.BottomSheetDashboardCustomizationBinding
import com.kintsugi.app.databinding.ItemCustomizationRowBinding
import com.kintsugi.app.features.dashboard.data.DashboardPreferencesRepository
import com.kintsugi.app.features.dashboard.data.QuickActionModel
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import java.util.Collections
import javax.inject.Inject

/**
 * Material Bottom Sheet Drawer allowing users to personalize Dashboard Quick Action cards,
 * reorder cards via drag-and-drop, toggle visibility, and persist preferences.
 */
@AndroidEntryPoint
class DashboardCustomizationBottomSheet : BottomSheetDialogFragment() {

    private var _binding: BottomSheetDashboardCustomizationBinding? = null
    private val binding get() = _binding!!

    @Inject
    lateinit var preferencesRepository: DashboardPreferencesRepository

    private val customList = mutableListOf<QuickActionModel>()
    private var initialList = listOf<QuickActionModel>()
    private lateinit var adapter: CustomizationAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = BottomSheetDashboardCustomizationBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Set expanded height (90% of screen height)
        (dialog as? BottomSheetDialog)?.behavior?.apply {
            state = BottomSheetBehavior.STATE_EXPANDED
            skipCollapsed = true
        }

        setupAdapter()
        setupItemTouchHelper()
        setupActions()
        observeData()
    }

    private fun setupAdapter() {
        adapter = CustomizationAdapter(
            items = customList,
            onToggle = { index, isChecked ->
                val currentVisibleCount = customList.count { it.isVisible }
                if (isChecked && currentVisibleCount >= 8) {
                    Toast.makeText(requireContext(), "You can pin up to 8 Quick Actions.", Toast.LENGTH_SHORT).show()
                    adapter.notifyItemChanged(index)
                    return@CustomizationAdapter
                }

                customList[index] = customList[index].copy(isVisible = isChecked)
                adapter.notifyItemChanged(index)
                updateSaveButtonState()
            }
        )
        binding.rvCustomizationList.adapter = adapter
    }

    private fun setupItemTouchHelper() {
        val touchHelper = ItemTouchHelper(object : ItemTouchHelper.SimpleCallback(
            ItemTouchHelper.UP or ItemTouchHelper.DOWN, 0
        ) {
            override fun onMove(
                recyclerView: RecyclerView,
                viewHolder: RecyclerView.ViewHolder,
                target: RecyclerView.ViewHolder
            ): Boolean {
                val fromPos = viewHolder.bindingAdapterPosition
                val toPos = target.bindingAdapterPosition

                Collections.swap(customList, fromPos, toPos)
                adapter.notifyItemMoved(fromPos, toPos)
                updateSaveButtonState()
                return true
            }

            override fun onSwiped(viewHolder: RecyclerView.ViewHolder, direction: Int) {}
        })

        touchHelper.attachToRecyclerView(binding.rvCustomizationList)
    }

    private fun setupActions() {
        binding.btnSaveCustomization.setOnClickListener {
            val visibleCount = customList.count { it.isVisible }
            if (visibleCount > 8) {
                binding.tvLimitWarning.visibility = View.VISIBLE
                return@setOnClickListener
            }

            viewLifecycleOwner.lifecycleScope.launch {
                preferencesRepository.savePreferences(customList)
                Toast.makeText(requireContext(), "Dashboard updated ✦", Toast.LENGTH_SHORT).show()
                dismiss()
            }
        }

        binding.btnResetDefaults.setOnClickListener {
            confirmReset()
        }
    }

    private fun confirmReset() {
        com.kintsugi.app.core.ui.dialog.KintsugiConfirmationDialog.show(
            fragmentManager = childFragmentManager,
            title = "Reset Dashboard?",
            subtitle = "This will restore your Quick Actions to their default layout.",
            confirmButtonText = "Reset",
            cancelButtonText = "Cancel",
            iconRes = R.drawable.ic_drag_handle,
            onConfirm = {
                viewLifecycleOwner.lifecycleScope.launch {
                    preferencesRepository.resetToDefault()
                    Toast.makeText(requireContext(), "Dashboard reset to defaults ✦", Toast.LENGTH_SHORT).show()
                    dismiss()
                }
            }
        )
    }

    private fun observeData() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                preferencesRepository.actionsFlow.collect { actions ->
                    if (actions.isNotEmpty() && initialList.isEmpty()) {
                        initialList = actions
                        customList.clear()
                        customList.addAll(actions)
                        adapter.notifyDataSetChanged()
                        updateSaveButtonState()
                    }
                }
            }
        }
    }

    private fun updateSaveButtonState() {
        val hasChanges = customList != initialList
        binding.btnSaveCustomization.isEnabled = hasChanges
        binding.btnSaveCustomization.alpha = if (hasChanges) 1.0f else 0.5f

        val visibleCount = customList.count { it.isVisible }
        if (visibleCount > 8) {
            binding.tvLimitWarning.visibility = View.VISIBLE
        } else {
            binding.tvLimitWarning.visibility = View.GONE
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    class CustomizationAdapter(
        private val items: List<QuickActionModel>,
        private val onToggle: (Int, Boolean) -> Unit
    ) : RecyclerView.Adapter<CustomizationAdapter.ViewHolder>() {

        class ViewHolder(val binding: ItemCustomizationRowBinding) : RecyclerView.ViewHolder(binding.root)

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
            val binding = ItemCustomizationRowBinding.inflate(
                LayoutInflater.from(parent.context), parent, false
            )
            return ViewHolder(binding)
        }

        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            val item = items[position]
            holder.binding.apply {
                tvActionTitle.text = item.title
                tvActionDesc.text = item.subtitle
                ivActionIcon.setImageResource(item.iconResId)
                ivActionIcon.setColorFilter(item.tintColor)

                // Detach listener before setting checked state to avoid recursion
                switchActionVisible.setOnCheckedChangeListener(null)
                switchActionVisible.isChecked = item.isVisible

                if (item.isVisible) {
                    root.alpha = 1.0f
                } else {
                    root.alpha = 0.5f
                }

                switchActionVisible.setOnCheckedChangeListener { _, isChecked ->
                    onToggle(holder.bindingAdapterPosition, isChecked)
                }
            }
        }

        override fun getItemCount(): Int = items.size
    }
}
