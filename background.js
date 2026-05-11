let mode = "url_only";

// load saved mode
browser.storage.local.get("mode").then((res) => {
  mode = res.mode || "url_only";
});

// live update
browser.storage.onChanged.addListener((changes) => {
  if (changes.mode) {
    mode = changes.mode.newValue;
  }
});

function decodeBase64(str) {
  try {
    return decodeURIComponent(
      escape(atob(str))
    ).trim();
  } catch {
    return null;
  }
}

function isLikelyUrl(str) {
  // supports:
  // https://example.com
  // http://example.com
  // www.example.com
  // example.com/path

  return /^(https?:\/\/|www\.|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/.test(str);
}

function normalizeUrl(str) {
  // add https if missing
  if (!str.startsWith("http://") && !str.startsWith("https://")) {
    return "https://" + str;
  }

  return str;
}

browser.webRequest.onBeforeRequest.addListener(
  (details) => {
    const currentUrl = new URL(details.url);
    const query = currentUrl.searchParams.get("q");

    if (!query) return;

    const decoded = decodeBase64(query);

    if (!decoded) return;

    // URL ONLY MODE
    if (mode === "url_only") {
      if (isLikelyUrl(decoded)) {
        return {
          redirectUrl: normalizeUrl(decoded)
        };
      }

      return;
    }

    // ALL MODE
    if (mode === "all") {

      // if decoded text looks like a URL, redirect
      if (isLikelyUrl(decoded)) {
        return {
          redirectUrl: normalizeUrl(decoded)
        };
      }

      // otherwise search decoded text normally
      const searchUrl =
        "https://www.google.com/search?q=" +
        encodeURIComponent(decoded);

      return {
        redirectUrl: searchUrl
      };
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