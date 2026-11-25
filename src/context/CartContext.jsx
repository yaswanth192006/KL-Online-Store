import { createContext, useState, useEffect } from "react";
import localProductsData from "../data/products.json";
import Mobile1 from "../Components/images/z10.jpeg";
import Mobile2 from "../Components/images/z10x.jpeg";
import Mobile3 from "../Components/images/z10r.jpeg";

export const CartContext = createContext();

export function formatINR(amount) {
  const num = parseFloat(amount) || 0;
  return `₹${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

export const SHIPMENT_STAGES = [
  { key: "PLACED", label: "Order Confirmed", note: "Order received by KL University Store" },
  { key: "PACKED", label: "Packed at Campus Store", note: "Quality checked & sealed at Vaddeswaram Hub" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Hostel Delivery", note: "Campus courier en route to your block" },
  { key: "DELIVERED", label: "Delivered", note: "Handed over at hostel reception / SAC" }
];

const INITIAL_MOBILES = [
  {
    id: 101,
    title: "Iqoo Z10 5G",
    description: "Snapdragon 7s Gen 3 | 120Hz AMOLED | 6000mAh Battery | 80W FlashCharge",
    category: "mobiles",
    price: 24000,
    rating: 4.9,
    stock: 12,
    thumbnail: Mobile1
  },
  {
    id: 102,
    title: "Iqoo Z10x 5G",
    description: "MediaTek Dimensity 6300 | 120Hz Ultra Bright Display | 6000mAh Battery",
    category: "mobiles",
    price: 18000,
    rating: 4.75,
    stock: 15,
    thumbnail: Mobile2
  },
  {
    id: 103,
    title: "Iqoo Z10r 5G",
    description: "Dimensity 7300 Powerhouse | Sony OIS Camera | Slim 7.49mm Body",
    category: "mobiles",
    price: 22000,
    rating: 4.85,
    stock: 9,
    thumbnail: Mobile3
  }
];

const DEFAULT_INVENTORY = [
  ...(localProductsData.products || []),
  ...INITIAL_MOBILES
];

const DEFAULT_REVIEWS = {
  "KL Official College Backpack": [
    {
      author: "Sai Kiran",
      studentId: "2400031102",
      rating: 5,
      date: "2026-10-12",
      verifiedPurchase: true,
      comment: "Fits my 15.6 inch Dell laptop + lab records easily. Water-resistant during monsoon walks to R&D block."
    }
  ],
  "Engineering Scientific Calculator": [
    {
      author: "Ananya R.",
      studentId: "2500030814",
      rating: 5,
      date: "2026-10-18",
      verifiedPurchase: true,
      comment: "Approved in all semester exam halls. Matrix and complex number modes work smoothly."
    }
  ],
  "Iqoo Z10 5G": [
    {
      author: "Harsha Vardhan",
      studentId: "2300030445",
      rating: 5,
      date: "2026-11-01",
      verifiedPurchase: true,
      comment: "6000mAh easily lasts 2 full days of classes and coding labs. Campus partner price is unbeatable."
    }
  ]
};

function formatNow() {
  return new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("klu_cart_inr_v1");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [inventory, setInventory] = useState(() => {
    try {
      const saved = localStorage.getItem("klu_inventory_inr_v3");
      return saved ? JSON.parse(saved) : DEFAULT_INVENTORY;
    } catch {
      return DEFAULT_INVENTORY;
    }
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const stored = localStorage.getItem("isLoggedIn");
    return stored ? stored === "true" : true;
  });

  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem("klu_user_role") || "student";
  });

  const [username, setUsername] = useState(() => {
    return localStorage.getItem("username") || "yaswanth192006";
  });

  const [studentId, setStudentId] = useState(() => {
    return localStorage.getItem("studentId") || "2500030520";
  });

  const [email, setEmail] = useState(() => {
    return localStorage.getItem("email") || "2500030520@kluniversity.in";
  });

  const [orders, setOrders] = useState(() => {
    try {
      const savedOrders = localStorage.getItem("klu_orders_inr_v1");
      return savedOrders ? JSON.parse(savedOrders) : [];
    } catch {
      return [];
    }
  });

  const [latestOrder, setLatestOrder] = useState(() => {
    try {
      const savedLatest = localStorage.getItem("klu_latest_order_inr_v1");
      return savedLatest ? JSON.parse(savedLatest) : null;
    } catch {
      return null;
    }
  });

  const [selectedOrderId, setSelectedOrderId] = useState(() => {
    return localStorage.getItem("klu_selected_order_id") || null;
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem("klu_wishlist_inr_v1");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [reviews, setReviews] = useState(() => {
    try {
      const saved = localStorage.getItem("klu_reviews_v3");
      return saved ? JSON.parse(saved) : DEFAULT_REVIEWS;
    } catch {
      return DEFAULT_REVIEWS;
    }
  });

  const [affinity, setAffinity] = useState(() => {
    try {
      const saved = localStorage.getItem("klu_user_affinity");
      return saved ? JSON.parse(saved) : { categories: {}, viewedTitles: [] };
    } catch {
      return { categories: {}, viewedTitles: [] };
    }
  });

  const [itemRequests, setItemRequests] = useState(() => {
    try {
      const saved = localStorage.getItem("kl_merchant_item_requests");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem("klu_cart_inr_v1", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("klu_inventory_inr_v3", JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem("klu_user_role", userRole);
  }, [userRole]);

  useEffect(() => {
    localStorage.setItem("klu_orders_inr_v1", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (latestOrder) {
      localStorage.setItem("klu_latest_order_inr_v1", JSON.stringify(latestOrder));
    }
  }, [latestOrder]);

  useEffect(() => {
    if (selectedOrderId) {
      localStorage.setItem("klu_selected_order_id", selectedOrderId);
    }
  }, [selectedOrderId]);

  useEffect(() => {
    localStorage.setItem("klu_wishlist_inr_v1", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem("klu_reviews_v3", JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem("klu_user_affinity", JSON.stringify(affinity));
  }, [affinity]);

  useEffect(() => {
    localStorage.setItem("kl_merchant_item_requests", JSON.stringify(itemRequests));
  }, [itemRequests]);

  const bumpAffinity = (category, title, weight = 1) => {
    if (!category && !title) return;
    setAffinity((prev) => {
      const nextCategories = { ...(prev.categories || {}) };
      if (category) {
        nextCategories[category] = (nextCategories[category] || 0) + weight;
      }
      const prevViewed = prev.viewedTitles || [];
      const nextViewed = title
        ? [title, ...prevViewed.filter((t) => t !== title)].slice(0, 12)
        : prevViewed;
      return { categories: nextCategories, viewedTitles: nextViewed };
    });
  };

  const recordProductView = (product) => {
    if (!product) return;
    bumpAffinity(product.category, product.title, 1);
  };

  const getProductStock = (title) => {
    const found = inventory.find((p) => p.title === title);
    return found && typeof found.stock === "number" ? found.stock : 25;
  };

  const addToCart = (product) => {
    const availableStock = getProductStock(product.title);
    if (availableStock <= 0) {
      return { ok: false, message: `"${product.title}" is currently out of stock.` };
    }

    let capped = false;
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.title === product.title
      );
      if (existingIndex !== -1) {
        const currentQty = prevCart[existingIndex].quantity || 1;
        if (currentQty >= availableStock) {
          capped = true;
          return prevCart;
        }
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: currentQty + 1
        };
        return updated;
      } else {
        return [...prevCart, { ...product, quantity: product.quantity || 1 }];
      }
    });

    if (capped) {
      return { ok: false, message: `Max available stock (${availableStock}) already in cart.` };
    }

    bumpAffinity(product.category, product.title, 2);
    return { ok: true };
  };

  const removeFromCart = (index) => {
    setCart((prevCart) => prevCart.filter((_, i) => i !== index));
  };

  const updateQuantity = (index, delta) => {
    setCart((prevCart) => {
      const updated = [...prevCart];
      const item = updated[index];
      if (!item) return prevCart;
      const availableStock = getProductStock(item.title);
      const newQty = (item.quantity || 1) + delta;
      if (newQty > 0 && newQty <= availableStock) {
        updated[index] = { ...item, quantity: newQty };
      }
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("klu_cart_inr_v1");
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const qty = parseInt(item.quantity, 10) || 1;
      return sum + price * qty;
    }, 0);
  };

  // Merchant Inventory Actions
  const addProduct = (productData) => {
    const newProduct = {
      id: Date.now(),
      title: productData.title.trim(),
      description: productData.description.trim() || "Campus store certified item.",
      category: productData.category.trim().toLowerCase() || "accessories",
      price: parseFloat(productData.price) || 499,
      stock: parseInt(productData.stock, 10) || 0,
      rating: parseFloat(productData.rating) || 4.8,
      thumbnail:
        productData.thumbnail.trim() ||
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60"
    };
    setInventory((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const sourceExternalProductToInventory = (externalProduct) => {
    const existing = inventory.find(
      (p) => p.title.toLowerCase() === externalProduct.title.trim().toLowerCase()
    );
    if (existing) {
      return existing;
    }
    const newItem = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      title: externalProduct.title.trim(),
      description:
        externalProduct.description?.trim() ||
        "Sourced on customer request from external partner store.",
      category: (externalProduct.category || "electronics").trim().toLowerCase(),
      price: parseFloat(externalProduct.price) || 999,
      stock: parseInt(externalProduct.stock, 10) || 12,
      rating: parseFloat(externalProduct.rating) || 4.6,
      sourcedFrom: externalProduct.storeName || "Partner Store",
      thumbnail:
        externalProduct.thumbnail ||
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60"
    };
    setInventory((prev) => [newItem, ...prev]);
    return newItem;
  };

  const createExternalItemRequest = (extProduct) => {
    const newReq = {
      requestId: `REQ-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      title: extProduct.title.trim(),
      description:
        extProduct.description?.trim() ||
        "Requested by customer from external partner store.",
      category: (extProduct.category || "electronics").trim().toLowerCase(),
      price: parseFloat(extProduct.price) || 999,
      stock: parseInt(extProduct.stock, 10) || 12,
      rating: parseFloat(extProduct.rating) || 4.6,
      storeName: extProduct.storeName || "Partner Store",
      thumbnail:
        extProduct.thumbnail ||
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60",
      requestedBy: {
        name: username || "KL Student",
        studentId: studentId || "2500030520",
        email: email || ""
      },
      requestedAt: formatNow(),
      status: "Pending"
    };
    setItemRequests((prev) => [newReq, ...prev]);
    return newReq;
  };

  const approveExternalItemRequest = (requestId) => {
    const target = itemRequests.find((r) => r.requestId === requestId);
    if (!target) return;
    sourceExternalProductToInventory(target);
    const nowStamp = formatNow();
    setItemRequests((prev) =>
      prev.map((r) =>
        r.requestId === requestId
          ? { ...r, status: "Approved & Added", reviewedAt: nowStamp }
          : r
      )
    );
  };

  const rejectExternalItemRequest = (requestId) => {
    const nowStamp = formatNow();
    setItemRequests((prev) =>
      prev.map((r) =>
        r.requestId === requestId
          ? { ...r, status: "Rejected", reviewedAt: nowStamp }
          : r
      )
    );
  };

  const pendingItemRequestsCount = itemRequests.filter(
    (r) => r.status === "Pending"
  ).length;

  const updateProduct = (productId, updates) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === productId
          ? {
              ...item,
              ...updates,
              price: updates.price !== undefined ? parseFloat(updates.price) : item.price,
              stock: updates.stock !== undefined ? Math.max(0, parseInt(updates.stock, 10) || 0) : item.stock
            }
          : item
      )
    );
  };

  const deleteProduct = (productId) => {
    setInventory((prev) => prev.filter((item) => item.id !== productId));
  };

  const resetInventory = () => {
    setInventory(DEFAULT_INVENTORY);
  };

  // Wishlist Actions
  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((w) => w.title === product.title);
      if (exists) {
        return prev.filter((w) => w.title !== product.title);
      }
      bumpAffinity(product.category, product.title, 2);
      return [
        {
          id: product.id,
          title: product.title,
          price: product.price,
          category: product.category,
          thumbnail: product.thumbnail,
          description: product.description
        },
        ...prev
      ];
    });
  };

  const isInWishlist = (title) => wishlist.some((w) => w.title === title);

  // Purchased-only Reviews (scoped to logged-in user's own orders)
  const getUserOrders = () => {
    if (!isLoggedIn) return [];
    if (userRole === "merchant") return orders;
    return orders.filter(
      (ord) =>
        ord.ownerUsername === username ||
        (!ord.ownerUsername && ord.customer?.studentId === studentId)
    );
  };

  const hasPurchasedProduct = (productTitle) => {
    return getUserOrders().some((ord) =>
      (ord.items || []).some((it) => it.title === productTitle)
    );
  };

  const requestReturn = (orderId, itemTitle, reason, note = "") => {
    const nowStamp = formatNow();
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.orderId !== orderId) return ord;
        const updatedItems = (ord.items || []).map((it) => {
          if (it.title !== itemTitle) return it;
          return {
            ...it,
            returnStatus: "Return Requested",
            returnReason: reason,
            returnNote: note.trim(),
            returnRequestedAt: nowStamp
          };
        });
        const updatedOrder = { ...ord, items: updatedItems };
        if (latestOrder && latestOrder.orderId === orderId) {
          setLatestOrder(updatedOrder);
        }
        return updatedOrder;
      })
    );
  };

  const updateReturnStatus = (orderId, itemTitle, newStatus) => {
    const nowStamp = formatNow();
    let restockQty = 0;

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.orderId !== orderId) return ord;
        const updatedItems = (ord.items || []).map((it) => {
          if (it.title !== itemTitle) return it;
          if (newStatus === "Returned & Refunded" && it.returnStatus !== "Returned & Refunded") {
            restockQty = parseInt(it.quantity, 10) || 1;
          }
          return {
            ...it,
            returnStatus: newStatus,
            returnUpdatedAt: nowStamp
          };
        });
        const updatedOrder = { ...ord, items: updatedItems };
        if (latestOrder && latestOrder.orderId === orderId) {
          setLatestOrder(updatedOrder);
        }
        return updatedOrder;
      })
    );

    if (restockQty > 0) {
      setInventory((prev) =>
        prev.map((prod) =>
          prod.title === itemTitle
            ? { ...prod, stock: (prod.stock ?? 0) + restockQty }
            : prod
        )
      );
    }
  };

  const addReview = (productTitle, review) => {
    if (!hasPurchasedProduct(productTitle)) {
      return { ok: false, message: "Only verified buyers who purchased this product can submit a review." };
    }
    setReviews((prev) => {
      const existing = prev[productTitle] || [];
      return {
        ...prev,
        [productTitle]: [
          {
            author: review.author || username || "KL Student",
            studentId: review.studentId || studentId || "2500030520",
            rating: Number(review.rating) || 5,
            date: new Date().toISOString().slice(0, 10),
            verifiedPurchase: true,
            comment: review.comment.trim()
          },
          ...existing
        ]
      };
    });
    return { ok: true };
  };

  // Personalized Recommendations Engine
  const getRecommendations = (limit = 4, extraPool = []) => {
    const combinedPool = [...inventory];
    extraPool.forEach((ep) => {
      if (!combinedPool.some((p) => p.title === ep.title)) {
        combinedPool.push(ep);
      }
    });

    const cartTitles = new Set(cart.map((c) => c.title));
    const categoryScores = { ...(affinity.categories || {}) };

    cart.forEach((item) => {
      const matched = combinedPool.find((p) => p.title === item.title);
      const cat = item.category || matched?.category;
      if (cat) categoryScores[cat] = (categoryScores[cat] || 0) + 3;
    });

    orders.slice(0, 5).forEach((ord) => {
      (ord.items || []).forEach((item) => {
        const matched = combinedPool.find((p) => p.title === item.title);
        const cat = item.category || matched?.category;
        if (cat) categoryScores[cat] = (categoryScores[cat] || 0) + 2;
      });
    });

    const ranked = combinedPool
      .filter((p) => !cartTitles.has(p.title) && (typeof p.stock !== "number" || p.stock > 0))
      .map((p) => {
        const catScore = categoryScores[p.category] || 0;
        const ratingScore = (parseFloat(p.rating) || 4.5) * 0.6;
        const score = catScore * 3 + ratingScore;
        let reason = "Top rated on KL Campus";
        if (catScore > 0) {
          const prettyCat = p.category
            ? p.category.charAt(0).toUpperCase() + p.category.slice(1)
            : "Campus";
          reason = `Recommended for your interest in ${prettyCat}`;
        } else if (p.category === "mobiles") {
          reason = "Exclusive Student Partner Deal";
        }
        return { product: p, score, reason };
      })
      .sort((a, b) => b.score - a.score);

    return ranked.slice(0, limit);
  };

  const placeOrder = (billingData) => {
    const subtotal = calculateSubtotal();
    const discountRate = billingData.discountRate || (billingData.discountApplied ? 0.1 : 0);
    const discountAmount = subtotal * discountRate;
    const ecoCredit = billingData.ecoPickup ? Math.min(50, Math.max(0, subtotal - discountAmount)) : 0;
    const taxableAmount = Math.max(0, subtotal - discountAmount - ecoCredit);
    const taxAmount = taxableAmount * 0.05; // 5% GST
    const deliveryFee = 0;
    const finalTotal = taxableAmount + taxAmount + deliveryFee;
    const splitCount = Math.max(1, Math.min(4, parseInt(billingData.splitCount, 10) || 1));

    const nowStamp = formatNow();
    const randNum = Math.floor(100000 + Math.random() * 900000);

    const newOrder = {
      orderId: `KL-${new Date().getFullYear()}-${randNum}`,
      trackingId: `TRK-KL-${randNum}`,
      orderDate: nowStamp,
      ownerUsername: username || billingData.fullName || "student",
      ownerStudentId: studentId || billingData.studentId || "2500030520",
      trackingStage: 0,
      trackingHistory: [
        {
          stage: 0,
          label: SHIPMENT_STAGES[0].label,
          timestamp: nowStamp,
          note: billingData.ecoPickup
            ? "Eco-Pickup scheduled at Student Activity Center (SAC)"
            : `Scheduled for ${billingData.deliverySlot || "Standard Campus Delivery"}`
        }
      ],
      deliverySlot: billingData.deliverySlot || "Afternoon (2:00 PM - 4:00 PM)",
      ecoPickup: Boolean(billingData.ecoPickup),
      splitCount,
      perPersonTotal: (finalTotal / splitCount).toFixed(2),
      customer: {
        name: billingData.fullName || username,
        studentId: billingData.studentId || studentId,
        email: billingData.email || email,
        phone: billingData.phone,
        address: billingData.address,
        hostelBlock: billingData.hostelBlock,
        roomNo: billingData.roomNo,
        campusArea: billingData.campusArea || "Green Fields Campus, Vaddeswaram"
      },
      payment: {
        method: billingData.paymentMethod,
        status: billingData.paymentMethod === "COD" ? "Pending (Cash On Delivery)" : "Paid Successfully",
        transactionId:
          billingData.paymentMethod === "COD"
            ? "N/A"
            : `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      },
      items: [...cart],
      pricing: {
        subtotal: subtotal.toFixed(2),
        discountLabel: billingData.discountLabel || `Student Discount (${Math.round(discountRate * 100)}%)`,
        discount: discountAmount.toFixed(2),
        ecoCredit: ecoCredit.toFixed(2),
        tax: taxAmount.toFixed(2),
        delivery: deliveryFee.toFixed(2),
        total: finalTotal.toFixed(2)
      },
      status: SHIPMENT_STAGES[0].label
    };

    // Deduct stock from inventory
    setInventory((prev) =>
      prev.map((prod) => {
        const bought = cart.find((c) => c.title === prod.title);
        if (!bought) return prod;
        const qty = parseInt(bought.quantity, 10) || 1;
        return { ...prod, stock: Math.max(0, (prod.stock ?? 20) - qty) };
      })
    );

    cart.forEach((item) => bumpAffinity(item.category, item.title, 3));

    setOrders((prev) => [newOrder, ...prev]);
    setLatestOrder(newOrder);
    setSelectedOrderId(newOrder.orderId);
    clearCart();
    return newOrder;
  };

  const advanceOrderStage = (orderId, targetStage) => {
    const stageIdx = Math.max(0, Math.min(SHIPMENT_STAGES.length - 1, targetStage));
    const stageMeta = SHIPMENT_STAGES[stageIdx];
    const nowStamp = formatNow();

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.orderId !== orderId) return ord;
        const existingHistory = ord.trackingHistory || [
          { stage: 0, label: SHIPMENT_STAGES[0].label, timestamp: ord.orderDate, note: SHIPMENT_STAGES[0].note }
        ];
        const hasStage = existingHistory.some((h) => h.stage === stageIdx);
        const nextHistory = hasStage
          ? existingHistory
          : [
              ...existingHistory,
              {
                stage: stageIdx,
                label: stageMeta.label,
                timestamp: nowStamp,
                note: stageMeta.note
              }
            ];
        const updatedOrder = {
          ...ord,
          trackingStage: stageIdx,
          status: stageMeta.label,
          trackingHistory: nextHistory
        };
        if (latestOrder && latestOrder.orderId === orderId) {
          setLatestOrder(updatedOrder);
        }
        return updatedOrder;
      })
    );
  };

  const selectOrderForReceipt = (orderId) => {
    setSelectedOrderId(orderId);
  };

  const loginUser = (user, customStudentId, customEmail, role = "student") => {
    setIsLoggedIn(true);
    setUsername(user);
    setUserRole(role);
    if (customStudentId) setStudentId(customStudentId);
    if (customEmail) setEmail(customEmail);

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("username", user);
    localStorage.setItem("klu_user_role", role);
    if (customStudentId) localStorage.setItem("studentId", customStudentId);
    if (customEmail) localStorage.setItem("email", customEmail);
  };

  const logoutUser = () => {
    setIsLoggedIn(false);
    setUsername("");
    setUserRole("student");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("klu_user_role");
    localStorage.removeItem("klu_cart_inr_v1");
    setCart([]);
  };

  const totalCartCount = cart.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        inventory,
        isLoggedIn,
        userRole,
        username,
        studentId,
        email,
        orders,
        latestOrder,
        selectedOrderId,
        wishlist,
        reviews,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        calculateSubtotal,
        placeOrder,
        advanceOrderStage,
        selectOrderForReceipt,
        addProduct,
        sourceExternalProductToInventory,
        itemRequests,
        pendingItemRequestsCount,
        createExternalItemRequest,
        approveExternalItemRequest,
        rejectExternalItemRequest,
        updateProduct,
        deleteProduct,
        resetInventory,
        toggleWishlist,
        isInWishlist,
        getUserOrders,
        hasPurchasedProduct,
        requestReturn,
        updateReturnStatus,
        addReview,
        recordProductView,
        getRecommendations,
        getProductStock,
        loginUser,
        logoutUser,
        totalCartCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
