import { Timestamp } from "firebase/firestore";

// ─────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────

export type ResourceStatus = "STABLE" | "WARNING" | "CRITICAL" | "OFFLINE";
export type DispatchStatus = "IN_TRANSIT" | "DELIVERED" | "PENDING" | "CANCELLED";
export type StationStatus = "SUFFICIENT" | "LOW_STOCK" | "CRITICAL" | "CLOSED";
export type UserRole = "ADMIN" | "OPERATOR" | "CITIZEN" | "RESPONDER";
export type ZoneStatus = "OPTIMAL" | "REPLENISH" | "CRITICAL";

// ─────────────────────────────────────────────
// User / Auth
// ─────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  idNumber: string;
  phone: string;
  displayName: string;
  role: UserRole;
  sectorId: string;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
}

// ─────────────────────────────────────────────
// Supply Items (物資品項)
// ─────────────────────────────────────────────

/** Firestore: /supplyItems/{itemId} */
export interface SupplyItem {
  id: string;
  name: string;
  nameEn: string;
  nameTw: string;
  icon: string;
  skuCode: string;
  unit: string;
  category: "WATER" | "FOOD" | "SHELTER" | "MEDICAL" | "TOOLS";
}

// ─────────────────────────────────────────────
// Distribution Stations (資源站)
// ─────────────────────────────────────────────

/** Firestore: /stations/{stationId} */
export interface Station {
  id: string;
  name: string;
  nameTw: string;
  sectorId: string;
  region: string;
  status: StationStatus;
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
  contactPhone?: string;
  isActive: boolean;
  lastUpdatedAt: Timestamp;
  updatedAgo?: string;
}

// ─────────────────────────────────────────────
// Inventory Records (庫存)
// ─────────────────────────────────────────────

/** Firestore: /inventory/{inventoryId} */
export interface InventoryRecord {
  id: string;
  stationId: string;
  itemId: string;
  item?: SupplyItem;
  quantity: number;
  maxCapacity: number;
  status: ResourceStatus;
  skuCode: string;
  lastSyncAt: Timestamp;
  percentFull?: number;
}

// ─────────────────────────────────────────────
// Dispatch Log (調度記錄)
// ─────────────────────────────────────────────

/** Firestore: /dispatches/{dispatchId} */
export interface DispatchLog {
  id: string;
  transactionId: string;
  fromStationId: string;
  toStationId?: string;
  toUserId?: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  status: DispatchStatus;
  dispatchedAt: Timestamp;
  deliveredAt?: Timestamp;
  operatorId?: string;
  notes?: string;
}

// ─────────────────────────────────────────────
// QR Code Vouchers (物資申請 QR)
// ─────────────────────────────────────────────

/** Firestore: /qrVouchers/{voucherId} */
export interface QRVoucher {
  id: string;
  transactionId: string;
  userId: string;
  stationId: string;
  items: VoucherLineItem[];
  qrCodeData: string;
  isValid: boolean;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  redeemedAt?: Timestamp;
}

export interface VoucherLineItem {
  itemId: string;
  itemName: string;
  quantity: number;
  availableAtStation: number;
}

// ─────────────────────────────────────────────
// Warehouse Zones (3D View)
// ─────────────────────────────────────────────

/** Firestore: /warehouseZones/{zoneId} */
export interface WarehouseZone {
  id: string;
  stationId: string;
  zoneName: string;
  zoneCode: string;
  status: ZoneStatus;
  percentFull: number;
  capacity: number;
  currentStock: number;
  lastCountAt: Timestamp;
  operatorId?: string;
}

// ─────────────────────────────────────────────
// Activity Stream Events
// ─────────────────────────────────────────────

/** Firestore: /activityEvents/{eventId} */
export interface ActivityEvent {
  id: string;
  stationId: string;
  type: "DISPATCH" | "ALERT" | "INVENTORY_COUNT" | "RESTOCK" | "SYSTEM";
  title: string;
  description: string;
  location?: string;
  operatorId?: string;
  operatorName?: string;
  occurredAt: Timestamp;
  icon?: string;
}

// ─────────────────────────────────────────────
// UI-Only helper types
// ─────────────────────────────────────────────

export interface InventoryCardData {
  skuCode: string;
  label: string;
  sublabel: string;
  quantity: number;
  unit: string;
  status: ResourceStatus;
  sparkData?: number[];
}

export interface StatPanelData {
  title: string;
  value: number | string;
  unit?: string;
  trend?: "UP" | "DOWN" | "STABLE";
  trendPercent?: number;
}

