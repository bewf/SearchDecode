let mode = "url_only";
let enabled = true;

// load saved settings
browser.storage.local.get([
  "mode",
  "enabled"
]).then((res) => {

  mode = res.mode || "url_only";

  enabled =
    res.enabled !== undefined
      ? res.enabled
      : true;
});

// live updates
browser.storage.onChanged.addListener((changes) => {

  if (changes.mode) {
    mode = changes.mode.newValue;
  }

  if (changes.enabled) {
    enabled = changes.enabled.newValue;
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

  if (
    !str.startsWith("http://") &&
    !str.startsWith("https://")
  ) {
    return "https://" + str;
  }

  return str;
}

browser.webRequest.onBeforeRequest.addListener(
  (details) => {

    const currentUrl = new URL(details.url);
    const query = currentUrl.searchParams.get("q");

    if (!query) {
      return;
    }

    // extension disabled
    if (!enabled) {
      return;
    }

    const decoded = decodeBase64(query);

    if (!decoded) {
      return;
    }

    // URL ONLY MODE
    if (mode === "url_only") {

      if (isLikelyUrl(decoded)) {

        return {
          redirectUrl: normalizeUrl(decoded)
        };
      }

      return;
    }

    // URL + TEXT MODE
    if (mode === "all") {

      // redirect URLs directly
      if (isLikelyUrl(decoded)) {

        return {
          redirectUrl: normalizeUrl(decoded)
        };
      }

      // search decoded text normally
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