const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { URL } = require("node:url");

const root = __dirname;
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const categories = ["เสื้อ", "รองเท้า", "หมวก", "กางเกง", "กระเป๋า", "เข็มขัด", "แว่น", "Other"];
const categoryPrefixes = {
  "เสื้อ": "SH",
  "รองเท้า": "SO",
  "หมวก": "HA",
  "กางเกง": "PA",
  "กระเป๋า": "BA",
  "เข็มขัด": "BE",
  "แว่น": "GL",
  "Other": "OT"
};

const categoryKeywords = [
  ["เสื้อ", ["shirt", "tee", "tshirt", "jacket", "hoodie", "coat", "top", "เสื้อ"]],
  ["รองเท้า", ["shoe", "shoes", "sneaker", "sneakers", "converse", "boot", "slipon", "รองเท้า"]],
  ["หมวก", ["hat", "cap", "หมวก"]],
  ["กางเกง", ["pants", "jeans", "denim", "trouser", "levis", "levi", "กางเกง", "ยีนส์"]],
  ["กระเป๋า", ["bag", "tote", "purse", "wallet", "กระเป๋า"]],
  ["เข็มขัด", ["belt", "เข็มขัด"]],
  ["แว่น", ["glass", "glasses", "sunglasses", "eyewear", "แว่น"]]
];
const knownProducts = {
  "converse-red-shoes.jpg": {
    category: "รองเท้า",
    name: "Converse แดงหุ้มข้อ",
    price: "สอบถามราคา",
    description: "รองเท้าผ้าใบหุ้มข้อสีแดง ทรงคลาสสิค มีเสน่ห์แบบของมือสอง เหมาะกับลุควินเทจประจำวัน"
  },
  "converse-blue-shoes.jpg": {
    category: "รองเท้า",
    name: "Converse น้ำเงินหุ้มข้อ",
    price: "สอบถามราคา",
    description: "รองเท้าผ้าใบหุ้มข้อสีน้ำเงิน โทนเรียบ ใส่เข้ากับยีนส์และเสื้อผ้าวินเทจได้ง่าย"
  },
  "tropical-slipon-shoes.jpg": {
    category: "รองเท้า",
    name: "Slip-on ลายทรอปิคอล",
    price: "สอบถามราคา",
    description: "รองเท้า slip-on ผ้าแคนวาสลายสีสดแบบเรโทร เป็นชิ้นเด่นสำหรับลุคสนุกแต่ยังมีความเก่า"
  },
  "levis-501-label.jpg": {
    category: "กางเกง",
    name: "Levi's 501 XX W30 L36",
    price: "สอบถามราคา",
    description: "ยีนส์ Levi's 501 XX ป้าย W30 L36 สำหรับสายเดนิมที่ชอบรายละเอียดและคาแรกเตอร์ของผ้าเก่า"
  },
  "denim-collection.jpg": {
    category: "กระเป๋า",
    name: "เซ็ตเดนิม Joan500",
    price: "สอบถามราคา",
    description: "เซ็ตเดนิมรวมกระเป๋า หมวก และยีนส์ โทนคลาสสิค เหมาะกับการจัดลุควินเทจทั้งชุด"
  },
  "vespa-vintage.jpg": {
    category: "Other",
    name: "Vespa วินเทจ",
    price: "สอบถามราคา",
    description: "ไอเท็มพิเศษในหมวด Other สำหรับของที่ไม่เข้าหมวดหลัก เหมาะกับคนชอบของเก่ามีเรื่องราว"
  }
};
const knownProductOrder = [
  "converse-red-shoes.jpg",
  "converse-blue-shoes.jpg",
  "tropical-slipon-shoes.jpg",
  "levis-501-label.jpg",
  "denim-collection.jpg",
  "vespa-vintage.jpg"
];

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".svg": "image/svg+xml"
};

function readImageFiles(folder) {
  const directory = path.join(root, folder);
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, "th"));
}

function inferCategory(fileName) {
  const text = fileName.toLowerCase();
  for (const [category, keywords] of categoryKeywords) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      return category;
    }
  }
  return "Other";
}

function titleFromFile(fileName) {
  return path.basename(fileName, path.extname(fileName))
    .replace(/^\d+[-_\s]*/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase()) || "Vintage Item";
}

function buildProducts() {
  const counters = Object.fromEntries(categories.map((category) => [category, 0]));
  const order = new Map(knownProductOrder.map((fileName, index) => [fileName, index]));
  return readImageFiles("img").sort((a, b) => {
    const aOrder = order.has(a) ? order.get(a) : Number.MAX_SAFE_INTEGER;
    const bOrder = order.has(b) ? order.get(b) : Number.MAX_SAFE_INTEGER;
    return aOrder - bOrder || a.localeCompare(b, "th");
  }).map((fileName, index) => {
    const known = knownProducts[fileName] || {};
    const category = known.category || inferCategory(fileName);
    counters[category] += 1;
    const code = `J500-${categoryPrefixes[category]}${String(counters[category]).padStart(2, "0")}`;
    const name = known.name || titleFromFile(fileName);

    return {
      code,
      category,
      name,
      price: known.price || "สอบถามราคา",
      image: `/img/${encodeURIComponent(fileName)}`,
      featured: index < 8,
      description: known.description || `สินค้า Joan500 รหัส ${code} อยู่ในหมวด ${category} สามารถทักสอบถามรายละเอียดและรูปเพิ่มเติมได้`
    };
  });
}

function findLogo() {
  const logo = readImageFiles("logo")[0];
  return logo ? `/logo/${encodeURIComponent(logo)}` : "";
}

function sendJson(response, data) {
  const body = JSON.stringify(data);
  response.writeHead(200, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body)
  });
  response.end(body);
}

function sendNotFound(response) {
  response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
  response.end("Not found");
}

function serveStatic(requestPath, response) {
  const cleanPath = decodeURIComponent(requestPath.split("?")[0]);
  const relativePath = cleanPath === "/" ? "index.html" : cleanPath.replace(/^\/+/, "");
  const filePath = path.resolve(root, relativePath);

  if (!filePath.startsWith(root)) {
    sendNotFound(response);
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      sendNotFound(response);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    response.writeHead(200, { "content-type": mimeTypes[ext] || "application/octet-stream" });
    fs.createReadStream(filePath).pipe(response);
  });
}

function createServer() {
  return http.createServer((request, response) => {
    const url = new URL(request.url, "http://localhost");
    if (url.pathname === "/api/store") {
      sendJson(response, {
        products: buildProducts(),
        logo: findLogo()
      });
      return;
    }
    serveStatic(url.pathname, response);
  });
}

function listen(port) {
  const server = createServer();
  server.on("error", (error) => {
    if (error.code === "EADDRINUSE" && port < 5190) {
      listen(port + 1);
      return;
    }
    throw error;
  });
  server.listen(port, "127.0.0.1", () => {
    console.log(`Joan500 running at http://127.0.0.1:${port}`);
  });
}

listen(Number(process.env.PORT) || 5173);
