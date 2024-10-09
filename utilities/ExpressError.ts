class ExpressError extends Error {
  public status: number;
  constructor(status: number, message: string) {
    super();
    this.message = message;
    this.status = status;
  }
}

export default ExpressError;
