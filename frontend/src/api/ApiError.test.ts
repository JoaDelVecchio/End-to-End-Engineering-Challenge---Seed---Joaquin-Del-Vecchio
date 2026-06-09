import { ApiError } from "./ApiError";

describe("ApiError", () => {
  it("keeps status, code, message, and optional details", () => {
    const details = { fieldErrors: { body: ["Required"] } };
    const error = new ApiError(400, "VALIDATION_ERROR", "Validation error", details);

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("ApiError");
    expect(error.status).toBe(400);
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.message).toBe("Validation error");
    expect(error.details).toBe(details);
  });
});
