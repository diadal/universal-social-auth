import { createApp } from 'vue';
import App from './App.vue';

// Browser-only: the popup is opened from a click handler inside App.vue,
// never during render, so this is safe for client-side Vue apps.
createApp(App).mount('#app');
