import axios, { type AxiosError, isAxiosError } from "axios";

export interface ApiErrorResponse {
	error?: string;
	code?: string;
}

const api = axios.create({
	baseURL: import.meta.env.VITE_BACKEND_URL,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
});

api.interceptors.response.use(
	(response) => response,
	(error: AxiosError<ApiErrorResponse>) => {
		const data = error.response?.data;
		if (data?.error) {
			error.message = data.error;
		} else if (error.code === "ERR_NETWORK") {
			error.message = "Network error. Please try again.";
		}
		return Promise.reject(error);
	},
);

export function getErrorMessage(error: unknown): string {
	if (isAxiosError(error)) {
		if (error.response?.data?.error) return error.response.data.error;
		if (error.code === "ERR_NETWORK") return "Network error. Please try again.";
		if (typeof error.message === "string" && error.message)
			return error.message;
	}
	if (error instanceof Error && error.message) return error.message;
	return "Something went wrong";
}

export default api;
