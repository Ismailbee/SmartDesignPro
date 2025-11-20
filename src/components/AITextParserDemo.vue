<!-- AI Text Parser Demo Component -->
<template>
  <div class="max-w-4xl mx-auto p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
        🤖 AI Text Parser Demo
      </h2>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Test the AI-powered organization text parser. Paste any business text below!
      </p>
    </div>

    <!-- Configuration Status -->
    <div class="mb-4 p-3 rounded-lg border" :class="aiStatus.isConfigured ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'">
      <div class="flex items-center gap-2">
        <svg v-if="aiStatus.isConfigured" class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-else class="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <span class="font-medium" :class="aiStatus.isConfigured ? 'text-green-800 dark:text-green-300' : 'text-yellow-800 dark:text-yellow-300'">
          {{ aiStatus.isConfigured ? `AI Service Active: ${aiStatus.primaryService}` : 'AI Service Not Configured' }}
        </span>
      </div>
      <p v-if="!aiStatus.isConfigured" class="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
        Add your AI API key to enable intelligent parsing. See AI_SETUP_GUIDE.md for instructions.
      </p>
    </div>

    <!-- Test Input -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Test Text Input
      </label>
      <textarea
        v-model="testText"
        rows="6"
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
        placeholder="Paste business text here or use the sample..."
      ></textarea>
      
      <!-- Sample Text Buttons -->
      <div class="mt-2 flex gap-2 flex-wrap">
        <button
          @click="loadSampleText('natural')"
          class="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
        >
          Load Natural Text Sample
        </button>
        <button
          @click="loadSampleText('structured')"
          class="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
        >
          Load Structured Sample
        </button>
        <button
          @click="loadSampleText('messy')"
          class="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
        >
          Load Messy Text Sample
        </button>
        <button
          @click="testText = ''"
          class="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
        >
          Clear
        </button>
      </div>
    </div>

    <!-- Parse Button -->
    <div class="mb-4">
      <button
        @click="parseText"
        :disabled="!testText.trim() || isLoading"
        class="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <svg v-if="isLoading" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        {{ isLoading ? 'Parsing with AI...' : 'Parse Text' }}
      </button>
    </div>

    <!-- Results -->
    <div v-if="result" class="p-4 border rounded-lg" :class="result.method === 'ai' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <svg v-if="result.method === 'ai'" class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <svg v-else class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {{ result.method === 'ai' ? 'AI Parsed Results' : 'Regex Parsed Results' }}
        </h3>
        <span 
          class="text-xs px-2 py-1 rounded-full font-medium"
          :class="{
            'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300': result.confidence === 'high',
            'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300': result.confidence === 'medium',
            'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300': result.confidence === 'low'
          }"
        >
          {{ result.confidence }} confidence
        </span>
      </div>

      <!-- Extracted Data -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-if="result.organizationName" class="p-3 bg-white dark:bg-slate-800 rounded border">
          <strong class="text-green-700 dark:text-green-400">Organization:</strong>
          <p class="text-gray-800 dark:text-gray-200 mt-1">{{ result.organizationName }}</p>
        </div>
        
        <div v-if="result.subtitle" class="p-3 bg-white dark:bg-slate-800 rounded border">
          <strong class="text-blue-700 dark:text-blue-400">Subtitle:</strong>
          <p class="text-gray-800 dark:text-gray-200 mt-1">{{ result.subtitle }}</p>
        </div>
        
        <div v-for="(address, index) in result.addresses" :key="'addr-' + index" class="p-3 bg-white dark:bg-slate-800 rounded border">
          <strong class="text-orange-700 dark:text-orange-400">{{ index === 0 ? 'Head Office:' : `Branch ${index}:` }}</strong>
          <p class="text-gray-800 dark:text-gray-200 mt-1">{{ address }}</p>
        </div>
        
        <div v-for="(phone, index) in result.phones" :key="'phone-' + index" class="p-3 bg-white dark:bg-slate-800 rounded border">
          <strong class="text-red-700 dark:text-red-400">Phone {{ index + 1 }}:</strong>
          <p class="text-gray-800 dark:text-gray-200 mt-1 font-bold">{{ phone }}</p>
        </div>
        
        <div v-for="(email, index) in result.emails" :key="'email-' + index" class="p-3 bg-white dark:bg-slate-800 rounded border">
          <strong class="text-purple-700 dark:text-purple-400">Email {{ index + 1 }}:</strong>
          <p class="text-gray-800 dark:text-gray-200 mt-1">{{ email }}</p>
        </div>
        
        <div v-for="(website, index) in result.websites" :key="'website-' + index" class="p-3 bg-white dark:bg-slate-800 rounded border">
          <strong class="text-cyan-700 dark:text-cyan-400">Website {{ index + 1 }}:</strong>
          <p class="text-gray-800 dark:text-gray-200 mt-1">{{ website }}</p>
        </div>
      </div>

      <!-- Processing Time -->
      <div v-if="processingTime" class="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Processed in {{ processingTime }}ms using {{ result.method === 'ai' ? aiStatus.primaryService : 'Regex Parser' }}
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
      <h3 class="font-semibold text-red-800 dark:text-red-300 mb-2">Parsing Error</h3>
      <p class="text-sm text-red-700 dark:text-red-400">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import { aiTextParser } from '@/utils/aiTextParser.js';
import { isAiConfigured, getPrimaryAiService } from '@/config/aiConfig.js';

export default defineComponent({
  name: 'AITextParserDemo',
  setup() {
    const testText = ref('');
    const result = ref(null);
    const error = ref('');
    const isLoading = ref(false);
    const processingTime = ref(0);
    const aiStatus = ref({
      isConfigured: false,
      primaryService: 'FALLBACK'
    });

    // Sample texts for testing
    const sampleTexts = {
      natural: `TechCorp Solutions is a leading software development company headquartered at 123 Innovation Drive, Silicon Valley, CA 94025. Our company motto is "Transforming Ideas into Reality". You can reach our main office at (555) 123-TECH or email us at hello@techcorp.com. We also have a branch office located at 456 Research Blvd, Austin, TX 78701 with phone number +1-512-555-0199. Visit our website at www.techcorp.com for more information about our services.`,
      
      structured: `(ABC Company Limited)
"Your Trusted Business Partner"
Address: 123 Main Street, Downtown Business District, New York, NY 10001
Phone: +1-555-123-4567
Contact: info@abccompany.com

Address: 456 Branch Avenue, Suburban Plaza, Los Angeles, CA 90210
Tel: +1-555-987-6543
Call: support@abccompany.com`,

      messy: `ABC CORP
leading provider of solutions
located somewhere around 789 messy street
call us maybe (555) CALL-NOW
email might be contact@abc.co.uk
"innovation through excellence"
another office: 321 scattered ave
phone: 555.999.8888
www.abc-corp.com
secondary: backup@abc.co.uk`
    };

    const loadSampleText = (type) => {
      testText.value = sampleTexts[type] || '';
    };

    const parseText = async () => {
      if (!testText.value.trim()) return;

      isLoading.value = true;
      error.value = '';
      result.value = null;
      
      const startTime = Date.now();

      try {
        const parseResult = await aiTextParser.parseOrganizationText(testText.value);
        result.value = parseResult;
        processingTime.value = Date.now() - startTime;
      } catch (err) {
        error.value = err.message || 'An error occurred during parsing';
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(() => {
      aiStatus.value = {
        isConfigured: isAiConfigured(),
        primaryService: getPrimaryAiService()
      };

      // Load a sample text by default
      loadSampleText('natural');
    });

    return {
      testText,
      result,
      error,
      isLoading,
      processingTime,
      aiStatus,
      loadSampleText,
      parseText
    };
  }
});
</script>