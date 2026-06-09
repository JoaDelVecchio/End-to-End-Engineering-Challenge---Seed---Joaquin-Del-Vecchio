import { expect, test } from "@playwright/test";

const apiBaseUrl = process.env.E2E_API_URL ?? "http://127.0.0.1:8080/api";

test("seller can inspect priority questions and filter recent orders", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Panel de ventas" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Cola de prioridad" })).toBeVisible();
  await expect(page.locator(".priority-critical")).toContainText(/crítica/i);
  await expect(page.getByText("La laptop llegó rota")).toBeVisible();

  await page.getByRole("textbox", { name: "Buscar" }).fill("ana");

  const orderRows = page.locator(".order-row");
  await expect(orderRows).toHaveCount(1);
  await expect(orderRows).toContainText("ord-1002");
  await expect(orderRows).toContainText("Ana Perez");
  await expect(orderRows).toContainText("Enviada");
  await expect(orderRows.first()).toHaveAttribute("aria-current", "true");
});

test("seller can open a priority question even when date filters hide its order from the table", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("textbox", { name: "Fecha inicio" }).fill("2026-06-05");
  await expect(page.locator(".order-row")).toHaveCount(2);
  await expect(page.locator(".order-list")).not.toContainText("ord-1002");

  await page.getByRole("button", { name: "Abrir pregunta de Ana Perez en la orden ord-1002" }).click();

  const detailPanel = page.getByRole("region", { name: "Detalle de la orden seleccionada" });
  await expect(detailPanel.getByRole("heading", { name: "ord-1002" })).toBeVisible();
  await expect(detailPanel).toContainText("Ana Perez");
  await expect(detailPanel).toContainText("La laptop llegó rota");
});

test("seller confirms order status changes inline before advancing the workflow", async ({ page }) => {
  await page.goto("/");

  const detailPanel = page.getByRole("region", { name: "Detalle de la orden seleccionada" });
  await expect(detailPanel.getByRole("heading", { name: "ord-1001" })).toBeVisible();

  await detailPanel.getByRole("button", { name: "Marcar como en preparación" }).click();
  await expect(detailPanel).toContainText("Confirmar cambio a En preparación");
  await expect(detailPanel).toContainText("Este cambio avanza la orden y no se puede deshacer desde el panel.");

  await page.getByRole("button", { name: "Seleccionar orden ord-1004 de Bruno Costa" }).click();
  await expect(detailPanel.getByRole("heading", { name: "ord-1004" })).toBeVisible();
  await expect(detailPanel.getByRole("button", { name: "Marcar como enviada" })).toBeVisible();
  await expect(detailPanel).not.toContainText("Confirmar cambio a Enviada");

  await page.getByRole("button", { name: "Seleccionar orden ord-1001 de Lucas Gomez" }).click();
  await expect(detailPanel.getByRole("heading", { name: "ord-1001" })).toBeVisible();
  await detailPanel.getByRole("button", { name: "Marcar como en preparación" }).click();

  await detailPanel.getByRole("button", { name: "Cancelar", exact: true }).click();
  await expect(detailPanel.getByRole("button", { name: "Marcar como en preparación" })).toBeVisible();

  await detailPanel.getByRole("button", { name: "Marcar como en preparación" }).click();
  await detailPanel.getByRole("button", { name: "Confirmar" }).click();

  await expect(detailPanel).toContainText("En preparación");
  await expect(detailPanel.getByRole("button", { name: "Marcar como enviada" })).toBeVisible();
});

test("seller can reply to and resolve a buyer question from the dashboard", async ({ page, request }) => {
  const questionBody = `Necesito ayuda con la entrega ${Date.now()}`;
  const replyBody = `Estamos revisando esto con operaciones ${Date.now()}`;
  let nativeDialogSeen = false;
  page.on("dialog", async (dialog) => {
    nativeDialogSeen = true;
    await dialog.dismiss();
  });

  const createQuestionResponse = await request.post(`${apiBaseUrl}/orders/ord-1001/questions`, {
    data: {
      body: questionBody,
      productId: "prod-2"
    }
  });
  expect(createQuestionResponse.status()).toBe(201);

  await page.goto("/");
  const orderRow = page.locator(".order-row").filter({ hasText: "ord-1001" });
  await orderRow.click();
  await expect(orderRow).toHaveAttribute("aria-current", "true");

  const questionThread = page.locator(".question-thread").filter({ hasText: questionBody });
  await expect(questionThread).toBeVisible();
  await expect(questionThread).toContainText("Producto: Impresora térmica de etiquetas");

  await questionThread.getByPlaceholder("Escribe una respuesta al comprador").fill(replyBody);
  await questionThread.getByRole("button", { name: "Responder" }).click();

  await expect(questionThread).toContainText(replyBody);
  await expect(questionThread).toContainText("Respondida");

  await questionThread.getByRole("button", { name: "Resolver" }).click();
  await expect(questionThread).toContainText("Confirmar resolución");
  await expect(questionThread).toContainText("La pregunta saldrá de la cola de prioridad.");

  await questionThread.getByRole("button", { name: "Cancelar" }).click();
  await expect(questionThread.getByRole("button", { name: "Resolver" })).toBeVisible();

  await questionThread.getByRole("button", { name: "Resolver" }).click();
  await questionThread.getByRole("button", { name: "Confirmar" }).click();

  await expect(questionThread).toContainText("Resuelta");
  await expect(questionThread.getByPlaceholder("Escribe una respuesta al comprador")).toHaveCount(0);
  expect(nativeDialogSeen).toBe(false);

  await questionThread.getByRole("button", { name: "Reabrir" }).click();

  await expect(questionThread).toContainText("Abierta");
  await expect(questionThread.getByPlaceholder("Escribe una respuesta al comprador")).toBeVisible();
  await expect(page.locator(".queue-list")).toContainText(questionBody);
});
