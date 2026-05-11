function decodeBase64ToUrl(str) {
  try {
    const decoded = atob(str);

    if (
      decoded.startsWith("http://") ||
      decoded.startsWith("https://")
    ) {
      return decoded;
    }

    return null;
  } catch {
    return null;
  }
}

browser.webRequest.onBeforeRequest.addListener(
  (details) => {
    const url = new URL(details.url);
    const query = url.searchParams.get("q");

    if (!query) return;

    const decoded = decodeBase64ToUrl(query);

    if (decoded) {
      return { redirectUrl: decoded };
    }
  },
  {
    urls: [
      "*://www.google.com/search*",
      "*://www.bing.com/search*"
    ]
  },
  ["blocking"]
);