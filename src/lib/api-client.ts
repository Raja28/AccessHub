import axios from "axios";

export const api = axios.create({
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  validateStatus: () => true,
});

export function isOk(status: number) {
  return status >= 200 && status < 300;
}
