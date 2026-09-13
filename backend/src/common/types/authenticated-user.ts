export interface AuthenticatedUser {
  id: string;
  sessionId: string;
  role: "USER" | "ADMIN";
}
