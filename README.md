# ResilienceOps — 智慧災難物資管理系統

Next.js 14 + TypeScript + Tailwind CSS + Firebase (Firestore)

---

## 專案結構 (Project Structure)

```
src/
├── app/
│   ├── layout.tsx                  # Root layout (fonts, metadata)
│   ├── page.tsx                    # Login page (Image 1)
│   ├── globals.css
│   └── dashboard/
│       ├── layout.tsx              # Authenticated shell: TopBar + Sidebar
│       ├── inventory/
│       │   └── page.tsx            # Real-time Inventory Panel (Image 4)
│       ├── resource-map/
│       │   └── page.tsx            # Resource Map (Image 3)
│       ├── qr-dispatch/
│       │   └── page.tsx            # QR Supply Request (Image 2)
│       └── 3d-view/
│           └── page.tsx            # Digital Twin (Image 5)
│
├── components/
│   ├── ui/
│   │   └── StatusBadge.tsx         # Status chip (STABLE / WARNING / CRITICAL …)
│   ├── layout/
│   │   ├── TopBar.tsx              # Top app bar
│   │   └── AppSidebar.tsx          # Left navigation sidebar
│   └── inventory/
│       ├── InventoryCard.tsx       # Resource stat card with spark bars
│       └── DispatchLogItem.tsx     # Dispatch log row
│
├── hooks/
│   └── useFirestore.ts             # All real-time Firebase hooks
│
├── lib/
│   ├── firebase.ts                 # Firebase app initialisation
│   └── collections.ts             # Typed Firestore collection refs
│
└── types/
    └── index.ts                    # All TypeScript interfaces & enums
```

---

## 元件清單 (Component Inventory)

| 元件 | 路徑 | 用途 |
|------|------|------|
| `StatusBadge` | `components/ui/StatusBadge.tsx` | 通用狀態標籤 (STABLE/WARNING/CRITICAL…) |
| `InventoryCard` | `components/inventory/InventoryCard.tsx` | 物資統計卡片，含 sparkbar |
| `DispatchLogItem` | `components/inventory/DispatchLogItem.tsx` | 調度記錄列表項目 |
| `AppSidebar` | `components/layout/AppSidebar.tsx` | 左側導覽列 |
| `TopBar` | `components/layout/TopBar.tsx` | 頂端應用程式列 |

---

## Firebase Hooks

| Hook | 對應 Firestore 路徑 | 說明 |
|------|---------------------|------|
| `useInventory(stationId?)` | `/inventory` | 即時物資庫存 |
| `useStations()` | `/stations` | 所有資源站 |
| `useDispatchLog(limit)` | `/dispatches` | 調度記錄 |
| `useActivityEvents(stationId)` | `/activityEvents` | 即時活動串流 |
| `useWarehouseZones(stationId)` | `/warehouseZones` | 倉庫區域狀態 |
| `useQRVoucher(voucherId)` | `/qrVouchers/{id}` | 單筆 QR 憑證 |

---

## Firebase Data Schema

### Firestore Collections

| Collection | Document | 說明 |
|---|---|---|
| `/users` | `UserProfile` | 使用者帳號 (UID, 身分證, 角色) |
| `/supplyItems` | `SupplyItem` | 物資品項主資料 |
| `/stations` | `Station` | 資源站清單 + 座標 |
| `/inventory` | `InventoryRecord` | 各站即時庫存 |
| `/dispatches` | `DispatchLog` | 調度/配送記錄 |
| `/qrVouchers` | `QRVoucher` | QR 申請憑證 (30分鐘效期) |
| `/warehouseZones` | `WarehouseZone` | 倉庫分區狀態 (Digital Twin) |
| `/activityEvents` | `ActivityEvent` | 即時活動事件串流 |

---

## 安裝與設定 (Setup)

### 1. 安裝依賴

```bash
npm install
```

### 2. 環境變數

複製並填入 Firebase 設定：

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### 3. 啟動開發伺服器

```bash
npm run dev
```

---

## 串接 Firebase 的步驟 (Wiring Guide)

每個頁面都有標註 `🔌` 的位置，指示需要替換模擬資料的地方：

1. **Inventory page** (`/dashboard/inventory`):
   - 將 `MOCK_CARDS` 替換為 `useInventory()` 的資料
   - 將 stub dispatch logs 替換為 `useDispatchLog(10)`

2. **QR Dispatch page** (`/dashboard/qr-dispatch`):
   - 用 `useStations()` 填入站點下拉選單
   - 用 `useInventory(stationId)` 動態載入可用數量
   - `handleConfirm` 中寫入 `addDoc(Collections.qrVouchers, ...)`

3. **Resource Map page** (`/dashboard/resource-map`):
   - 將 `STUB_STATIONS` 替換為 `useStations().data`
   - 加入地圖套件 (react-leaflet 或 react-map-gl)

4. **3D View page** (`/dashboard/3d-view`):
   - 將 `STUB_ZONES` 替換為 `useWarehouseZones(STATION_ID).data`
   - 將 `STUB_EVENTS` 替換為 `useActivityEvents(STATION_ID).data`
   - 考慮加入 `@react-three/fiber` 作真 3D 渲染

---

## 推薦套件 (Recommended Packages)

```bash
# 地圖
npm install react-leaflet leaflet @types/leaflet
# 或
npm install react-map-gl mapbox-gl

# QR Code 產生
npm install qrcode.react

# 3D 倉庫視覺化
npm install @react-three/fiber @react-three/drei three

# 圖表 (Analytics 頁)
npm install recharts

# Firebase Auth UI
npm install react-firebase-hooks
```
