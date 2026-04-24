export type NestErrorBody = {
  statusCode: number;
  message: string | string[];
  error?: string;
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: NestErrorBody,
  ) {
    super(Array.isArray(body.message) ? body.message[0] : body.message);
    this.name = 'ApiError';
  }

  /** Pierwszy komunikat błędu jako string */
  get firstMessage() {
    return Array.isArray(this.body.message)
      ? this.body.message[0]
      : this.body.message;
  }

  /** Wszystkie komunikaty jako tablica */
  get messages() {
    return Array.isArray(this.body.message)
      ? this.body.message
      : [this.body.message];
  }
}
