/** Hitilafu ya kibali (validation) yenye HTTP status. */
export class InputError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}
