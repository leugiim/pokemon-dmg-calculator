import { vi } from 'vitest';

/** Installs an in-memory `localStorage` and returns its backing map. */
export function installMemoryStorage(): Map<string, string> {
	const data = new Map<string, string>();
	vi.stubGlobal('localStorage', {
		getItem: (key: string) => data.get(key) ?? null,
		setItem: (key: string, value: string) => void data.set(key, String(value)),
		removeItem: (key: string) => void data.delete(key),
		clear: () => data.clear(),
		key: (i: number) => [...data.keys()][i] ?? null,
		get length() {
			return data.size;
		}
	});
	return data;
}
