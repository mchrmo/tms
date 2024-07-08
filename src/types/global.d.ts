export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role: {
        id: number;
        name: string;
      };
    };
  }
}
