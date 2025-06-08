import { LoginRequestDto } from "../dto/LoginRequestDto";

export class LoginAction {
  async execute(loginRequest: LoginRequestDto): Promise<void> {
    const response = await fetch('https://reqres.in/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: loginRequest.email,
        password: loginRequest.password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }

    const data = await response.json();
    console.log('Login successful, token:', data.token);
  }
}
