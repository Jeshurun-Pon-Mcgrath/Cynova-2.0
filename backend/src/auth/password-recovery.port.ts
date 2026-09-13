export const PASSWORD_RECOVERY_PORT = Symbol("PASSWORD_RECOVERY_PORT");

export interface PasswordRecoveryPort {
  request(email: string): Promise<void>;
}

export class UnconfiguredPasswordRecoveryAdapter implements PasswordRecoveryPort {
  async request(email: string): Promise<void> {
    // Intentionally does not claim to send mail. Replace this provider when a
    // real expiring, one-time reset-token delivery flow is configured.
    void email;
    return Promise.resolve();
  }
}
