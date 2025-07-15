export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export async function login(email: string, password: string): Promise<User | null> {
  try {
    const res = await fetch('http://localhost:3000/dev/auth/superAdminLogin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok || !data.user) {
      console.error(data.message || 'Login failed');
      return null;
    }

    return data.user as User;
  } catch (error) {
    console.error('Network or server error', error);
    return null;
  }
}
