const apiBaseUrl = process.env.API_BASE_URL ?? "http://127.0.0.1:8080/api";

async function main() {
  const response = await fetch(`${apiBaseUrl}/orders/ord-1002/questions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      productId: "prod-1",
      body: "La laptop llegó rota, necesito devolución urgente."
    })
  });

  if (!response.ok) {
    throw new Error(`Simulation failed with HTTP ${response.status}: ${await response.text()}`);
  }

  const data = (await response.json()) as { question: { id: string; priority: { level: string; score: number } } };

  console.log(
    `Created ${data.question.priority.level} question ${data.question.id} with score ${data.question.priority.score}.`
  );
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
