const cache = new Map<string, Promise<string>>();

const fetchBlob = async (url: string) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const fetchMedia = async (url: string, useCache = true) => {
  if (useCache) {
    const cachedPromise = cache.get(url);
    if (cachedPromise) {
      return cachedPromise;
    }
  }

  const promise = fetchBlob(url);
  cache.set(url, promise);

  try {
    await promise;
  } catch {
    cache.delete(url);
  }

  return promise;
};

export const prefetchMedia = (url: string) => fetchMedia(url);
