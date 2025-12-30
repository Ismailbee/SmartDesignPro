import { ref, computed } from 'vue';

export function useDarkMode() {
  const isDarkMode = ref(false);

  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value;
    document.documentElement.classList.toggle('dark', isDarkMode.value);
  };

  const darkModeClass = computed(() => (isDarkMode.value ? 'dark' : 'light'));

  return {
    isDarkMode,
    toggleDarkMode,
    darkModeClass,
  };
}
