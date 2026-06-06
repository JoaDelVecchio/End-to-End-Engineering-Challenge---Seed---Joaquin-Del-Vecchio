export type OrderStatus = "new" | "paid" | "packing" | "shipped" | "delivered" | "cancelled";

export type QuestionStatus = "open" | "answered" | "resolved";

export type PriorityLevel = "low" | "medium" | "high" | "critical";

export type ReplyAuthor = "seller";

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

export interface Product {
  id: string;
  sellerId: string;
  title: string;
  category: string;
  price: number;
  stock: number;
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
  author: ReplyAuthor;
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

export interface Order {
  id: string;
  sellerId: string;
  buyer: Buyer;
  status: OrderStatus;
  date: string;
  items: OrderItem[];
  questions: Question[];
}

export interface StoreData {
  sellers: Seller[];
  products: Product[];
  orders: Order[];
}

export interface PriorityResult {
  level: PriorityLevel;
  score: number;
  reasons: string[];
}

export interface PrioritizedQuestion {
  question: Question;
  order: Order;
  priority: PriorityResult;
}
