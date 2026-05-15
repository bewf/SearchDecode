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

function getFallbackSearchUrl(decoded) {
  const host = window.location.hostname;
  const encoded = encodeURIComponent(decoded);
  if (host.includes("duckduckgo.com")) return "https://duckduckgo.com/?q=" + encoded;
  if (host.includes("yahoo.com"))      return "https://search.yahoo.com/search?p=" + encoded;
  if (host.includes("ecosia.org"))     return "https://www.ecosia.org/search?q=" + encoded;
  if (host.includes("brave.com"))      return "https://search.brave.com/search?q=" + encoded;
  if (host.includes("bing.com"))       return "https://www.bing.com/search?q=" + encoded;
  return "https://www.google.com/search?q=" + encoded;
}

(async () => {
  // Yahoo uses ?p= instead of ?q=
  const params = new URL(window.location.href).searchParams;
  const query = params.get("q") || params.get("p");
  console.log("Search Decode: q/p param =", query);

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
      window.location.replace(getFallbackSearchUrl(decoded));
    }
  }
})();