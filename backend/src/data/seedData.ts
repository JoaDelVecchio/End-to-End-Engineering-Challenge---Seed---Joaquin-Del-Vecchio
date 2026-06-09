import { StoreData } from "../domain/types";

export function createSeedData(): StoreData {
  return {
    sellers: [
      {
        id: "seller-1",
        name: "Tecno Sur",
        email: "seller1@example.com",
        reputation: "MercadoLíder"
      },
      {
        id: "seller-2",
        name: "Casa Norte",
        email: "seller2@example.com",
        reputation: "MercadoLíder"
      }
    ],
    orders: [
      {
        id: "ord-1001",
        sellerId: "seller-1",
        buyer: {
          id: "buyer-1",
          name: "Lucas Gomez",
          email: "lucas@example.com"
        },
        status: "paid",
        date: "2026-06-06T09:30:00.000Z",
        items: [
          {
            productId: "prod-2",
            title: "Impresora térmica de etiquetas",
            category: "office",
            quantity: 1,
            unitPrice: 180000
          },
          {
            productId: "prod-4",
            title: "Set de cintas de embalaje",
            category: "supplies",
            quantity: 3,
            unitPrice: 12000
          }
        ],
        questions: [
          {
            id: "q-9001",
            orderId: "ord-1001",
            buyerId: "buyer-1",
            body: "¿Puedes confirmar si se despacha hoy?",
            status: "open",
            createdAt: "2026-06-06T10:15:00.000Z",
            replies: []
          }
        ]
      },
      {
        id: "ord-1002",
        sellerId: "seller-1",
        buyer: {
          id: "buyer-2",
          name: "Ana Perez",
          email: "ana@example.com"
        },
        status: "shipped",
        date: "2026-06-04T10:00:00.000Z",
        items: [
          {
            productId: "prod-1",
            title: "Laptop Ultra 14",
            category: "electronics",
            quantity: 1,
            unitPrice: 1200000
          },
          {
            productId: "prod-3",
            title: "Mouse inalámbrico",
            category: "electronics",
            quantity: 2,
            unitPrice: 39000
          }
        ],
        questions: [
          {
            id: "q-9002",
            orderId: "ord-1002",
            productId: "prod-1",
            buyerId: "buyer-2",
            body: "La laptop llegó rota, es urgente y necesito una devolución.",
            status: "open",
            createdAt: "2026-06-04T12:00:00.000Z",
            replies: []
          }
        ]
      },
      {
        id: "ord-1003",
        sellerId: "seller-1",
        buyer: {
          id: "buyer-3",
          name: "Maria Silva",
          email: "maria@example.com"
        },
        status: "delivered",
        date: "2026-06-01T16:25:00.000Z",
        items: [
          {
            productId: "prod-3",
            title: "Mouse inalámbrico",
            category: "electronics",
            quantity: 1,
            unitPrice: 45000
          }
        ],
        questions: [
          {
            id: "q-9003",
            orderId: "ord-1003",
            productId: "prod-3",
            buyerId: "buyer-3",
            body: "Gracias, funciona bien.",
            status: "resolved",
            createdAt: "2026-06-02T11:00:00.000Z",
            replies: [
              {
                id: "reply-1",
                author: "seller",
                body: "Perfecto, gracias por confirmar.",
                createdAt: "2026-06-02T12:00:00.000Z"
              }
            ]
          }
        ]
      },
      {
        id: "ord-1004",
        sellerId: "seller-1",
        buyer: {
          id: "buyer-4",
          name: "Bruno Costa",
          email: "bruno@example.com"
        },
        status: "packing",
        date: "2026-06-05T18:10:00.000Z",
        items: [
          {
            productId: "prod-2",
            title: "Impresora térmica de etiquetas",
            category: "office",
            quantity: 2,
            unitPrice: 175000
          }
        ],
        questions: []
      },
      {
        id: "ord-2001",
        sellerId: "seller-2",
        buyer: {
          id: "buyer-5",
          name: "Julieta Rios",
          email: "julieta@example.com"
        },
        status: "paid",
        date: "2026-06-06T08:00:00.000Z",
        items: [
          {
            productId: "prod-5",
            title: "Juego de vajilla de cerámica",
            category: "home",
            quantity: 1,
            unitPrice: 90000
          }
        ],
        questions: []
      }
    ]
  };
}
