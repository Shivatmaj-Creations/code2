const WHATSAPP_NUMBER = "919893434297";
const SUPABASE_URL = "https://tjybmzdrmonbgqmyvrcr.supabase.co";
const SUPABASE_KEY = "sb_publishable_58LzlRjRPKWU2S8ZPL4VLA_1Re2RQLi";

// ==================== ANALYTICS ====================
const ANALYTICS_SESSION = "s_" + Date.now().toString(36) + "_" + Math.random().toString(36).substr(2, 6);

const sessionTracking = {
  pageViewSent: false,
  productsViewed: new Set(),
  scrollMilestones: new Set(),
  device: "",
  country: "",
};

function getDevice() {
  if (sessionTracking.device) return sessionTracking.device;
  const ua = navigator.userAgent;
  if (/mobile|iphone|ipod|android.*mobile/i.test(ua)) sessionTracking.device = "mobile";
  else if (/tablet|ipad/i.test(ua)) sessionTracking.device = "tablet";
  else sessionTracking.device = "desktop";
  return sessionTracking.device;
}

async function getCountry() {
  if (sessionTracking.country) return sessionTracking.country;
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    sessionTracking.country = data.country_name || "Unknown";
  } catch(e) { sessionTracking.country = "Unknown"; }
  return sessionTracking.country;
}

const referrer = document.referrer ? new URL(document.referrer).hostname.replace("www.", "") : "direct";
const device = getDevice();

if (!sessionTracking.pageViewSent) {
  sessionTracking.pageViewSent = true;
  getCountry().then(country => {
    fetch(`${SUPABASE_URL}/rest/v1/analytics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({
        type: "pageview",
        product_name: "",
        version: "",
        value: 1,
        referrer: referrer,
        device: device,
        session_id: ANALYTICS_SESSION,
        page_url: window.location.pathname,
        country: country,
      }),
    }).catch(() => {});
  });
}

function sendEvent(type, productName, version, value) {
  getCountry().then(country => {
    fetch(`${SUPABASE_URL}/rest/v1/analytics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({
        type: type,
        product_name: productName || "",
        version: version || "",
        value: value || 1,
        referrer: referrer,
        device: device,
        session_id: ANALYTICS_SESSION,
        page_url: window.location.pathname,
        country: country,
      }),
    }).catch(() => {});
  });
}

const productObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && entry.target.dataset.product) {
      const card = entry.target;
      const name = card.querySelector(".product__name")?.textContent?.trim() || "Unknown";
      const version = card.classList.contains("product--premium") ? "Premium" : "Basic";
      const key = `${name}_${version}`;
      if (!sessionTracking.productsViewed.has(key)) {
        sessionTracking.productsViewed.add(key);
        sendEvent("product_view", name, version, 1);
      }
      productObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.addEventListener("click", (e) => {
  const waLink = e.target.closest("a[href*='wa.me']");
  if (waLink) {
    const card = waLink.closest(".product");
    const name = card?.querySelector(".product__name")?.textContent?.trim() || "Unknown";
    const version = card?.classList.contains("product--premium") ? "Premium" : "Basic";
    sendEvent("whatsapp_click", name, version, 1);
  }
  const contactLink = e.target.closest("[data-testid*='contact-']");
  if (contactLink) {
    const type = contactLink.dataset.testid?.replace("contact-", "") || "unknown";
    sendEvent("contact_click", type, "", 1);
  }
});

window.addEventListener("scroll", () => {
  const percent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
  [25, 50, 75, 100].forEach(m => {
    if (percent >= m && !sessionTracking.scrollMilestones.has(m)) {
      sessionTracking.scrollMilestones.add(m);
      sendEvent("scroll_depth", "", "", m);
    }
  });
}, { passive: true });

// ==================== PRODUCTS DATA ====================
// HOW TO CONTROL VERSIONS:
//   - "premium" = शिवात्मज – अलंकृत (golden, ornate)
//   - "basic"   = शिवात्मज – सहज (simple, understated)
//   - Comment out (/* ... */) the version you DON'T want for each product

const PRODUCTS = [
  {
    name: "Maharaja (महाराजा)",
    height: "17 inches",
    material: "Shadu mati",
    price: "₹3,499",
    description: "A serene, seated Bappa finished in warm earthen tones. Compact enough for the home altar, detailed enough to feel truly special.",
    images: ["images/1.1.webp", "images/1.2.webp", "images/1.3.webp", "images/1.4.webp", "images/1.5.webp"],
    versions: [
      "premium",
      "basic",
    ],
  },
  {
    name: "Dagdusheth (दगडुशेठ)",
    height: "12 inches",
    material: "Shadu mati",
    price: "₹2,499",
    description: "An elegant standing form with a flowing drape and gentle expression. Naturally pigmented, entirely free of plaster and chemical paint.",
    images: ["images/2.1.webp", "images/2.2.webp", "images/2.3.webp", "images/2.4.webp"],
    versions: [
      "premium",
      /* "basic", */  // ← Only premium for this idol
    ],
  },
  {
    name: "Dagdusheth (दगडुशेठ)",
    height: "12 inches",
    material: "Shadu mati",
    price: "₹2,499",
    description: "Our statement idol for larger celebrations. Grand proportions, softly detailed ornamentation, and a finish that dissolves cleanly at visarjan.",
    images: ["images/3.1.webp", "images/3.2.webp", "images/3.3.webp"],
    versions: [
      "premium",
      "basic",
    ],
  },
  {
    name: "Takht Wale Ganesh (तख्त वाले गणेश)",
    height: "16 inches",
    material: "Shadu mati",
    price: "₹3,499",
    description: "A little Bappa for desks, cars and gifting. Same honest clay, same handcrafted care — in a gentle, pocket-friendly size.",
    images: ["images/4.1.webp", "images/4.2.webp", "images/4.3.webp"],
    versions: [
      /* "premium", */  // ← Only basic for this idol
      "basic",
    ],
  },
  {
    name: "Shiv Ke Lal (शिव के लाल)",
    height: "14 inches",
    material: "Shadu mati",
    price: "₹1,499",
    description: "A little Bappa for desks, cars and gifting. Same honest clay, same handcrafted care — in a gentle, pocket-friendly size.",
    images: ["images/5.1.webp", "images/5.2.webp", "images/5.3.webp"],
    versions: [
      "premium",
      "basic",
    ],
  },
  {
    name: "Siddhivinayak (सिद्धिविनायक)",
    height: "14 inches",
    material: "Shadu mati",
    price: "₹1,799",
    description: "A little Bappa for desks, cars and gifting. Same honest clay, same handcrafted care — in a gentle, pocket-friendly size.",
    images: ["images/6.1.webp", "images/6.2.webp", "images/6.3.webp"],
    versions: [
      "premium",
      "basic",
    ],
  },
  {
    name: "Bal Ganesh (बाल गणेश)",
    height: "13 inches",
    material: "Shadu mati",
    price: "₹1,499",
    description: "A little Bappa for desks, cars and gifting. Same honest clay, same handcrafted care — in a gentle, pocket-friendly size.",
    images: ["images/7.1.webp", "images/7.2.webp", "images/7.3.webp"],
    versions: [
      "premium",
      "basic",
    ],
  },
  {
    name: "Ashtavinayak (अष्टविनायक)",
    height: "12 inches",
    material: "Shadu mati",
    price: "₹1,099",
    description: "A little Bappa for desks, cars and gifting. Same honest clay, same handcrafted care — in a gentle, pocket-friendly size.",
    images: ["images/8.1.webp", "images/8.2.webp", "images/8.3.webp"],
    versions: [
      /* "premium", */
      "basic",
    ],
  },
  {
    name: "Gajkarna (गजकर्ण)",
    height: "12 inches",
    material: "Shadu mati",
    price: "₹1,499",
    description: "A little Bappa for desks, cars and gifting. Same honest clay, same handcrafted care — in a gentle, pocket-friendly size.",
    images: ["images/9.1.webp", "images/9.2.webp", "images/9.3.webp"],
    versions: [
      "premium",
      "basic",
    ],
  },
];

// ==================== RENDER PRODUCTS ====================
function waLink(product) {
  const msg = encodeURIComponent(`Namaste Shivatmaj Creations! I'd like to order the "${product.name}" (${product.height}) eco-friendly Ganesha idol.`);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
}

function productMarkup(p, index) {
  const thumbItems = p.images
    .map((src, i) =>
      `<button class="product__thumb${i === 0 ? " is-active" : ""}" data-index="${i}" data-testid="product-${index}-thumb-${i}" aria-label="View variation ${i + 1} of ${p.name}">
        <img src="${src}" alt="${p.name} variation ${i + 1}" loading="lazy" />
      </button>`
    ).join("");

  let premiumHTML = "";
  let basicHTML = "";

  // Build premium version HTML if "premium" is in versions array
  if (p.versions.includes("premium")) {
    premiumHTML = `
    <article class="product product--premium reveal" data-product="${index}" data-testid="product-card-${index}-premium">
      <div class="product__version-badge product__version-badge--premium">शिवात्मज – अलंकृत</div>
      <div class="product__media">
        <div class="product__frame product__frame--premium">
          <img class="product__main" src="${p.images[0]}" alt="${p.name} — premium eco-friendly clay Ganesha idol" data-testid="product-${index}-premium-main-image" loading="lazy" />
        </div>
        <div class="product__carousel">
          <button class="carousel__btn carousel__btn--prev" aria-label="Previous variations" data-dir="prev">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="product__thumbs" data-testid="product-${index}-premium-thumbs">${thumbItems}</div>
          <button class="carousel__btn carousel__btn--next" aria-label="Next variations" data-dir="next">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
      <div class="product__body">
        <h3 class="product__name">${p.name}</h3>
        <dl class="product__meta">
          <div><dt>Height</dt><dd>${p.height}</dd></div>
          <div><dt>Material</dt><dd>${p.material}</dd></div>
        </dl>
        <p class="product__desc">${p.description}</p>
        <div class="product__foot">
          <span class="product__price"><small>Starting at</small>${p.price}</span>
          <a class="btn product__wa product__wa--premium" href="${waLink(p)}" target="_blank" rel="noopener" data-testid="product-${index}-premium-whatsapp-btn">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M.06 24l1.68-6.15A11.86 11.86 0 0 1 .16 11.9C.16 5.34 5.5 0 12.06 0a11.82 11.82 0 0 1 8.41 3.49 11.82 11.82 0 0 1 3.48 8.41c0 6.56-5.34 11.9-11.9 11.9a11.9 11.9 0 0 1-5.69-1.45L.06 24zm6.6-3.8c1.68.99 3.28 1.58 5.4 1.58 5.45 0 9.89-4.43 9.89-9.88A9.86 9.86 0 0 0 12.06 2C6.6 2 2.17 6.44 2.17 11.9c0 2.22.65 3.88 1.74 5.62l-1 3.62 3.75-.94zm11.39-5.55c-.07-.12-.27-.2-.57-.35-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.42z"/></svg>
            Order on WhatsApp
          </a>
        </div>
      </div>
    </article>`;
  }

  // Build basic version HTML if "basic" is in versions array
  if (p.versions.includes("basic")) {
    basicHTML = `
    <article class="product product--basic reveal" data-product="${index}" data-testid="product-card-${index}-basic">
      <div class="product__version-badge product__version-badge--basic">शिवात्मज – सहज</div>
      <div class="product__media">
        <div class="product__frame">
          <img class="product__main" src="${p.images[0]}" alt="${p.name} — basic eco-friendly clay Ganesha idol" data-testid="product-${index}-basic-main-image" loading="lazy" />
        </div>
        <div class="product__carousel">
          <button class="carousel__btn carousel__btn--prev" aria-label="Previous variations" data-dir="prev">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="product__thumbs" data-testid="product-${index}-basic-thumbs">${thumbItems}</div>
          <button class="carousel__btn carousel__btn--next" aria-label="Next variations" data-dir="next">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
      <div class="product__body">
        <h3 class="product__name">${p.name}</h3>
        <dl class="product__meta">
          <div><dt>Height</dt><dd>${p.height}</dd></div>
          <div><dt>Material</dt><dd>${p.material}</dd></div>
        </dl>
        <p class="product__desc">${p.description}</p>
        <div class="product__foot">
          <span class="product__price"><small>Starting at</small>${p.price}</span>
          <a class="btn product__wa" href="${waLink(p)}" target="_blank" rel="noopener" data-testid="product-${index}-basic-whatsapp-btn">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M.06 24l1.68-6.15A11.86 11.86 0 0 1 .16 11.9C.16 5.34 5.5 0 12.06 0a11.82 11.82 0 0 1 8.41 3.49 11.82 11.82 0 0 1 3.48 8.41c0 6.56-5.34 11.9-11.9 11.9a11.9 11.9 0 0 1-5.69-1.45L.06 24zm6.6-3.8c1.68.99 3.28 1.58 5.4 1.58 5.45 0 9.89-4.43 9.89-9.88A9.86 9.86 0 0 0 12.06 2C6.6 2 2.17 6.44 2.17 11.9c0 2.22.65 3.88 1.74 5.62l-1 3.62 3.75-.94zm11.39-5.55c-.07-.12-.27-.2-.57-.35-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.42z"/></svg>
            Order on WhatsApp
          </a>
        </div>
      </div>
    </article>`;
  }

  return `
  <div class="product-group" data-product-group="${index}">
    ${premiumHTML}
    ${basicHTML}
  </div>`;
}

function renderProducts() {
  const list = document.getElementById("productList");
  if (!list) return;
  list.innerHTML = PRODUCTS.map(productMarkup).join("");

  setTimeout(() => {
    document.querySelectorAll(".product").forEach(el => productObserver.observe(el));
  }, 500);

  list.querySelectorAll(".product").forEach((card) => {
    const idx = Number(card.dataset.product);
    const main = card.querySelector(".product__main");
    const thumbsContainer = card.querySelector(".product__thumbs");
    const thumbs = card.querySelectorAll(".product__thumb");
    const prevBtn = card.querySelector(".carousel__btn--prev");
    const nextBtn = card.querySelector(".carousel__btn--next");

    thumbs.forEach((thumb) => {
      thumb.addEventListener("click", () => {
        const i = Number(thumb.dataset.index);
        const newSrc = PRODUCTS[idx].images[i];
        if (main.src === newSrc) return;
        main.classList.add("is-fading");
        setTimeout(() => { main.src = newSrc; main.classList.remove("is-fading"); }, 260);
        thumbs.forEach((t) => t.classList.remove("is-active"));
        thumb.classList.add("is-active");
        thumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      });
    });

    const scrollAmount = () => (thumbs[0]?.offsetWidth || 64) + 12;
    prevBtn.addEventListener("click", () => thumbsContainer.scrollBy({ left: -scrollAmount() * 2, behavior: "smooth" }));
    nextBtn.addEventListener("click", () => thumbsContainer.scrollBy({ left: scrollAmount() * 2, behavior: "smooth" }));

    const updateBtnVisibility = () => {
      const t = 4, atStart = thumbsContainer.scrollLeft <= t, atEnd = thumbsContainer.scrollLeft + thumbsContainer.clientWidth >= thumbsContainer.scrollWidth - t;
      prevBtn.style.opacity = atStart ? "0.3" : "1"; prevBtn.style.pointerEvents = atStart ? "none" : "auto";
      nextBtn.style.opacity = atEnd ? "0.3" : "1"; nextBtn.style.pointerEvents = atEnd ? "none" : "auto";
    };
    thumbsContainer.addEventListener("scroll", updateBtnVisibility, { passive: true });
    window.addEventListener("resize", updateBtnVisibility);
    updateBtnVisibility();
  });
}

// ==================== NAVBAR, REVEAL, PARALLAX, LOADER ====================
function initNavbar() {
  const nav = document.getElementById("nav"), toggle = document.getElementById("navToggle"), mobile = document.getElementById("navMobile");
  const onScroll = () => nav.classList.toggle("is-solid", window.scrollY > 40);
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
  const close = () => { toggle.classList.remove("is-open"); mobile.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); };
  toggle.addEventListener("click", () => { const o = toggle.classList.toggle("is-open"); mobile.classList.toggle("is-open", o); toggle.setAttribute("aria-expanded", String(o)); });
  mobile.querySelectorAll("a").forEach(a => a.addEventListener("click", close));
}

function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) { items.forEach(el => el.classList.add("is-visible")); return; }
  const io = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); } }); }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
  items.forEach(el => io.observe(el));
}

function initParallax() {
  const media = document.querySelector("[data-parallax]");
  if (!media || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let ticking = false;
  window.addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(() => { media.style.transform = `translate3d(0, ${Math.min(window.scrollY, window.innerHeight) * 0.18}px, 0) scale(1.02)`; ticking = false; }); ticking = true; } }, { passive: true });
}

function initLoader() {
  const loader = document.getElementById("loader");
  const done = () => { document.body.classList.add("is-loaded"); if (loader) setTimeout(() => loader.classList.add("is-done"), 400); };
  window.addEventListener("load", () => setTimeout(done, 500));
  setTimeout(done, 2500);
}

document.addEventListener("DOMContentLoaded", () => {
  const yr = document.getElementById("year"); if (yr) yr.textContent = new Date().getFullYear();
  renderProducts();
  initNavbar();
  initReveal();
  initParallax();
  initLoader();
});
