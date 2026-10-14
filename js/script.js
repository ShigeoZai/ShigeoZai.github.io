/**
 * =========================================================================
 * GAMERIG E-Commerce Hardware Engine
 * Data Structures & Algorithms OOP Core - NIM Ganjil Architecture
 * 
 * Catatan Pengujian (F12 Developer Console):
 * - Sorting: QuickSort & BubbleSort mencetak log perbandingan & swaps ke Console.
 * - Searching: Binary Search O(log n) & Linear Search O(n) mencetak penelusuran.
 * - Contiguous Memory & Pointer Reference diemulasikan via class MemoryPointerManager.
 * =========================================================================
 */

// -------------------------------------------------------------------------
// [POINT 0]: STRUCT REPRESENTATION (PC HARDWARE ELEMENT)
// -------------------------------------------------------------------------
class ProductStruct {
  constructor(id, name, price, stock, category, rating, memAddress, image) {
    this.id = Number(id);
    this.name = String(name);
    this.price = Number(price);
    this.stock = Number(stock);
    this.category = String(category);
    this.rating = Number(rating);
    this.image = image ? String(image) : '';
    this.memAddress = memAddress || '0x7FFE00'; // 64-byte aligned virtual memory representation
  }
}

// -------------------------------------------------------------------------
// [POINT 0]: CONTIGUOUS MEMORY & POINTER REFERENCE MANAGER
// -------------------------------------------------------------------------
class MemoryPointerManager {
  constructor(baseAddress = 0x7FFE00, offsetBytes = 0x40) {
    this.baseAddress = baseAddress;
    this.offsetBytes = offsetBytes; // 64 Bytes struct alignment
    this.activePointer = null;
  }

  calculateAddress(index) {
    const computed = this.baseAddress + (index * this.offsetBytes);
    return '0x' + computed.toString(16).toUpperCase();
  }

  setActivePointer(address) {
    this.activePointer = address;
  }

  dereference(catalogArray) {
    if (!this.activePointer) return null;
    return catalogArray.find(item => item.memAddress === this.activePointer) || null;
  }
}

// -------------------------------------------------------------------------
// [POINT 0]: ARRAY OF STRUCTS CONTAINER (CONTIGUOUS HEAP CAPACITY 16)
// -------------------------------------------------------------------------
class ProductCatalogArray {
  constructor(memoryManager, capacity = 16) {
    this.memoryManager = memoryManager;
    this.capacity = capacity;
    this.items = [];
  }

  insert(data) {
    if (this.items.length >= this.capacity) {
      alert(`Array Overflow! Maksimum kapasitas contiguous heap (${this.capacity} nodes) telah penuh.`);
      return null;
    }
    const index = this.items.length;
    const addr = this.memoryManager.calculateAddress(index);
    const newStruct = new ProductStruct(
      data.id,
      data.name,
      data.price,
      data.stock,
      data.category,
      data.rating,
      addr,
      data.image
    );
    this.items.push(newStruct);
    return newStruct;
  }

  delete(id) {
    const idx = this.items.findIndex(item => item.id === Number(id));
    if (idx !== -1) {
      this.items.splice(idx, 1);
      this.realignMemoryAddresses();
      return true;
    }
    return false;
  }

  realignMemoryAddresses() {
    this.items.forEach((item, i) => {
      item.memAddress = this.memoryManager.calculateAddress(i);
    });
  }

  clear() {
    this.items = [];
  }

  size() {
    return this.items.length;
  }

  get(index) {
    return this.items[index];
  }

  setItems(newItems) {
    this.items = newItems;
    this.realignMemoryAddresses();
  }

  shuffle() {
    for (let i = this.items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.items[i], this.items[j]] = [this.items[j], this.items[i]];
    }
    this.realignMemoryAddresses();
  }
}

// -------------------------------------------------------------------------
// LOG ALGORITMA: menyalin log sorting & searching supaya bisa tampil di web
// -------------------------------------------------------------------------
const AlgoLog = {
  sorting: [],
  searching: [],

  // Ubah argumen console.log menjadi satu baris teks
  toText(args) {
    const [first, ...rest] = args;
    let text = String(first).replace(/%c/g, '');
    rest.forEach(a => {
      if (typeof a === 'string' && !a.includes('color:')) text += ' ' + a;
      else if (typeof a === 'number') text += ' ' + a;
    });
    return text.trim();
  },

  // Jalankan fungsi fn, sambil menyalin semua console.log di dalamnya
  capture(type, fn) {
    const time = new Date().toLocaleTimeString('id-ID');
    const lines = [];
    const origLog = console.log;
    const origGroup = console.groupCollapsed;
    const origTable = console.table;

    console.log = (...args) => { lines.push('  ' + this.toText(args)); origLog(...args); };
    console.groupCollapsed = (...args) => { lines.push(this.toText(args)); origGroup(...args); };
    console.table = (rows) => {
      rows.forEach((r, i) => {
        lines.push(`  ${i + 1}. ` + Object.entries(r).map(([k, v]) => `${k}: ${v}`).join(' | '));
      });
      origTable(rows);
    };

    let result;
    try {
      result = fn();
    } finally {
      // selalu kembalikan console seperti semula
      console.log = origLog;
      console.groupCollapsed = origGroup;
      console.table = origTable;
    }

    this[type].push(`── ${time} ──`, ...lines, '');
    if (this[type].length > 300) this[type] = this[type].slice(-300);
    return result;
  }
};

// -------------------------------------------------------------------------
// [POINT 1]: SORTING ENGINE (BUBBLE & QUICKSORT WITH CONSOLE TRACING)
// -------------------------------------------------------------------------
class SortingEngine {
  static bubbleSort(array, field, order = 'asc') {
    const arr = [...array];
    const n = arr.length;
    let comparisons = 0;
    let swaps = 0;
    const startTime = performance.now();

    console.groupCollapsed(`%c[SORTING] BubbleSort O(n²) pada field '${field}' (${order.toUpperCase()})`, "color: #dc2626; font-weight: bold;");
    console.log(`Array Size: ${n} items. Base Pointer: ${arr[0]?.memAddress}`);

    for (let i = 0; i < n - 1; i++) {
      let passSwapped = false;
      for (let j = 0; j < n - i - 1; j++) {
        comparisons++;
        let valA = arr[j][field];
        let valB = arr[j + 1][field];

        let shouldSwap = false;
        if (typeof valA === 'string') {
          shouldSwap = order === 'asc' ? valA.localeCompare(valB) > 0 : valA.localeCompare(valB) < 0;
        } else {
          shouldSwap = order === 'asc' ? valA > valB : valA < valB;
        }

        if (shouldSwap) {
          swaps++;
          passSwapped = true;
          const temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          console.log(`Swap [${j} <-> ${j+1}]:`, arr[j].name, "<->", arr[j+1].name);
        }
      }
      if (!passSwapped) break;
    }

    const duration = performance.now() - startTime;
    console.log(`Tuntas: ${comparisons} perbandingan, ${swaps} swaps, waktu: ${duration.toFixed(2)} ms.`);
    console.table(arr.map(i => ({ ID: i.id, Name: i.name, [field]: i[field], Pointer: i.memAddress })));
    console.groupEnd();

    return { sortedArray: arr, comparisons, swaps, duration, algorithm: 'BubbleSort' };
  }

  static quickSort(array, field, order = 'asc') {
    const arr = [...array];
    let comparisons = 0;
    let swaps = 0;
    const startTime = performance.now();

    console.groupCollapsed(`%c[SORTING] QuickSort O(n log n) Divide & Conquer pada '${field}' (${order.toUpperCase()})`, "color: #10b981; font-weight: bold;");
    console.log(`Urutan awal (ID): ${arr.map(i => i.id).join(', ')}`);

    function compare(a, b) {
      comparisons++;
      if (typeof a === 'string') {
        return order === 'asc' ? a.localeCompare(b) < 0 : a.localeCompare(b) > 0;
      }
      return order === 'asc' ? a < b : a > b;
    }

    function partition(low, high) {
      const pivot = arr[high];
      const pivotVal = pivot[field];
        console.log(`Partition [${low}..${high}] pivot: ${pivot.name} (${pivotVal})`);
      let i = low - 1;

      for (let j = low; j < high; j++) {
        const currentVal = arr[j][field];
        if (compare(currentVal, pivotVal)) {
          i++;
          swaps++;
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
      }

      swaps++;
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        console.log(`Pivot ditempatkan di index [${i + 1}]`);
      return i + 1;
    }

    function sort(low, high) {
      if (low < high) {
        const pi = partition(low, high);
        sort(low, pi - 1);
        sort(pi + 1, high);
      }
    }

    if (arr.length > 0) {
      sort(0, arr.length - 1);
    }

    const duration = performance.now() - startTime;
    console.log(`Tuntas: ${comparisons} perbandingan, ${swaps} swaps, waktu: ${duration.toFixed(2)} ms.`);
    console.table(arr.map(i => ({ ID: i.id, Name: i.name, [field]: i[field], Pointer: i.memAddress })));
    console.groupEnd();

    return { sortedArray: arr, comparisons, swaps, duration, algorithm: 'QuickSort' };
  }
}

// -------------------------------------------------------------------------
// [POINT 2]: SEARCHING ENGINE (BINARY & LINEAR SEARCH WITH CONSOLE TRACING)
// -------------------------------------------------------------------------
class SearchingEngine {
  static linearSearch(array, field, target) {
    console.groupCollapsed(`%c[SEARCHING] Linear Search O(n) mencari '${target}'`, "color: #3b82f6; font-weight: bold;");
    let iterations = 0;
    const targetStr = String(target).toLowerCase();

    for (let i = 0; i < array.length; i++) {
      iterations++;
      const cur = array[i];
      const val = cur[field];
      const valStr = String(val).toLowerCase();
        console.log(`Cek index [${i}]: ${cur.name}`);

      let match = false;
      if (field === 'id' || field === 'price') {
        match = Number(val) === Number(target);
      } else {
        match = valStr.includes(targetStr);
      }

      if (match) {
        console.log(`Match Found di index [${i}] @ ${cur.memAddress}:`, cur);
        console.groupEnd();
        return { found: true, index: i, item: cur, iterations, algorithm: 'Linear Search' };
      }
    }

    console.log(`Tidak ditemukan setelah memeriksa ${iterations} nodes.`);
    console.groupEnd();
    return { found: false, index: -1, item: null, iterations, algorithm: 'Linear Search' };
  }

  static binarySearch(array, field, target) {
    console.groupCollapsed(`%c[SEARCHING] Binary Search O(log n) mencari target '${target}'`, "color: #8b5cf6; font-weight: bold;");
    let low = 0;
    let high = array.length - 1;
    let iterations = 0;
    const targetVal = isNaN(target) ? String(target).toLowerCase() : Number(target);

    while (low <= high) {
      iterations++;
      let mid = Math.floor((low + high) / 2);
      const midItem = array[mid];
      const midVal = midItem[field];
      const midValNorm = isNaN(midVal) ? String(midVal).toLowerCase() : Number(midVal);

      console.log(`Langkah ${iterations}: Low=[${low}], High=[${high}], Mid=[${mid}] -> ${midItem.name}`);

      if (midValNorm === targetVal) {
        console.log(`Match Found di index [${mid}]! Memory Pointer: ${midItem.memAddress}`, midItem);
        console.groupEnd();
        return { found: true, index: mid, item: midItem, iterations, algorithm: 'Binary Search' };
      }

      if (midValNorm < targetVal) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    console.log(`Target tidak ditemukan dalam array.`);
    console.groupEnd();
    return { found: false, index: -1, item: null, iterations, algorithm: 'Binary Search' };
  }
}

// -------------------------------------------------------------------------
// APPLICATION CONTROLLER & E-COMMERCE STORE LOGIC
// -------------------------------------------------------------------------
class StoreAppController {
  constructor() {
    this.adminAccounts = [
      { name: 'Admin GAMERIG', email: 'admin@gamerig.id', password: 'admin123', role: 'admin' }
    ];
    this.users = [...this.adminAccounts, ...this.loadBuyers()];
    this.authMode = 'login';
    this.memoryManager = new MemoryPointerManager(0x7FFE00, 0x40);
    this.catalog = new ProductCatalogArray(this.memoryManager, 16);
    this.currentFilterCategory = 'ALL';
    this.currentSearchFilter = '';
    this.cart = [];
    this.wishlist = new Set();
    this.currentUser = null;
    this.cart = [];
    this.wishlist.clear();
    this.renderCart();
    this.renderStore();
    document.getElementById('wishlist-badge-count').classList.add('hidden');

    // 8 Realistic Hardware Presets
    this.presetHardware = [
      { id: 101, name: "Intel Core i7-14700K Raptor Lake", price: 6850000, stock: 14, category: "CPU", rating: 4.9, image: "images/intel-core-i7-14700k-raptor-lake.jpg" },
      { id: 103, name: "Gigabyte NVIDIA GeForce RTX 4070 Super Eagle OC 12GB GDDR6X", price: 10999000, stock: 8, category: "GPU", rating: 4.9, image: "images/gigabyte-nvidia-geforce-rtx-4070-super-eagle.png" },
      { id: 105, name: "ASUS ROG Strix B760-A Gaming WiFi D5", price: 4150000, stock: 11, category: "Motherboard", rating: 4.8, image: "images/asus-rog-strix-b760-a.jpg" },
      { id: 107, name: "Corsair Vengeance RGB DDR5 32GB (2x16) 6000MHz", price: 2199000, stock: 25, category: "RAM", rating: 4.8, image: "images/vengeance-rgb-ddr5-32gb.avif" },
      { id: 109, name: "Samsung 990 PRO NVMe M.2 SSD 2TB Gen4", price: 2950000, stock: 19, category: "Storage", rating: 4.9, image: "images/ssd-samsung-pro-990.png"},
      { id: 111, name: "Seasonic Focus GX-850 850W Gold Full Modular", price: 2450000, stock: 15, category: "PSU", rating: 4.8, image: "images/seasonic-focus-v3-gx-850-gold.jpg" },
      { id: 113, name: "NZXT Kraken Elite 360 RGB Liquid Cooler", price: 4750000, stock: 7, category: "Cooling", rating: 4.9, image: "images/nzxt-kraken-elite-360-rgb.jpeg" },
      { id: 115, name: "Lian Li O11 Dynamic EVO RGB Black Case", price: 2650000, stock: 9, category: "PC Case", rating: 4.8, image: "images/lian-li-o11-dynamic-evo-rgb.jpg" }
    ];

    this.init();
  }

  init() {
    this.loadCatalog();
    this.bindEvents();
    this.renderStore();
    this.renderCart();
    this.applyRoleUI();
    this.renderStore();
  }

  loadPresets() {
    this.catalog.clear();
    this.presetHardware.forEach(hw => this.catalog.insert(hw));
    if (this.catalog.items.length > 0) {
      this.memoryManager.setActivePointer(this.catalog.items[0].memAddress);
    }
  }

  getHardwareIcon(cat) {
    switch(cat) {
      case 'CPU': return 'memory';
      case 'GPU': return 'view_in_ar';
      case 'Motherboard': return 'developer_board';
      case 'RAM': return 'storage';
      case 'Storage': return 'hard_drive';
      case 'PSU': return 'power';
      case 'Cooling': return 'mode_fan';
      case 'PC Case': return 'desktop_windows';
      default: return 'devices';
    }
  }

  getSKU(item) {
  const prefixes = {
    'CPU': 'PRO',
    'GPU': 'VGA',
    'Motherboard': 'MOT',
    'RAM': 'RAM',
    'Storage': 'SSD',
    'PSU': 'PSU',
    'Cooling': 'COL',
    'PC Case': 'CAS'
  };
  const prefix = prefixes[item.category] || 'SKU';
  return `${prefix}-${item.id}`;
  }

  // Simpan & muat katalog dari localStorage
loadCatalog() {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem('gamerig_catalog'));
  } catch (e) {}

  if (Array.isArray(saved)) {
    this.catalog.clear();
    saved.forEach(hw => this.catalog.insert(hw));
  } else {
    this.loadPresets(); // pertama kali: pakai 8 produk bawaan
  }
}

saveCatalog() {
  try {
    localStorage.setItem('gamerig_catalog', JSON.stringify(this.catalog.items));
  } catch (e) {
    this.showToast('Penyimpanan penuh, hapus beberapa produk atau pakai gambar lebih kecil');
  }
}

// Baca file gambar, perkecil, ubah jadi teks (data URL)
readImageFile(file, callback) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const maxSize = 600;
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      callback(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => this.showToast('File gambar tidak bisa dibaca');
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

updateStock(productId) {
  if (!this.requireRole(['admin'], 'Hanya admin yang bisa mengubah stok')) return;

  const id = Number(productId);
  const product = this.catalog.items.find(i => i.id === id);
  if (!product) return;

  const input = prompt(
    `Update stok "${product.name}"\nStok saat ini: ${product.stock} unit\n\nMasukkan jumlah stok baru:`,
    String(product.stock)
  );
  if (input === null) return; // admin menekan Cancel

  const newStock = Number(input);
  if (input.trim() === '' || !Number.isInteger(newStock) || newStock < 0) {
    this.showToast('Stok harus berupa angka bulat 0 atau lebih');
    return;
  }

  product.stock = newStock;

  // sesuaikan keranjang dengan stok baru
  this.cart.forEach(entry => {
    if (entry.item.id === id && entry.qty > newStock) entry.qty = newStock;
  });
  this.cart = this.cart.filter(entry => entry.qty > 0);

  this.saveCatalog();
  this.renderStore();
  this.renderCart();
  this.showToast(newStock === 0 ? 'Stok diset ke 0 (Stok Habis)' : `Stok diperbarui menjadi ${newStock} unit`);
}

deleteProduct(productId) {
  if (!this.requireRole(['admin'], 'Hanya admin yang bisa menghapus produk')) return;

  const id = Number(productId);
  const product = this.catalog.items.find(i => i.id === id);
  if (!product) return;
  if (!confirm(`Hapus "${product.name}" dari katalog?`)) return;

  this.catalog.delete(id);
  this.cart = this.cart.filter(c => c.item.id !== id);
  this.wishlist.delete(id);

  const badge = document.getElementById('wishlist-badge-count');
  if (this.wishlist.size > 0) {
    badge.textContent = this.wishlist.size;
  } else {
    badge.classList.add('hidden');
  }

  this.saveCatalog();
  this.renderStore();
  this.renderCart();
  this.showToast('Produk berhasil dihapus dari katalog');
}

  openAlgoLog() {
  document.getElementById('algo-log-modal').classList.remove('hidden');
  this.showAlgoLog(this.algoLogTab || 'sorting');
}

showAlgoLog(type) {
  this.algoLogTab = type;
  const active = "flex-1 py-3 text-center border-b-2 border-rose-600 text-rose-600 font-semibold";
  const idle = "flex-1 py-3 text-center border-b-2 border-transparent text-zinc-500 hover:text-zinc-800 font-semibold";
  document.getElementById('tab-log-sorting').className = type === 'sorting' ? active : idle;
  document.getElementById('tab-log-searching').className = type === 'searching' ? active : idle;

  const out = document.getElementById('algo-log-output');
  const lines = AlgoLog[type];
  out.textContent = lines.length
    ? lines.join('\n')
    : (type === 'sorting' ? 'Belum ada log. Pilih opsi "Urutkan" di katalog.' : 'Belum ada log. Ketik sesuatu di kolom pencarian.');
  out.scrollTop = out.scrollHeight;
}

  // Render Store Products with Clean, Authentic E-Commerce Cards
  renderStore() {
    const grid = document.getElementById('store-products-grid');
    grid.innerHTML = '';

    let displayed = [...this.catalog.items];

    // Apply Category Tab Filter
    if (this.currentFilterCategory !== 'ALL') {
      displayed = displayed.filter(item => item.category === this.currentFilterCategory);
    }

    // Apply Search Filter
    if (this.currentSearchFilter) {
      const q = this.currentSearchFilter.toLowerCase();
      displayed = displayed.filter(item => 
        item.name.toLowerCase().includes(q) || 
        item.category.toLowerCase().includes(q) ||
        String(item.id).includes(q)
      );
    }

    displayed.forEach((item) => {
      const isWishlisted = this.wishlist.has(item.id);
      const soldOut = item.stock <= 0;
      const card = document.createElement('div');
      card.className = "bg-white rounded-2xl border border-zinc-200 hover:border-zinc-400 p-4 flex flex-col justify-between transition-all duration-200 shadow-xs hover:shadow-lg group relative";

      card.innerHTML = `
        <div>
          <!-- Top Badges & Wishlist -->
          <div class="flex items-center justify-between pb-2 mb-2 border-b border-zinc-100">
            <div class="flex items-center gap-1.5">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${soldOut ? 'bg-zinc-200 text-zinc-600 border border-zinc-300' : item.stock > 10 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
              ${soldOut ? 'Stok Habis' : item.stock > 10 ? 'Stok Ready' : 'Sisa Terbatas'}
              </span>
              <span class="text-[10px] text-zinc-400 font-mono">${this.getSKU(item)}</span>
            </div>
            
            <button data-action="toggle-wishlist" data-id="${item.id}" class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isWishlisted ? 'text-rose-600 bg-rose-50' : 'text-zinc-400 hover:text-rose-600 hover:bg-zinc-100'}" title="Tambah ke Wishlist">
              <span class="material-symbols-outlined text-[18px] ${isWishlisted ? 'fill-1' : ''}">favorite</span>
            </button>
          </div>

          <!-- Product Visual Placeholder Banner -->
          <div class="w-full h-44 rounded-xl bg-white border border-zinc-200/80 flex items-center justify-center p-2 mb-3 overflow-hidden relative">
          <div class="w-full h-full flex items-center justify-center ${soldOut ? 'grayscale opacity-50' : ''}">
            ${item.image
            ? `<img src="${item.image}" alt="${item.name}" class="w-full h-full object-contain">`
            : `<span class="material-symbols-outlined text-[48px] text-zinc-700">${this.getHardwareIcon(item.category)}</span>`}
          </div>
          ${soldOut ? `<span class="absolute px-3 py-1 rounded-md bg-zinc-900 text-white text-xs font-extrabold tracking-widest -rotate-6 shadow-lg">STOK HABIS</span>` : ''}
          </div>

          <!-- Product Category & Title -->
          <div>
            <span class="text-[11px] font-bold text-rose-600 uppercase tracking-wider">${item.category}</span>
            <h3 class="text-sm font-bold text-zinc-900 line-clamp-2 leading-snug transition-colors mt-0.5" title="${item.name}">
              ${item.name}
            </h3>
          </div>

          <!-- Price & Rating -->
          <div class="mt-3 flex items-baseline justify-between">
            <div>
              <div class="text-[10px] uppercase font-mono font-bold text-zinc-400">HARGA RESMI</div>
              <div class="text-base font-extrabold text-zinc-900 font-sans tracking-tight">
                Rp ${item.price.toLocaleString('id-ID')}
              </div>
            </div>
            <div class="text-right">
              <div class="flex items-center gap-0.5 text-amber-500 text-xs font-bold justify-end">
                <span class="material-symbols-outlined text-[15px] fill-1">star</span>
                <span>${item.rating}</span>
              </div>
              <div class="text-[10px] text-zinc-500">Stok: ${item.stock} Unit</div>
            </div>
          </div>
        </div>

        <!-- E-Commerce Buttons -->
        <div class="flex items-center gap-2 mt-4 pt-2 border-t border-zinc-100">
<button data-action="add-cart" data-id="${item.id}" ${soldOut ? 'disabled' : ''} class="flex-1 py-2 px-3 rounded-xl ${soldOut ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed' : 'bg-zinc-900 hover:bg-rose-600 text-white'} font-sans text-xs font-semibold transition-colors duration-200 text-center flex items-center justify-center gap-1.5">
  <span class="material-symbols-outlined text-[16px]">${soldOut ? 'block' : 'add_shopping_cart'}</span>
  <span>${soldOut ? 'Stok Habis' : '+ Keranjang'}</span>
</button>

<button data-action="detail" data-id="${item.id}" class="p-2 rounded-xl border border-zinc-200 bg-white text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors" title="Lihat Spesifikasi">
  <span class="material-symbols-outlined text-[18px]">visibility</span>
</button>

${this.getRole() === 'admin' ? `
  <button data-action="restock" data-id="${item.id}" class="p-2 rounded-xl border border-zinc-200 bg-white text-zinc-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors" title="Update Stok">
    <span class="material-symbols-outlined text-[18px]">inventory_2</span>
  </button>
  <button data-action="delete" data-id="${item.id}" class="p-2 rounded-xl border border-zinc-200 bg-white text-zinc-600 hover:text-rose-600 hover:bg-rose-50 transition-colors" title="Hapus Produk">
    <span class="material-symbols-outlined text-[18px]">delete</span>
  </button>` : ''}
        </div>
      `;

      grid.appendChild(card);
    });

    // Update product count
    const total = this.catalog.size();
    document.getElementById('product-count-badge').textContent = `${displayed.length} Produk`;
  }

  // Quick filter from hero cards
  quickFilterCategory(cat) {
    document.querySelectorAll('.cat-pill').forEach(b => {
      b.className = "cat-pill px-3 py-1.5 rounded-lg hover:bg-zinc-100 text-zinc-700 transition-colors";
      if (b.dataset.category === cat) {
        b.className = "cat-pill active px-3 py-1.5 rounded-lg bg-[#18181b] text-white font-semibold";
      }
    });
    this.currentFilterCategory = cat;
    this.renderStore();
    document.getElementById('katalog-produk').scrollIntoView({ behavior: 'smooth' });
  }

  // Shopping Cart Operations
  addToCart(productId) {
      if (!this.requireRole(['buyer'], 'Masuk sebagai pembeli untuk berbelanja')) return;
    const product = this.catalog.items.find(i => i.id === Number(productId));
    if (!product) return;

    if (product.stock <= 0) {
      this.showToast('Stok produk ini sudah habis');
      return;
    }

    const existing = this.cart.find(c => c.item.id === product.id);
    if (existing) {
      if (existing.qty < product.stock) {
        existing.qty += 1;
        this.showToast(`Jumlah ${product.name.slice(0, 20)}... ditambah (${existing.qty})`);
      } else {
        this.showToast(`Batas stok tercapai (${product.stock} unit)`);
      }
    } else {
      this.cart.push({ item: product, qty: 1 });
      this.showToast(`+1 ${product.name.slice(0, 24)}... masuk ke keranjang`);
    }

    this.renderCart();
  }

  updateCartQty(productId, delta) {
    const entry = this.cart.find(c => c.item.id === Number(productId));
    if (!entry) return;

    entry.qty += delta;
    if (entry.qty <= 0) {
      this.removeFromCart(productId);
      return;
    }

    if (entry.qty > entry.item.stock) {
      entry.qty = entry.item.stock;
      this.showToast(`Maksimum pesanan sesuai stok tersedia (${entry.item.stock})`);
    }

    this.renderCart();
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter(c => c.item.id !== Number(productId));
    this.renderCart();
    this.showToast("Item dihapus dari keranjang");
  }

  renderCart() {
    const container = document.getElementById('cart-items-container');
    const badgeCount = document.getElementById('cart-badge-count');
    const itemsCountText = document.getElementById('cart-items-count-text');
    const subtotalText = document.getElementById('cart-subtotal-text');
    const totalText = document.getElementById('cart-total-text');
    const checkoutBtn = document.getElementById('btn-checkout');

    const totalItems = this.cart.reduce((sum, entry) => sum + entry.qty, 0);
    badgeCount.textContent = totalItems;
    itemsCountText.textContent = `${totalItems} produk di keranjang`;

    if (this.cart.length === 0) {
      container.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center text-center p-8 text-zinc-400">
          <span class="material-symbols-outlined text-[64px] text-zinc-300 mb-2">remove_shopping_cart</span>
          <p class="font-bold text-zinc-700 text-sm">Keranjang belanja Anda masih kosong</p>
          <p class="text-xs text-zinc-500 mt-1 max-w-xs">Jelajahi pilihan processor, kartu grafis, dan komponen PC berkualitas di katalog GAMERIG.</p>
        </div>
      `;
      subtotalText.textContent = "Rp 0";
      totalText.textContent = "Rp 0";
      checkoutBtn.disabled = true;
      return;
    }

    checkoutBtn.disabled = false;
    container.innerHTML = '';
    let totalVal = 0;

    this.cart.forEach(entry => {
      const itemSubtotal = entry.item.price * entry.qty;
      totalVal += itemSubtotal;

      const row = document.createElement('div');
      row.className = "py-4 flex items-center justify-between gap-3";
      row.innerHTML = `
        <div class="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 shrink-0">
          <span class="material-symbols-outlined text-[24px]">${this.getHardwareIcon(entry.item.category)}</span>
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="text-xs font-bold text-zinc-900 truncate">${entry.item.name}</h4>
          <p class="text-[11px] font-mono text-zinc-500 mt-0.5">Rp ${entry.item.price.toLocaleString('id-ID')}</p>
          <div class="flex items-center gap-2 mt-2">
            <div class="flex items-center border border-zinc-200 rounded-lg overflow-hidden bg-white">
              <button class="px-2 py-0.5 hover:bg-zinc-100 text-zinc-600 font-bold" onclick="GAMERIG_APP.updateCartQty(${entry.item.id}, -1)">-</button>
              <span class="px-2.5 py-0.5 font-mono text-xs font-semibold text-zinc-800">${entry.qty}</span>
              <button class="px-2 py-0.5 hover:bg-zinc-100 text-zinc-600 font-bold" onclick="GAMERIG_APP.updateCartQty(${entry.item.id}, 1)">+</button>
            </div>
            <span class="text-[10px] text-zinc-400 font-mono">Sub: Rp ${itemSubtotal.toLocaleString('id-ID')}</span>
          </div>
        </div>
        <button class="text-zinc-400 hover:text-rose-600 p-1 transition-colors" onclick="GAMERIG_APP.removeFromCart(${entry.item.id})" title="Hapus">
          <span class="material-symbols-outlined text-[18px]">delete</span>
        </button>
      `;
      container.appendChild(row);
    });

    subtotalText.textContent = `Rp ${totalVal.toLocaleString('id-ID')}`;
    totalText.textContent = `Rp ${totalVal.toLocaleString('id-ID')}`;
  }

  openCartDrawer() {
    document.getElementById('cart-drawer-modal').classList.remove('hidden');
  }

  closeCartDrawer() {
    document.getElementById('cart-drawer-modal').classList.add('hidden');
  }

  loadBuyers() {
  try {
    const saved = JSON.parse(localStorage.getItem('gamerig_buyers')) || [];
    // paksa role 'buyer' agar tidak bisa dipalsukan lewat DevTools
    return saved.map(u => ({ ...u, role: 'buyer' }));
  } catch (e) {
    return [];
  }
}

saveBuyers() {
  const buyers = this.users.filter(u => u.role === 'buyer');
  localStorage.setItem('gamerig_buyers', JSON.stringify(buyers));
}

getRole() {
  return this.currentUser ? this.currentUser.role : 'guest';
}

applyRoleUI() {
  // tombol Tambah Hardware hanya tampil untuk admin
  document.getElementById('btn-open-add-dialog')
    .classList.toggle('hidden', this.getRole() !== 'admin');

    this.renderStore();
}

requireRole(allowedRoles, message) {
  if (allowedRoles.includes(this.getRole())) return true;
  this.showToast(message);
  if (this.getRole() === 'guest') this.openAuthModal();
  return false;
}

  // Authentication modal handlers
  openAuthModal() {
    if (this.currentUser) {
      if (confirm(`Anda saat ini masuk sebagai ${this.currentUser.name}. Apakah Anda ingin keluar (Logout)?`)) {
        this.currentUser = null;
        this.applyRoleUI();
        document.getElementById('user-display-name').textContent = "Masuk";
        this.showToast("Anda telah keluar dari akun.");
      }
      return;
    }
    document.getElementById('auth-modal').classList.remove('hidden');
  }

  closeAuthModal() {
    document.getElementById('auth-modal').classList.add('hidden');
  }

simulateLogin(name = "Alexander", role = 'buyer') {
  this.currentUser = { name: name, email: "alexander@gamerig.id", role: role };
  document.getElementById('user-display-name').textContent = `Halo, ${name.split(' ')[0]}`;
  this.closeAuthModal();
  this.applyRoleUI();
  this.showToast(`Selamat datang, ${name}! (${role})`);
}

  openInfoModal(title, message) {
    document.getElementById('info-modal-title').textContent = title;
    document.getElementById('info-modal-body').textContent = message;
    document.getElementById('info-modal').classList.remove('hidden');
  }

  showToast(msg) {
    const toast = document.getElementById('cart-toast');
    const toastMsg = document.getElementById('cart-toast-msg');
    toastMsg.textContent = msg;
    toast.classList.remove('hidden');
    toast.classList.add('flex');
    setTimeout(() => {
      toast.classList.add('hidden');
      toast.classList.remove('flex');
    }, 3200);
  }

  // Wishlist toggle
  toggleWishlist(productId) {
      if (!this.requireRole(['buyer'], 'Masuk sebagai pembeli untuk berbelanja')) return;
    const id = Number(productId);
    if (this.wishlist.has(id)) {
      this.wishlist.delete(id);
      this.showToast("Dihapus dari wishlist");
    } else {
      this.wishlist.add(id);
      this.showToast("Disimpan ke wishlist ❤️");
    }
    
    const count = this.wishlist.size;
    const badge = document.getElementById('wishlist-badge-count');
    if (count > 0) {
      badge.textContent = count;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }

    this.renderStore();
  }

  // Show Product Specs Modal
  showProductDetail(productId) {
    const product = this.catalog.items.find(i => i.id === Number(productId));
    if (!product) return;

    this.openInfoModal(
      `Spesifikasi Hardware: ${product.name}`,
      `Kategori: ${product.category}\n` +
      `Harga Resmi: Rp ${product.price.toLocaleString('id-ID')}\n` +
      `Status Stok: ${product.stock} Unit tersedia\n` +
      `Customer Rating: ★ ${product.rating} / 5.0\n` +
      `Jaminan: Garansi 3 Tahun Distributor Resmi Indonesia & Free Technical Support.`
    );
  }

  // Event Listeners Binding
  bindEvents() {
    // Cart drawer triggers
    document.getElementById('btn-cart-view').addEventListener('click', () => this.openCartDrawer());
    document.getElementById('btn-close-cart').addEventListener('click', () => this.closeCartDrawer());
    document.getElementById('cart-drawer-backdrop').addEventListener('click', () => this.closeCartDrawer());
    document.getElementById('btn-continue-shopping').addEventListener('click', () => this.closeCartDrawer());

    // Checkout Button
document.getElementById('btn-checkout').addEventListener('click', () => {
  if (this.cart.length === 0) return;
  // (kalau ada baris requireRole untuk pembeli, biarkan di sini)

  this.cart.forEach(entry => {
    entry.item.stock = Math.max(0, entry.item.stock - entry.qty);
  });
  this.saveCatalog();

  this.closeCartDrawer();
  this.openInfoModal('Checkout Pesanan Berhasil', 'Terima kasih telah berbelanja di GAMERIG Store! Invoice resmi dan nomor resi pengiriman berasuransi telah dikirimkan ke email Anda.');
  this.cart = [];
  this.renderCart();
  this.renderStore();
});

    // Wishlist view trigger
    document.getElementById('btn-wishlist-view').addEventListener('click', () => {
      if (this.wishlist.size === 0) {
        this.showToast("Daftar keinginan masih kosong. Klik ikon hati pada produk!");
      } else {
        this.showToast(`${this.wishlist.size} hardware tersimpan di wishlist Anda.`);
      }
    });

    // User profile / Auth Modal triggers
    document.getElementById('btn-auth-user').addEventListener('click', () => this.openAuthModal());
    document.getElementById('btn-close-auth-modal').addEventListener('click', () => this.closeAuthModal());
    
    // Auth Tab switch
    document.getElementById('tab-auth-login').addEventListener('click', (e) => {
      e.target.className = "flex-1 py-3 text-center border-b-2 border-rose-600 text-rose-600 font-semibold";
      document.getElementById('tab-auth-register').className = "flex-1 py-3 text-center border-b-2 border-transparent text-zinc-500 hover:text-zinc-800 font-semibold";
      document.getElementById('btn-submit-auth').textContent = "Masuk Sekarang";
      document.getElementById('auth-modal-title').textContent = "Masuk ke GAMERIG Store";
        this.authMode = 'login';
    });
    document.getElementById('tab-auth-register').addEventListener('click', (e) => {
      e.target.className = "flex-1 py-3 text-center border-b-2 border-rose-600 text-rose-600 font-semibold";
      document.getElementById('tab-auth-login').className = "flex-1 py-3 text-center border-b-2 border-transparent text-zinc-500 hover:text-zinc-800 font-semibold";
      document.getElementById('btn-submit-auth').textContent = "Daftar Akun Baru";
      document.getElementById('auth-modal-title').textContent = "Buat Akun GAMERIG";
        this.authMode = 'register';
    });

document.getElementById('auth-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('auth-email').value.trim().toLowerCase();
  const password = document.getElementById('auth-password').value;

  if (this.authMode === 'register') {
    if (this.users.some(u => u.email === email)) {
      this.showToast('Email sudah terdaftar');
      return;
    }
    const newUser = { name: email.split('@')[0], email, password, role: 'buyer' };
    this.users.push(newUser);
    this.saveBuyers();
    this.simulateLogin(newUser.name, newUser.role);
    return;
  }

  const found = this.users.find(u => u.email === email && u.password === password);
  if (!found) {
    this.showToast('Email atau password salah');
    return;
  }
  this.simulateLogin(found.name, found.role);
});

    // Store Sorting Select Event (Clean behind-the-scenes algorithm execution)
    document.getElementById('store-sort-select').addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'default') {
        this.catalog.realignMemoryAddresses();
        this.renderStore();
        console.log("%c[STORE] Mengembalikan ke urutan alokasi default katalog.", "color: #71717a");
        return;
      }

      let field = 'price';
      let order = 'asc';

      if (val === 'price-asc') { field = 'price'; order = 'asc'; }
      else if (val === 'price-desc') { field = 'price'; order = 'desc'; }
      else if (val === 'rating-desc') { field = 'rating'; order = 'desc'; }
      else if (val === 'stock-desc') { field = 'stock'; order = 'desc'; }
      else if (val === 'name-asc') { field = 'name'; order = 'asc'; }

      // Runs QuickSort engine with detailed console tracing
      const result = AlgoLog.capture('sorting', () => SortingEngine.quickSort(this.catalog.items, field, order));
      this.catalog.setItems(result.sortedArray);
      this.renderStore();
    });

    // Category Pills Filtering
    document.querySelectorAll('.cat-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cat-pill').forEach(b => {
          b.className = "cat-pill px-3 py-1.5 rounded-lg hover:bg-zinc-100 text-zinc-700 transition-colors";
        });
        btn.className = "cat-pill active px-3 py-1.5 rounded-lg bg-[#18181b] text-white font-semibold";
        this.currentFilterCategory = btn.dataset.category;
        this.renderStore();
      });
    });

    // Search Input (Executes Searching Engine behind the scenes)
    const handleSearch = (query) => {
      this.currentSearchFilter = query;
      this.renderStore();

      if (query.trim()) {
        // Logs Linear Search trace to Console
        AlgoLog.capture('searching', () => SearchingEngine.linearSearch(this.catalog.items, 'name', query));
      }
    };

    const storeSearchInput = document.getElementById('store-search-input');
    storeSearchInput.addEventListener('input', (e) => handleSearch(e.target.value.trim()));
    document.getElementById('btn-quick-search-nav').addEventListener('click', () => handleSearch(storeSearchInput.value.trim()));
    document.getElementById('mobile-search-input').addEventListener('input', (e) => handleSearch(e.target.value.trim()));

    // Shuffle & Reset buttons
    document.getElementById('btn-shuffle-store').addEventListener('click', () => {
      this.catalog.shuffle();
      this.renderStore();
      this.showToast("Katalog produk diacak");
    });

    // Grid Button Delegations (Cart, Wishlist, Detail)
    document.getElementById('store-products-grid').addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;

      const action = btn.dataset.action;
      const id = Number(btn.dataset.id);

      if (action === 'add-cart') {
        this.addToCart(id);
      } else if (action === 'toggle-wishlist') {
        this.toggleWishlist(id);
      } else if (action === 'detail') {
        this.showProductDetail(id);
      } else if (action === 'delete') {
        this.deleteProduct(id);
      } else if (action === 'restock') {
        this.updateStock(id);
      }
    });

    // Log Algoritma (dibuka dari link di footer)
const algoModal = document.getElementById('algo-log-modal');
document.getElementById('btn-open-algo-log').addEventListener('click', (e) => {
  e.preventDefault();
  this.openAlgoLog();
});
document.getElementById('algo-log-close').addEventListener('click', () => algoModal.classList.add('hidden'));
algoModal.addEventListener('click', (e) => { if (e.target === algoModal) algoModal.classList.add('hidden'); });
document.getElementById('tab-log-sorting').addEventListener('click', () => this.showAlgoLog('sorting'));
document.getElementById('tab-log-searching').addEventListener('click', () => this.showAlgoLog('searching'));
document.getElementById('algo-log-clear').addEventListener('click', () => {
  AlgoLog[this.algoLogTab || 'sorting'] = [];
  this.showAlgoLog(this.algoLogTab || 'sorting');
});

    // Add Hardware Modal controls
    const addModal = document.getElementById('add-hardware-modal');
    const openAddModal = () => {
      if (!this.requireRole(['admin'], 'Hanya admin yang bisa menambah hardware')) return;
      addModal.classList.remove('hidden');
    };
    const closeAddModal = () => addModal.classList.add('hidden');

    document.getElementById('btn-open-add-dialog').addEventListener('click', openAddModal);
    document.getElementById('btn-close-add-modal').addEventListener('click', closeAddModal);
    document.getElementById('btn-cancel-add-modal').addEventListener('click', closeAddModal);

    document.getElementById('form-add-hardware').addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('hw-id').value;
      const cat = document.getElementById('hw-category').value;
      const name = document.getElementById('hw-name').value;
      const price = document.getElementById('hw-price').value;
      const stock = document.getElementById('hw-stock').value;
      const rating = document.getElementById('hw-rating').value;

      const file = document.getElementById('hw-image').files[0];
      if (!file) {
        this.showToast('Gambar produk wajib diunggah');
        return;
      }
      if (this.catalog.items.some(i => i.id === Number(id))) {
        this.showToast('Product ID sudah dipakai, gunakan ID lain');
        return;
      }

      this.readImageFile(file, (image) => {
        const inserted = this.catalog.insert({ id, name, price, stock, category: cat, rating, image });
          if (inserted) {
          this.saveCatalog();
          this.renderStore();
          closeAddModal();
          this.showToast(`Produk '${inserted.name.slice(0, 20)}...' berhasil ditambahkan!`);
          e.target.reset();
        }
      });
    });
  }
}

// Instantiate Store on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  window.GAMERIG_APP = new StoreAppController();
  console.log("%c[GAMERIG Official Store Engine Ready]", "color: #dc2626; font-size: 14px; font-weight: bold;");
  console.log("%cStruktur data C++ / OOP (ProductStruct, ProductCatalogArray, MemoryPointerManager, SortingEngine, SearchingEngine) aktif di latar belakang. Tekan F12 Console untuk melihat eksekusi algoritma saat melakukan sorting atau pencarian.", "color: #71717a; font-size: 11px;");
});
