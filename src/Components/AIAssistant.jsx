import { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext, formatINR } from "../context/CartContext";

function parsePriceNumber(raw, hasK) {
  const num = parseFloat(String(raw).replace(/,/g, ""));
  if (Number.isNaN(num)) return null;
  return hasK ? num * 1000 : num;
}

function extractBudgetAndTokens(queryText) {
  let q = queryText.toLowerCase().trim();
  let maxPrice = null;
  let minPrice = null;

  const underMatch = q.match(/(?:under|below|less than|within|max|budget|upto|up to|<)\s*₹?\s*([\d,.]+)\s*(k)?/i);
  if (underMatch) {
    maxPrice = parsePriceNumber(underMatch[1], Boolean(underMatch[2]));
    q = q.replace(underMatch[0], " ");
  }
  const overMatch = q.match(/(?:above|over|more than|min|at least|>)\s*₹?\s*([\d,.]+)\s*(k)?/i);
  if (overMatch) {
    minPrice = parsePriceNumber(overMatch[1], Boolean(overMatch[2]));
    q = q.replace(overMatch[0], " ");
  }
  if (maxPrice === null && minPrice === null) {
    const bareBudget = q.match(/₹\s*([\d,.]+)\s*(k)?|\b(\d+(?:\.\d+)?)\s*k\b/i);
    if (bareBudget) {
      maxPrice = bareBudget[1]
        ? parsePriceNumber(bareBudget[1], Boolean(bareBudget[2]))
        : parsePriceNumber(bareBudget[3], true);
      q = q.replace(bareBudget[0], " ");
    }
  }

  const stopWords = new Set([
    "suggest", "me", "a", "an", "the", "best", "good", "top", "show", "find",
    "need", "want", "looking", "for", "under", "below", "less", "than", "above",
    "over", "more", "between", "around", "within", "upto", "up", "to", "and",
    "or", "with", "having", "has", "have", "in", "of", "on", "at", "by", "from",
    "please", "can", "you", "give", "recommend", "items", "item", "product",
    "products", "budget", "price", "cost", "rs", "inr", "rupees", "specs",
    "only", "any", "which", "is", "are", "that", "should", "be", "like", "help",
    "also", "about", "something", "some", "search", "other", "store", "stores"
  ]);

  const tokens = q
    .replace(/[₹,?!.]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !stopWords.has(t) && !/^\d+$/.test(t));

  return { maxPrice, minPrice, tokens };
}

const PARTNER_IMAGE_BY_KEYWORD = [
  { match: ["watch", "smartwatch"], img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60" },
  { match: ["earbud", "tws", "airpod", "earphone"], img: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=60" },
  { match: ["speaker", "bluetooth speaker", "jbl"], img: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop&q=60" },
  { match: ["tablet", "ipad", "tab"], img: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=60" },
  { match: ["shoe", "sneaker", "running"], img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60" },
  { match: ["monitor", "display", "screen"], img: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60" },
  { match: ["power bank", "powerbank"], img: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&auto=format&fit=crop&q=60" },
  { match: ["ssd", "hard drive", "pendrive", "storage"], img: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&auto=format&fit=crop&q=60" },
  { match: ["lamp", "desk lamp", "light"], img: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=60" },
  { match: ["laptop", "notebook"], img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60" },
  { match: ["phone", "mobile", "smartphone"], img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60" },
  { match: ["sunglass", "glasses"], img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&auto=format&fit=crop&q=60" }
];

function pickReliableThumbnail(title, category) {
  const hay = `${title} ${category}`.toLowerCase();
  for (const entry of PARTNER_IMAGE_BY_KEYWORD) {
    if (entry.match.some((m) => hay.includes(m))) return entry.img;
  }
  return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60";
}

const OFFLINE_PARTNER_CATALOG = [
  {
    id: "ext-watch-1",
    title: "Noise ColorFit Pulse 3 Smartwatch",
    category: "watches",
    price: 1799,
    rating: 4.5,
    stock: 15,
    storeName: "Amazon Partner Hub",
    description: "1.96 inch TFT display, Bluetooth calling, 100+ sports modes, 7-day battery.",
    thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "ext-earbuds-1",
    title: "boAt Airdopes 141 ANC TWS Earbuds",
    category: "electronics",
    price: 1499,
    rating: 4.4,
    stock: 20,
    storeName: "Flipkart Campus Partner",
    description: "32dB Active Noise Cancellation, 42H playback, ASAP fast charge, low latency mode.",
    thumbnail: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "ext-powerbank-1",
    title: "Mi 20000mAh 33W Fast Charging Power Bank",
    category: "electronics",
    price: 1999,
    rating: 4.7,
    stock: 18,
    storeName: "Croma Partner Store",
    description: "Triple output ports with Type-C Power Delivery, ideal for campus travel & labs.",
    thumbnail: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "ext-speaker-1",
    title: "JBL Go 3 Portable Bluetooth Speaker",
    category: "electronics",
    price: 2799,
    rating: 4.75,
    stock: 12,
    storeName: "Croma Partner Store",
    description: "IP67 waterproof & dustproof compact speaker with rich bass and 5-hour battery.",
    thumbnail: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "ext-tablet-1",
    title: "Samsung Galaxy Tab A9+ 11-inch Tablet",
    category: "tablets",
    price: 18999,
    rating: 4.6,
    stock: 9,
    storeName: "Amazon Partner Hub",
    description: "11 inch FHD+ 90Hz display, Snapdragon 695, 8GB RAM, 128GB storage for note-taking.",
    thumbnail: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "ext-ssd-1",
    title: "SanDisk 1TB Portable NVMe SSD",
    category: "electronics",
    price: 7499,
    rating: 4.8,
    stock: 10,
    storeName: "Flipkart Campus Partner",
    description: "Up to 1050MB/s read speed USB-C external SSD, water and drop resistant.",
    thumbnail: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&auto=format&fit=crop&q=60"
  }
];

function localInventorySearch(queryText, inStockPool) {
  const { maxPrice, minPrice, tokens } = extractBudgetAndTokens(queryText);

  const matched = inStockPool.filter((p) => {
    const price = parseFloat(p.price) || 0;
    if (maxPrice !== null && price > maxPrice) return false;
    if (minPrice !== null && price < minPrice) return false;
    if (tokens.length === 0) return true;
    const hay = `${p.title} ${p.description || ""} ${p.category || ""}`.toLowerCase();
    return tokens.every((t) => hay.includes(t));
  });

  return matched.slice(0, 4).map((p) => ({
    ...p,
    matchedBadges: [
      ...(maxPrice !== null ? [`Under ${formatINR(maxPrice)}`] : []),
      ...tokens.slice(0, 2).map((t) => `Matched: ${t}`)
    ]
  }));
}

async function searchDummyJSONExternal(queryText) {
  const { maxPrice, minPrice, tokens } = extractBudgetAndTokens(queryText);
  const searchKeyword = tokens[0] || queryText.trim();

  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(
      `https://dummyjson.com/products/search?q=${encodeURIComponent(searchKeyword)}&limit=12`,
      { signal: controller.signal }
    );
    clearTimeout(tid);
    if (!res.ok) return [];
    const data = await res.json();
    const list = (data.products || []).map((dp) => ({
      id: `ext-dj-${dp.id}`,
      title: dp.title,
      category: (dp.category || "general").toLowerCase(),
      price: Math.round((parseFloat(dp.price) || 15) * 83),
      rating: dp.rating || 4.5,
      stock: dp.stock || 15,
      description: dp.description,
      thumbnail: dp.thumbnail,
      storeName: "DummyJSON Global Store"
    }));

    return list
      .filter((p) => {
        if (maxPrice !== null && p.price > maxPrice) return false;
        if (minPrice !== null && p.price < minPrice) return false;
        return true;
      })
      .slice(0, 4);
  } catch {
    return [];
  }
}

async function callGeminiWithFallback({ apiKey, systemInstruction, userPrompt }) {
  const models = [
    "gemini-3-flash-preview",
    "gemini-3.8-flash",
    "gemini-flash-latest",
    "gemini-3.7-flash",
    "gemini-3.5-flash"
  ];

  const payload = JSON.stringify({
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig: { temperature: 0.2, responseMimeType: "application/json" }
  });

  let lastError = null;
  for (const modelName of models) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: payload,
        signal: controller.signal
      });

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        return JSON.parse(rawText);
      }

      const errText = await response.text();
      lastError = new Error(`API ${response.status} (${modelName}): ${errText}`);
      if (response.status !== 404 && response.status !== 503 && response.status !== 429) {
        throw lastError;
      }
    } catch (err) {
      lastError = err;
    } finally {
      clearTimeout(timeoutId);
    }
  }
  throw lastError || new Error("Gemini API unavailable");
}

async function sourceFromPartnerStores({ apiKey, queryText }) {
  const { maxPrice, minPrice, tokens } = extractBudgetAndTokens(queryText);

  // 1. Try live DummyJSON External Store Search
  const djResults = await searchDummyJSONExternal(queryText);
  if (djResults.length > 0) {
    return {
      reply: `Not available in KL Inventory right now, so I searched external partner stores and found ${djResults.length} option(s). Click "Order Directly" to place your order (Merchant will be notified to approve & add to inventory):`,
      externalItems: djResults.map((p) => ({
        ...p,
        matchedBadges: [
          `🌐 ${p.storeName}`,
          ...(maxPrice !== null ? [`Under ${formatINR(maxPrice)}`] : [])
        ]
      }))
    };
  }

  // 2. Ask Gemini AI to source matching products from external partner stores (Amazon/Flipkart/Croma)
  if (apiKey) {
    try {
      const sysPrompt = `The requested product is NOT in KL Online Store's local inventory.
Act as an external partner-store sourcing agent (Amazon India / Flipkart / Croma Campus Partner).
Generate 2 to 3 realistic real-world products matching the customer's exact product type, specifications, and INR budget.
Return strictly valid JSON:
{
  "reply": "Short explanation that the item wasn't in KL inventory, so you found these options from external partner stores that the customer can order directly (sending a notification to the Merchant).",
  "externalProducts": [
    {
      "title": "Exact product name",
      "category": "short lowercase category like electronics, watches, tablets, accessories, laptops, mobiles",
      "price": <integer INR price strictly honoring customer budget>,
      "rating": 4.6,
      "stock": 12,
      "storeName": "Amazon Partner Hub | Flipkart Campus Partner | Croma Partner Store",
      "description": "Concise 1-sentence specs summary",
      "matchedBadges": ["badge1", "badge2"]
    }
  ]
}`;
      const aiExt = await callGeminiWithFallback({
        apiKey,
        systemInstruction: sysPrompt,
        userPrompt: `CUSTOMER_REQUEST: ${queryText}`
      });

      const items = (aiExt.externalProducts || []).slice(0, 3).map((ep, idx) => ({
        id: `ext-ai-${Date.now()}-${idx}`,
        title: ep.title,
        category: (ep.category || "electronics").toLowerCase(),
        price: parseFloat(ep.price) || 1999,
        rating: ep.rating || 4.6,
        stock: ep.stock || 12,
        storeName: ep.storeName || "Partner Store",
        description: ep.description || "Sourced from external partner store.",
        thumbnail: pickReliableThumbnail(ep.title, ep.category || ""),
        matchedBadges: [
          `🌐 ${ep.storeName || "Partner Store"}`,
          ...(Array.isArray(ep.matchedBadges) ? ep.matchedBadges.slice(0, 2) : [])
        ]
      }));

      if (items.length > 0) {
        return {
          reply:
            aiExt.reply ||
            `Not found in KL Inventory, so I found these from partner stores. Click "Order Directly" to place your order & notify the Merchant:`,
          externalItems: items
        };
      }
    } catch (e) {
      console.warn("Gemini external sourcing fallback:", e);
    }
  }

  // 3. Offline Partner Store Catalog fallback
  const offlineMatches = OFFLINE_PARTNER_CATALOG.filter((p) => {
    if (maxPrice !== null && p.price > maxPrice) return false;
    if (minPrice !== null && p.price < minPrice) return false;
    if (tokens.length === 0) return true;
    const hay = `${p.title} ${p.description} ${p.category}`.toLowerCase();
    return tokens.some((t) => hay.includes(t));
  });

  if (offlineMatches.length > 0) {
    return {
      reply: `Not in KL Inventory right now — found in external partner stores! Click "Order Directly" to order & notify the Merchant:`,
      externalItems: offlineMatches.slice(0, 3).map((p) => ({
        ...p,
        matchedBadges: [`🌐 ${p.storeName}`, p.category]
      }))
    };
  }

  return {
    reply: `I couldn't find "${queryText}" in KL inventory or partner stores within that exact budget.`,
    externalItems: []
  };
}

function AIAssistant() {
  const {
    inventory,
    isLoggedIn,
    userRole,
    addToCart,
    createExternalItemRequest
  } = useContext(CartContext);
  const navigate = useNavigate();
  const isMerchant = isLoggedIn && userRole === "merchant";

  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("klu_gemini_api_key") || import.meta.env.VITE_GEMINI_API_KEY || ""
  );
  const [showKeyBox, setShowKeyBox] = useState(false);
  const [keyInput, setKeyInput] = useState(apiKey);

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sourcedTitles, setSourcedTitles] = useState({});
  const [toastMsg, setToastMsg] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I'm your personal AI Shopping Assistant. Tell me what you're looking for, and I'll help you discover the best products and deals!",
      suggestions: [],
      externalSuggestions: []
    }
  ]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  if (isMerchant) return null;

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2400);
  };

  const handleQuickAdd = (product) => {
    if (!isLoggedIn && localStorage.getItem("isLoggedIn") !== "true") {
      alert("Please login first to add items to your cart!");
      navigate("/login");
      return;
    }
    const res = addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      category: product.category,
      thumbnail: product.thumbnail,
      quantity: 1
    });
    if (res && !res.ok) {
      showToast(res.message);
      return;
    }
    showToast(`Added "${product.title}" to Cart!`);
  };

  const handleAddExternalToCartAndNotify = (extProduct, goToCheckout = false) => {
    if (!isLoggedIn && localStorage.getItem("isLoggedIn") !== "true") {
      alert("Please login first to order items!");
      navigate("/login");
      return;
    }

    createExternalItemRequest(extProduct);
    addToCart({
      id: extProduct.id,
      title: extProduct.title,
      price: extProduct.price,
      category: extProduct.category,
      thumbnail: extProduct.thumbnail,
      sourcedFrom: extProduct.storeName || "Partner Store",
      quantity: 1
    });

    setSourcedTitles((prev) => ({ ...prev, [extProduct.title]: "requested" }));
    showToast(`Added "${extProduct.title}" & sent notification to Merchant!`);

    if (goToCheckout) {
      setIsOpen(false);
      navigate("/billing");
    }
  };

  const handleSaveKey = (e) => {
    e.preventDefault();
    const cleaned = keyInput.trim();
    setApiKey(cleaned);
    if (cleaned) {
      localStorage.setItem("klu_gemini_api_key", cleaned);
    } else {
      localStorage.removeItem("klu_gemini_api_key");
    }
    setShowKeyBox(false);
    showToast(cleaned ? "API key updated!" : "Reverted to env key.");
  };

  const handleResetChat = () => {
    setMessages([
      {
        sender: "ai",
        text: "Chat reset! Ask me for any item—either from KL Inventory or external partner stores.",
        suggestions: [],
        externalSuggestions: []
      }
    ]);
  };

  const handleSend = async (customPrompt) => {
    const queryText = (customPrompt ?? input).trim();
    if (!queryText || isLoading) return;

    if (!customPrompt) setInput("");

    const historySnapshot = [...messages];
    setMessages((prev) => [...prev, { sender: "user", text: queryText }]);

    const inStockPool = inventory.filter((p) => (p.stock ?? 1) > 0);
    const activeKey = apiKey.trim();

    setIsLoading(true);
    try {
      let localMatches = [];
      let replyText = "";

      if (activeKey) {
        try {
          const compactCatalog = inStockPool.map((p) => ({
            id: p.id,
            title: p.title,
            category: p.category,
            price_inr: p.price,
            rating: p.rating || 4.7,
            stock: p.stock ?? 20,
            description: p.description || ""
          }));

          const recentHistory = historySnapshot
            .slice(-4)
            .map((m) => `${m.sender === "user" ? "Customer" : "Assistant"}: ${m.text}`)
            .join("\n");

          const sysPrompt = `You are KL Online Store's AI Shopping Assistant. All prices are in INR (₹).
Check ONLY LIVE_CATALOG. If matching in-stock items exist in LIVE_CATALOG matching the customer's requested product type, specs, and INR budget, return them.
IMPORTANT: If the requested product type (e.g. smartwatch, earbuds, shoes, tablet, power bank, speaker) is NOT present in LIVE_CATALOG, you MUST return "recommendations": [] and set "needsExternalSearch": true. Never substitute unrelated items like laptops when the user asked for something else!
Return strictly valid JSON:
{
  "needsExternalSearch": <true or false>,
  "reply": "Short 1-2 sentence reply",
  "recommendations": [
    { "id": <exact id from LIVE_CATALOG>, "matchedBadges": ["badge1", "badge2"] }
  ]
}`;

          const aiRes = await callGeminiWithFallback({
            apiKey: activeKey,
            systemInstruction: sysPrompt,
            userPrompt: `LIVE_CATALOG:\n${JSON.stringify(compactCatalog)}\n\nRECENT_CHAT:\n${recentHistory}\n\nCUSTOMER_QUERY: ${queryText}`
          });

          if (!aiRes.needsExternalSearch && Array.isArray(aiRes.recommendations) && aiRes.recommendations.length > 0) {
            localMatches = aiRes.recommendations
              .map((rec) => {
                const found = inStockPool.find((p) => String(p.id) === String(rec.id));
                if (!found) return null;
                return {
                  ...found,
                  matchedBadges: Array.isArray(rec.matchedBadges) ? rec.matchedBadges.slice(0, 4) : []
                };
              })
              .filter(Boolean);
            replyText = aiRes.reply || `Found ${localMatches.length} matching item(s) in KL Inventory:`;
          }
        } catch (err) {
          console.warn("Gemini inventory lookup fallback:", err);
          localMatches = localInventorySearch(queryText, inStockPool);
          if (localMatches.length > 0) {
            replyText = `Found ${localMatches.length} matching item(s) in KL Inventory:`;
          }
        }
      } else {
        localMatches = localInventorySearch(queryText, inStockPool);
        if (localMatches.length > 0) {
          replyText = `Found ${localMatches.length} matching item(s) in KL Inventory:`;
        }
      }

      // If found in local inventory, show local recommendations
      if (localMatches.length > 0) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: replyText,
            suggestions: localMatches,
            externalSuggestions: []
          }
        ]);
        return;
      }

      // Not present in KLU inventory -> Search external partner stores!
      const externalRes = await sourceFromPartnerStores({
        apiKey: activeKey,
        queryText
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: externalRes.reply,
          suggestions: [],
          externalSuggestions: externalRes.externalItems
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "Suggest me laptop under 50k",
    "Smartwatch under 3000",
    "Wireless earbuds under 2000",
    "Power bank under 2500"
  ];

  return (
    <>
      {toastMsg && <div className="toast-popup">🛒 {toastMsg}</div>}

      <button
        type="button"
        className="ai-launcher-btn no-print"
        onClick={() => setIsOpen((prev) => !prev)}
        title="Ask AI Shopping Assistant"
      >
        {isOpen ? "✕ Close AI" : "✨ AI Assistant"}
      </button>

      {isOpen && (
        <div className="ai-drawer no-print" role="dialog" aria-label="AI Shopping Assistant">
          <div className="ai-drawer-header">
            <div>
              <strong>✨ KL AI Shopping Assistant</strong>
              <span>{apiKey ? "🟢 Gemini API + External Store Sourcing" : "🟡 Local + Partner Store Sourcing"}</span>
            </div>
            <div className="ai-header-actions">
              <button
                type="button"
                className="ai-clear-btn"
                onClick={() => setShowKeyBox((p) => !p)}
                title="Configure API Key"
              >
                ⚙
              </button>
              <button type="button" className="ai-clear-btn" onClick={handleResetChat} title="Reset chat">
                ↺
              </button>
              <button type="button" onClick={() => setIsOpen(false)} title="Close">
                ✕
              </button>
            </div>
          </div>

          {showKeyBox && (
            <form className="ai-key-bar" onSubmit={handleSaveKey}>
              <input
                type="password"
                placeholder="Paste Gemini API key..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
              />
              <button type="submit">Save</button>
            </form>
          )}

          <div className="ai-quick-chips">
            {quickPrompts.map((qp) => (
              <button key={qp} type="button" onClick={() => handleSend(qp)} disabled={isLoading}>
                {qp}
              </button>
            ))}
          </div>

          <div className="ai-messages-body">
            {messages.map((msg, idx) => (
              <div key={idx} className={`ai-msg-wrap ${msg.sender}`}>
                <div className="ai-msg-bubble">{msg.text}</div>

                {/* Local Inventory Matches */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="ai-suggestions-list">
                    {msg.suggestions.map((prod) => (
                      <div className="ai-suggestion-card" key={prod.id || prod.title}>
                        <img src={prod.thumbnail} alt={prod.title} />
                        <div className="ai-sug-info">
                          <strong>{prod.title}</strong>
                          <span className="ai-sug-desc">{prod.description?.slice(0, 72)}...</span>
                          {prod.matchedBadges && prod.matchedBadges.length > 0 && (
                            <div className="ai-matched-specs">
                              {prod.matchedBadges.map((b, bi) => (
                                <span className="ai-spec-badge" key={bi}>
                                  ✓ {b}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="ai-sug-bottom">
                            <span className="ai-sug-price">{formatINR(prod.price)}</span>
                            <span className="ai-sug-rating">★ {prod.rating || 4.8}</span>
                            <button type="button" onClick={() => handleQuickAdd(prod)}>
                              + Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* External Partner Store Results (Can Add to Inventory & Order) */}
                {msg.externalSuggestions && msg.externalSuggestions.length > 0 && (
                  <div className="ai-suggestions-list">
                    {msg.externalSuggestions.map((ext) => {
                      const stateTag = sourcedTitles[ext.title];
                      const alreadyInInv = inventory.some(
                        (i) => i.title.toLowerCase() === ext.title.toLowerCase()
                      );

                      return (
                        <div className="ai-suggestion-card external-card" key={ext.id || ext.title}>
                          <img src={ext.thumbnail} alt={ext.title} />
                          <div className="ai-sug-info">
                            <strong>{ext.title}</strong>
                            <span className="ai-sug-desc">{ext.description?.slice(0, 72)}...</span>
                            {ext.matchedBadges && ext.matchedBadges.length > 0 && (
                              <div className="ai-matched-specs">
                                {ext.matchedBadges.map((b, bi) => (
                                  <span className="ai-spec-badge ext-badge" key={bi}>
                                    {b}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="ai-sug-bottom">
                              <span className="ai-sug-price">{formatINR(ext.price)}</span>
                              <span className="ai-sug-rating">★ {ext.rating || 4.6}</span>
                            </div>

                            <div className="ai-ext-actions">
                              {stateTag === "requested" ? (
                                <button
                                  type="button"
                                  className="ai-checkout-btn"
                                  onClick={() => {
                                    setIsOpen(false);
                                    navigate("/billing");
                                  }}
                                >
                                  ✓ Merchant Notified • Proceed to Checkout ➔
                                </button>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    className="ai-source-btn"
                                    onClick={() => handleAddExternalToCartAndNotify(ext, false)}
                                  >
                                    + Add to Cart
                                  </button>
                                  <button
                                    type="button"
                                    className="ai-order-ext-btn"
                                    onClick={() => handleAddExternalToCartAndNotify(ext, true)}
                                  >
                                    🛒 Order Directly ➔
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="ai-msg-wrap ai">
                <div className="ai-msg-bubble ai-typing">
                  ✨ Checking KL inventory & external partner stores...
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          <form
            className="ai-input-bar"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              type="text"
              placeholder="Ask for any item (even if not in store)..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? "..." : "Ask"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default AIAssistant;
