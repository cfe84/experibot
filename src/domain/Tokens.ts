export interface Tokens {
  accessToken: string;
  idToken: {
    payload: {
      name: string;
      email: string;
    };
  };
}
