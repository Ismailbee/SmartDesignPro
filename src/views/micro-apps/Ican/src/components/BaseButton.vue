<template>
  <button
    :class="buttonClasses"
    :type="type"
    @click="$emit('click')"
    :disabled="disabled"
  >
    <slot></slot>
  </button>
</template>

<script>
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'BaseButton',
  props: {
    type: {
      type: String,
      default: 'button',
    },
    variant: {
      type: String,
      default: 'primary',
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large', 'lg'].includes(value),
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const buttonClasses = computed(() => [
      'base-button',
      `btn-${props.variant}`,
      `btn-${props.size}`,
      { 'btn-disabled': props.disabled },
    ]);

    return {
      buttonClasses,
    };
  },
});
</script>

<style scoped>
.base-button {
  @apply px-4 py-2 rounded focus:outline-none transition duration-200 flex items-center justify-center;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800;
}

.btn-secondary {
  @apply bg-slate-600 text-white hover:bg-slate-700 active:bg-slate-800;
}

.btn-medium {
  @apply text-base;
}

.btn-small {
  @apply text-sm;
}

.btn-lg {
  @apply text-lg px-6 py-3;
}

.btn-disabled {
  @apply opacity-50 cursor-not-allowed;
}
</style>