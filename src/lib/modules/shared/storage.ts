/**
 * Thin, defensive wrappers over `localStorage`: prerendering has none, and
 * it can also throw (private windows, blocked site data, full quota). Every
 * failure degrades to "nothing stored" instead of breaking the page.
 */

function getStorage(): Storage | null {
	try {
		return typeof localStorage === 'undefined' ? null : localStorage;
	} catch {
		return null;
	}
}

/** The parsed value, or `undefined` if the key is missing, unreadable or not valid JSON. */
export function readJson<T>(key: string): T | undefined {
	const storage = getStorage();
	if (!storage) return undefined;
	try {
		const raw = storage.getItem(key);
		return raw === null ? undefined : (JSON.parse(raw) as T);
	} catch {
		return undefined;
	}
}

/** Returns whether the value was actually stored. */
export function writeJson(key: string, value: unknown): boolean {
	const storage = getStorage();
	if (!storage) return false;
	try {
		storage.setItem(key, JSON.stringify(value));
		return true;
	} catch {
		return false;
	}
}

export function removeKey(key: string): void {
	try {
		getStorage()?.removeItem(key);
	} catch {
		// nothing to clean up
	}
}

/** Every stored key that starts with `prefix`. */
export function listKeys(prefix: string): string[] {
	const storage = getStorage();
	if (!storage) return [];
	try {
		const keys: string[] = [];
		for (let i = 0; i < storage.length; i++) {
			const key = storage.key(i);
			if (key?.startsWith(prefix)) keys.push(key);
		}
		return keys;
	} catch {
		return [];
	}
}
