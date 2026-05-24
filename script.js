const CATEGORIES = [
  { id: "featured", label: "หน้าหลัก" },
  { id: "all", label: "สินค้าทั้งหมด" },
  { id: "เสื้อ", label: "เสื้อ" },
  { id: "รองเท้า", label: "รองเท้า" },
  { id: "หมวก", label: "หมวก" },
  { id: "กางเกง", label: "กางเกง" },
  { id: "กระเป๋า", label: "กระเป๋า" },
  { id: "เข็มขัด", label: "เข็มขัด" },
  { id: "แว่น", label: "แว่น" },
  { id: "Other", label: "Other" }
];

const CATEGORY_COLORS = {
  "เสื้อ": "#6f3039",
  "รองเท้า": "#315c74",
  "หมวก": "#515f3c",
  "กางเกง": "#40566d",
  "กระเป๋า": "#8d573a",
  "เข็มขัด": "#6d4628",
  "แว่น": "#273d43",
  "Other": "#9e5137"
};

const CATEGORY_PREFIX = {
  "เสื้อ": "SH",
  "รองเท้า": "SO",
  "หมวก": "HA",
  "กางเกง": "PA",
  "กระเป๋า": "BA",
  "เข็มขัด": "BE",
  "แว่น": "GL",
  "Other": "OT"
};

const INSTAGRAM_URL = "#";
const LINE_PAGE_URL = "#";
const LINE_OA_ID = "";
const STATIC_LOGO = "logo/joan500-logo.jpg";
const STATIC_PRODUCTS = [
  {
    code: "J500-SO01",
    category: "รองเท้า",
    name: "Converse แดงหุ้มข้อ",
    price: "สอบถามราคา",
    image: "img/converse-red-shoes.jpg",
    featured: true,
    description: "รองเท้าผ้าใบหุ้มข้อสีแดง ทรงคลาสสิค มีเสน่ห์แบบของมือสอง เหมาะกับลุควินเทจประจำวัน"
  },
  {
    code: "J500-SO02",
    category: "รองเท้า",
    name: "Converse น้ำเงินหุ้มข้อ",
    price: "สอบถามราคา",
    image: "img/converse-blue-shoes.jpg",
    featured: true,
    description: "รองเท้าผ้าใบหุ้มข้อสีน้ำเงิน โทนเรียบ ใส่เข้ากับยีนส์และเสื้อผ้าวินเทจได้ง่าย"
  },
  {
    code: "J500-SO03",
    category: "รองเท้า",
    name: "Slip-on ลายทรอปิคอล",
    price: "สอบถามราคา",
    image: "img/tropical-slipon-shoes.jpg",
    featured: true,
    description: "รองเท้า slip-on ผ้าแคนวาสลายสีสดแบบเรโทร เป็นชิ้นเด่นสำหรับลุคสนุกแต่ยังมีความเก่า"
  },
  {
    code: "J500-PA01",
    category: "กางเกง",
    name: "Levi's 501 XX W30 L36",
    price: "สอบถามราคา",
    image: "img/levis-501-label.jpg",
    featured: true,
    description: "ยีนส์ Levi's 501 XX ป้าย W30 L36 สำหรับสายเดนิมที่ชอบรายละเอียดและคาแรกเตอร์ของผ้าเก่า"
  },
  {
    code: "J500-BA01",
    category: "กระเป๋า",
    name: "เซ็ตเดนิม Joan500",
    price: "สอบถามราคา",
    image: "img/denim-collection.jpg",
    featured: true,
    description: "เซ็ตเดนิมรวมกระเป๋า หมวก และยีนส์ โทนคลาสสิค เหมาะกับการจัดลุควินเทจทั้งชุด"
  },
  {
    code: "J500-OT01",
    category: "Other",
    name: "Vespa วินเทจ",
    price: "สอบถามราคา",
    image: "img/vespa-vintage.jpg",
    featured: true,
    description: "ไอเท็มพิเศษในหมวด Other สำหรับของที่ไม่เข้าหมวดหลัก เหมาะกับคนชอบของเก่ามีเรื่องราว"
  }
];

const state = {
  products: [],
  activeCategory: "featured",
  activeProduct: null
};

const navTabs = document.querySelector("#navTabs");
const categoryRow = document.querySelector("#categoryRow");
const productGrid = document.querySelector("#productGrid");
const productsTitle = document.querySelector("#productsTitle");
const productsTag = document.querySelector("#productsTag");
const productsIntro = document.querySelector("#productsIntro");
const emptyState = document.querySelector("#emptyState");
const heroPreview = document.querySelector("#heroPreview");
const brandLogo = document.querySelector("#brandLogo");
const heroLogo = document.querySelector("#heroLogo");
const modal = document.querySelector("#productModal");
const modalClose = document.querySelector("#modalClose");
const modalImage = document.querySelector("#modalImage");
const modalPlaceholder = document.querySelector("#modalPlaceholder");
const modalCode = document.querySelector("#modalCode");
const modalTitle = document.querySelector("#modalTitle");
const modalDescription = document.querySelector("#modalDescription");
const modalCategory = document.querySelector("#modalCategory");
const modalPrice = document.querySelector("#modalPrice");
const modalLineBtn = document.querySelector("#modalLineBtn");
const toast = document.querySelector("#toast");

function init() {
  wireSocialButtons();
  renderTabs();
  loadStoreData();
  wireEvents();
}

async function loadStoreData() {
  try {
    const response = await fetch("/api/store");
    if (!response.ok) throw new Error("Cannot load store API");
    const data = await response.json();
    state.products = data.products && data.products.length ? data.products : fallbackProducts();
    setLogo(data.logo || STATIC_LOGO);
  } catch (error) {
    state.products = fallbackProducts();
    setLogo(STATIC_LOGO);
  }

  renderHeroPreview();
  renderProducts();
}

function fallbackProducts() {
  return STATIC_PRODUCTS;
}

function setLogo(src) {
  [brandLogo, heroLogo].forEach((image) => {
    image.classList.remove("is-hidden");
    image.src = src || "";
    image.onerror = () => image.classList.add("is-hidden");
  });
}

function wireSocialButtons() {
  const buttons = [
    document.querySelector("#instagramBtn"),
    document.querySelector("#contactIgBtn")
  ];
  buttons.forEach((button) => {
    button.href = INSTAGRAM_URL;
    button.addEventListener("click", placeholderClick("ยังไม่ได้ใส่ลิงก์ Instagram"));
  });

  const lineButtons = [
    document.querySelector("#lineBtn"),
    document.querySelector("#contactLineBtn")
  ];
  lineButtons.forEach((button) => {
    button.href = LINE_PAGE_URL;
    button.addEventListener("click", placeholderClick("ยังไม่ได้ใส่ลิงก์ LINE"));
  });
}

function placeholderClick(message) {
  return (event) => {
    if (event.currentTarget.getAttribute("href") === "#") {
      event.preventDefault();
      showToast(message);
    }
  };
}

function renderTabs() {
  const markup = CATEGORIES.map((category) => `
    <button class="tab-btn" type="button" data-category="${category.id}">${category.label}</button>
  `).join("");
  navTabs.innerHTML = markup;
  categoryRow.innerHTML = markup.replaceAll("tab-btn", "category-chip");
  updateActiveButtons();
}

function wireEvents() {
  document.addEventListener("click", (event) => {
    const categoryButton = event.target.closest("[data-category]");
    if (categoryButton) {
      setCategory(categoryButton.dataset.category);
      return;
    }

    const card = event.target.closest("[data-product-code]");
    if (card) {
      openProduct(card.dataset.productCode);
    }
  });

  productGrid.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const card = event.target.closest("[data-product-code]");
    if (!card) return;
    event.preventDefault();
    openProduct(card.dataset.productCode);
  });

  document.querySelectorAll("[data-home-link]").forEach((link) => {
    link.addEventListener("click", () => setCategory("featured", false));
  });

  modalClose.addEventListener("click", closeProduct);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeProduct();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeProduct();
  });

  modalLineBtn.addEventListener("click", (event) => {
    if (modalLineBtn.getAttribute("href") !== "#") return;
    event.preventDefault();
    const message = buildLineMessage(state.activeProduct);
    copyText(message);
    showToast("คัดลอกข้อความทัก LINE พร้อมรหัสสินค้าแล้ว");
  });
}

function setCategory(category, scroll = true) {
  state.activeCategory = category;
  updateActiveButtons();
  renderProducts();
  if (scroll) {
    document.querySelector("#products").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function updateActiveButtons() {
  document.querySelectorAll("[data-category]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.category === state.activeCategory);
  });
}

function productsForCategory() {
  if (state.activeCategory === "featured") {
    return state.products.filter((product) => product.featured).slice(0, 8);
  }

  if (state.activeCategory === "all") {
    return state.products;
  }

  return state.products.filter((product) => product.category === state.activeCategory);
}

function renderProducts() {
  const products = productsForCategory();
  const active = CATEGORIES.find((category) => category.id === state.activeCategory);
  const label = active ? active.label : "สินค้า";
  productsTitle.textContent = state.activeCategory === "featured" ? "สินค้าแนะนำ" : label;
  productsTag.textContent = state.activeCategory === "featured" ? "Selected drops" : "Category";
  productsIntro.textContent = state.activeCategory === "featured"
    ? "หน้าหลักจะแสดงสินค้าบางส่วนก่อน เลือกแท็บด้านบนเพื่อดูสินค้าแยกตามหมวด"
    : `กำลังแสดงสินค้าในหมวด ${label}`;

  emptyState.hidden = products.length > 0;
  productGrid.innerHTML = products.map(productCard).join("");
}

function productCard(product, index = 0) {
  const color = CATEGORY_COLORS[product.category] || CATEGORY_COLORS.Other;
  const image = product.image
    ? `<img src="${product.image}" alt="${escapeHtml(product.name)}" loading="lazy" onerror="this.replaceWith(this.nextElementSibling)">`
    : "";
  return `
    <article class="product-card" tabindex="0" role="button" data-product-code="${product.code}" style="--tile-color: ${color}; --delay: ${Math.min(index * 45, 260)}ms">
      <div class="product-image">
        ${image}
        <div class="image-fallback">${product.code}</div>
        <span class="product-code">${product.code}</span>
      </div>
      <div class="product-body">
        <div class="product-meta">
          <span>${product.category}</span>
          <span>${product.code}</span>
        </div>
        <h3>${escapeHtml(product.name)}</h3>
        <div class="price">${escapeHtml(product.price)}</div>
      </div>
    </article>
  `;
}

function renderHeroPreview() {
  const withImages = state.products.filter((product) => product.image).slice(0, 3);
  if (!withImages.length) {
    heroPreview.innerHTML = `<div class="hero-empty">Joan500 vintage second-hand store</div>`;
    return;
  }

  heroPreview.innerHTML = withImages.map((product) => `
    <div class="hero-thumb">
      <img src="${product.image}" alt="${escapeHtml(product.name)}">
    </div>
  `).join("");
}

function openProduct(code) {
  const product = state.products.find((item) => item.code === code);
  if (!product) return;
  state.activeProduct = product;

  modal.style.setProperty("--modal-color", CATEGORY_COLORS[product.category] || CATEGORY_COLORS.Other);
  modalCode.textContent = product.code;
  modalTitle.textContent = product.name;
  modalDescription.textContent = product.description;
  modalCategory.textContent = product.category;
  modalPrice.textContent = product.price;
  modalPlaceholder.textContent = product.code;

  modalImage.classList.remove("is-hidden");
  modalImage.src = product.image || "";
  modalImage.alt = product.image ? product.name : "";
  modalImage.onerror = () => modalImage.classList.add("is-hidden");

  modalLineBtn.href = buildLineHref(product);
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeProduct() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function buildLineMessage(product) {
  if (!product) return "สวัสดีค่ะ ทักจากเว็บ Joan500";
  return `สวัสดีค่ะ ทักจากสินค้ารหัส ${product.code} - ${product.name} ในเว็บ Joan500`;
}

function buildLineHref(product) {
  const message = encodeURIComponent(buildLineMessage(product));
  if (LINE_OA_ID) {
    return `https://line.me/R/oaMessage/${encodeURIComponent(LINE_OA_ID)}/?${message}`;
  }
  if (LINE_PAGE_URL !== "#") {
    return LINE_PAGE_URL;
  }
  return "#";
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.info(text);
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2600);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

init();
