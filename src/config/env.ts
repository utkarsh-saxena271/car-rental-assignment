if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export const JWT_SECRET = process.env.JWT_SECRET;