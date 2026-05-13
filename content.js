console.log("Search Decode: script loaded", window.location.href);

function decodeBase64(str) {
  try {
    return decodeURIComponent(escape(atob(str))).trim();
  } catch {
    return null;
  }
}

function isLikelyUrl(str) {
  return /^(https?:\/\/|www\.|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/.test(str);
}

function normalizeUrl(str) {
  if (!str.startsWith("http://") && !str.startsWith("https://")) {
    return "https://" + str;
  }
  return str;
}

(async () => {
  const query = new URL(window.location.href).searchParams.get("q");
  console.log("Search Decode: q param =", query);

  const res = await chrome.storage.local.get(["mode", "enabled"]);
  console.log("Search Decode: storage =", res);

  const mode = res.mode || "url_only";
  const enabled = res.enabled !== undefined ? res.enabled : true;

  if (!enabled) { console.log("Search Decode: disabled, bailing"); return; }

  const decoded = decodeBase64(query);
  console.log("Search Decode: decoded =", decoded);

  if (!decoded) { console.log("Search Decode: decode failed, bailing"); return; }

  if (mode === "url_only") {
    console.log("Search Decode: isLikelyUrl =", isLikelyUrl(decoded));
    if (isLikelyUrl(decoded)) {
      console.log("Search Decode: redirecting to", normalizeUrl(decoded));
      window.location.replace(normalizeUrl(decoded));
    }
  } else if (mode === "all") {
    if (isLikelyUrl(decoded)) {
      window.location.replace(normalizeUrl(decoded));
    } else {
      window.location.replace("https://www.google.com/search?q=" + encodeURIComponent(decoded));
    }
  }
})();