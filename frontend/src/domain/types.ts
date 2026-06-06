export type OrderStatus = "new" | "paid" | "packing" | "shipped" | "delivered" | "cancelled";

export type QuestionStatus = "open" | "answered" | "resolved";

export type PriorityLevel = "low" | "medium" | "high" | "critical";

export interface Buyer {
  id: string;
  name: string;
  email: string;
}

export interface Seller {
  id: string;
  name: string;
  email: string;
  reputation: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  category: string;
  quantity: number;
  unitPrice: number;
}

export interface Reply {
  id: string;
  author: "seller";
  body: string;
  createdAt: string;
}

export interface Question {
  id: string;
  orderId: string;
  productId?: string;
  buyerId: string;
  body: string;
  status: QuestionStatus;
  createdAt: string;
  replies: Reply[];
}

export interface Priority {
  level: PriorityLevel;
  score: number;
  reasons: string[];
}

export interface Order {
  id: string;
  sellerId: string;
  buyer: Buyer;
  status: OrderStatus;
  date: string;
  items: OrderItem[];
  questions: Question[];
  total?: number;
}

export interface PriorityQuestion extends Question {
  priority: Priority;
  order: {
    id: string;
    status: OrderStatus;
    date: string;
    buyer: Buyer;
    total: number;
  };
  product?: OrderItem;
}

export interface OrderFilters {
  search: string;
  status: OrderStatus | "all";
  from?: string;
  to?: string;
}
