/// <reference types="jest" />

import { renderToStaticMarkup } from "react-dom/server";
import type { Order } from "../../domain/types";
import { QuestionThread } from "./QuestionThread";

const baseOrder: Order = {
  id: "ord-1",
  sellerId: "seller-1",
  buyer: { id: "buyer-1", name: "Ana Perez", email: "ana@example.com" },
  status: "shipped",
  date: "2026-06-04T10:00:00.000Z",
  items: [
    { productId: "prod-1", title: "Laptop Ultra 14", category: "electronics", quantity: 1, unitPrice: 1200 }
  ],
  questions: []
};

function renderQuestionThread(
  order: Order,
  replyDrafts: Record<string, string> = {},
  pendingAction?: string
) {
  return renderToStaticMarkup(
    <QuestionThread
      order={order}
      pendingAction={pendingAction}
      replyDrafts={replyDrafts}
      onReplyDraftChange={jest.fn()}
      onReply={jest.fn()}
      onResolve={jest.fn()}
      onReopen={jest.fn()}
    />
  );
}

describe("QuestionThread", () => {
  it("renders product-scoped open questions with the seller reply form", () => {
    const html = renderQuestionThread(
      {
        ...baseOrder,
        questions: [
          {
            id: "q-1",
            orderId: baseOrder.id,
            buyerId: baseOrder.buyer.id,
            productId: "prod-1",
            body: "La laptop llegó rota",
            status: "open",
            createdAt: "2026-06-04T12:00:00.000Z",
            replies: []
          }
        ]
      },
      { "q-1": "Estamos revisando esto ahora" }
    );

    expect(html).toContain("La laptop llegó rota");
    expect(html).toContain("Producto: Laptop Ultra 14");
    expect(html).toContain("Escribe una respuesta al comprador");
    expect(html).toContain("Estamos revisando esto ahora");
    expect(html).toContain("Responder");
    expect(html).toContain("Resolver");
  });

  it("shows a reopen action for resolved questions without the reply form", () => {
    const html = renderQuestionThread({
      ...baseOrder,
      questions: [
        {
          id: "q-2",
          orderId: baseOrder.id,
          buyerId: baseOrder.buyer.id,
          body: "Gracias, funciona bien.",
          status: "resolved",
          createdAt: "2026-06-04T12:00:00.000Z",
          replies: [
            {
              id: "reply-1",
              author: "seller",
              body: "Perfecto, gracias por confirmar.",
              createdAt: "2026-06-04T13:00:00.000Z"
            }
          ]
        }
      ]
    });

    expect(html).toContain("Resuelta");
    expect(html).toContain("Perfecto, gracias por confirmar.");
    expect(html).toContain("Reabrir");
    expect(html).not.toContain("Escribe una respuesta al comprador");
    expect(html).not.toContain("Responder");
    expect(html).not.toContain("Resolver");
  });

  it("disables reply controls while the question reply is being submitted", () => {
    const html = renderQuestionThread(
      {
        ...baseOrder,
        questions: [
          {
            id: "q-1",
            orderId: baseOrder.id,
            buyerId: baseOrder.buyer.id,
            body: "¿Puedes confirmar el envío?",
            status: "open",
            createdAt: "2026-06-04T12:00:00.000Z",
            replies: []
          }
        ]
      },
      { "q-1": "Revisando ahora" },
      "reply:q-1"
    );

    expect(html).toContain("disabled");
    expect(html).toContain("Enviando");
    expect(html).toContain("aria-busy=\"true\"");
  });
});
