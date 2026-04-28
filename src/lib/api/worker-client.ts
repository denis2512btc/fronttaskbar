const baseURL = import.meta.env.VITE_WORKER_URL as string | undefined

export const workerClient = {
  baseURL: baseURL ?? '',
}
