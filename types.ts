
export enum Role {
  HOST = 'HOST',
  PARTICIPANT = 'PARTICIPANT'
}

export interface DrinkItem {
  id: string;
  name: string;
  price: number;
  sugarIceConfig: string; // 團主自定義的甜度冰塊規則描述
}

export interface SnackItem {
  id: string;
  name: string;
  price: number;
}

export interface SessionConfig {
  drinkShopName: string;
  drinkItems: DrinkItem[];
  snackShopName: string;
  snackItems: SnackItem[];
  departmentMembers: string[];
  isActive: boolean;
}

export interface OrderDetail {
  userName: string;
  drinkId?: string;
  customNote?: string; // 統一儲存跟團者的客製化要求 (如：半糖去冰)
  snackId?: string;
  timestamp: number;
}

export interface AppState {
  role: Role;
  config: SessionConfig;
  orders: OrderDetail[];
}
