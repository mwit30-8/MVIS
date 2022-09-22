// No-op on native. For offline support in native apps, check out expo-updates.

import type { ServiceWorkerRegistrationConfig } from "./serviceWorkerRegistration";

export function register(config?: ServiceWorkerRegistrationConfig) {}

export function unregister() {}
