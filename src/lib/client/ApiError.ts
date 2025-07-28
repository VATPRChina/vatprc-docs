export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly errorCode?: string,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
