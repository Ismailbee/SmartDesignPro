import { ref, type Ref } from 'vue'
import type { ChatMessage, MessageAction, ExtractedInfo } from '../types'

type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface UseUploadChatFlowDeps {
  chatMessages: Ref<ChatMessage[]>
  scrollToBottom: () => void
  showNotification: (opts: { title: string; message: string; type: NotificationType }) => void

  // State we update based on chat decisions
  autoRemoveBackground: Ref<boolean>
  preGeneratedImageFile: Ref<File | null>
  pendingImageFile: Ref<File | null>
  pictureStepComplete: Ref<boolean>

  // Context needed to decide next prompt
  extractedInfo: Ref<ExtractedInfo>
  sizeStepComplete: Ref<boolean>
  awaitingSizeDecision: Ref<boolean>
  accumulatedDescription: Ref<string>
  formData: { description: string }
  requestWeddingPreviewGeneration: () => void
}

export interface UseUploadChatFlowReturn {
  preGenerationCroppedCandidates: Ref<File[]>
  pendingPreGenerationMainCroppedFile: Ref<File | null>
  pendingPreGenerationExtraCroppedFiles: Ref<File[]>

  announcePreGenerationCroppingStart: (count: number) => void
  recordPreGenerationCrop: (croppedFile: File, previewDataUrl: string) => void
  promptForMainPhotoChoice: () => void
  announceAddingExtrasToPreview: (count: number) => void

  handleUploadChatAction: (actionType: string) => boolean
  resetUploadChatState: () => void
}

export function useUploadChatFlow(deps: UseUploadChatFlowDeps): UseUploadChatFlowReturn {
  const {
    chatMessages,
    scrollToBottom,
    autoRemoveBackground,
    preGeneratedImageFile,
    pendingImageFile,
    pictureStepComplete,
    extractedInfo,
    sizeStepComplete,
    awaitingSizeDecision,
    accumulatedDescription,
    formData,
    requestWeddingPreviewGeneration,
  } = deps

  const preGenerationCroppedCandidates = ref<File[]>([])
  const pendingPreGenerationMainCroppedFile = ref<File | null>(null)
  const pendingPreGenerationExtraCroppedFiles = ref<File[]>([])

  function pushAI(text: string, actions?: MessageAction[]) {
    chatMessages.value.push({
      id: Date.now(),
      text,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions,
    })
    scrollToBottom()
  }

  function pushUser(text: string, image?: string) {
    chatMessages.value.push({
      id: Date.now(),
      text,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      image,
    })
    scrollToBottom()
  }

  function resetUploadChatState() {
    preGenerationCroppedCandidates.value = []
    pendingPreGenerationMainCroppedFile.value = null
    pendingPreGenerationExtraCroppedFiles.value = []
  }

  function announcePreGenerationCroppingStart(count: number) {
    pushAI(`Got ${count} photos ✅\n\nI’ll crop them one by one now.`)
  }

  function recordPreGenerationCrop(croppedFile: File, previewDataUrl: string) {
    preGenerationCroppedCandidates.value.push(croppedFile)
    pushUser(`Photo ${preGenerationCroppedCandidates.value.length} cropped`, previewDataUrl)
  }

  function promptForMainPhotoChoice() {
    const total = preGenerationCroppedCandidates.value.length
    if (total <= 1) return

    const actions: MessageAction[] = Array.from({ length: total }).map((_, i) => ({
      type: `choose_main_${i}`,
      label: `Use Photo ${i + 1} as main`,
      variant: i === 0 ? 'primary' : 'secondary',
    }))

    pushAI(`All ${total} photos are cropped ✅\n\nWhich one should be the MAIN big picture?`, actions)
  }

  function announceAddingExtrasToPreview(count: number) {
    if (count <= 0) return
    pushAI(`Adding your extra photo(s) into the small top-right boxes...`)
  }

  function handleUploadChatAction(actionType: string): boolean {
    if (actionType.startsWith('choose_main_')) {
      const indexStr = actionType.replace('choose_main_', '')
      const index = Number.parseInt(indexStr, 10)
      const candidates = preGenerationCroppedCandidates.value
      if (!Number.isFinite(index) || index < 0 || index >= candidates.length) return true

      const main = candidates[index]
      const extras = candidates.filter((_, i) => i !== index)
      pendingPreGenerationMainCroppedFile.value = main
      pendingPreGenerationExtraCroppedFiles.value = extras
      preGenerationCroppedCandidates.value = []

      pushAI(
        `Great — I’ll use Photo ${index + 1} as the MAIN picture.\n\nDo you want me to remove the background from ALL your photos?`,
        [
          { type: 'bg_all_yes', label: 'Yes, remove background', variant: 'primary' },
          { type: 'bg_all_no', label: 'No, keep background', variant: 'secondary' },
        ]
      )
      return true
    }

    if (actionType === 'bg_all_yes' || actionType === 'bg_all_no') {
      const main = pendingPreGenerationMainCroppedFile.value
      if (!main) return true

      const shouldRemove = actionType === 'bg_all_yes'
      autoRemoveBackground.value = shouldRemove
      preGeneratedImageFile.value = main
      pendingImageFile.value = null
      pictureStepComplete.value = true
      pendingPreGenerationMainCroppedFile.value = null

      pushAI(
        shouldRemove
          ? "Got it! I’ll remove backgrounds for your photos. 🎨"
          : "Okay! I’ll keep the backgrounds. 📸"
      )

      const hasAllInfo =
        !!extractedInfo.value.names.name1 && !!extractedInfo.value.date && !!extractedInfo.value.courtesy
      const hasSize = sizeStepComplete.value || !!extractedInfo.value.size

      setTimeout(() => {
        if (hasAllInfo && hasSize) {
          pushAI('Perfect! Let me create your sticker now! 🎨')
          formData.description = accumulatedDescription.value
          setTimeout(() => requestWeddingPreviewGeneration(), 300)
        } else if (hasAllInfo && !sizeStepComplete.value) {
          pushAI("What size would you like the sticker? (e.g., '3x3' or 'default' for 4x4 inches)")
          awaitingSizeDecision.value = true
        }
      }, 250)

      return true
    }

    return false
  }

  return {
    preGenerationCroppedCandidates,
    pendingPreGenerationMainCroppedFile,
    pendingPreGenerationExtraCroppedFiles,

    announcePreGenerationCroppingStart,
    recordPreGenerationCrop,
    promptForMainPhotoChoice,
    announceAddingExtrasToPreview,

    handleUploadChatAction,
    resetUploadChatState,
  }
}
