class Custom_Error extends Error {
  constructor(msg, statusCode) {
    super(msg);
    this.statusCode = statusCode || 500;
    this.message = msg || "Internal Server";
  }
}

export default Custom_Error;
