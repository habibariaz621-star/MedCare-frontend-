import axios from 'axios';

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) {
      return 'Cannot connect to backend server. Start NestJS at http://localhost:5000 or enable mock auth in .env.local.';
    }
    const data = err.response.data as { message?: string | string[] };
    if (Array.isArray(data?.message)) return data.message.join(', ');
    if (typeof data?.message === 'string') return data.message;
    return fallback;
  }

  const custom = err as { response?: { data?: { message?: string } } };
  if (custom?.response?.data?.message) return custom.response.data.message;

  return fallback;
}
