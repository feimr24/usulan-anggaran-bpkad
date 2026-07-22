import api from "@/lib/axios"

export const skpdService = {
  getAll: () => api.get("/skpd"),
  getById: (id: string) => api.get(`/skpd/${id}`),
  create: (data: any) => api.post("/skpd", data),
  update: (id: string, data: any) => api.put(`/skpd/${id}`, data),
  delete: (id: string) => api.delete(`/skpd/${id}`),
}

export const usulanService = {
  getAll: () => api.get("/usulan"),
  getById: (id: string) => api.get(`/usulan/${id}`),
  create: (data: any) => api.post("/usulan", data),
  update: (id: string, data: any) => api.put(`/usulan/${id}`, data),
  delete: (id: string) => api.delete(`/usulan/${id}`),
}

export const jadwalService = {
  getAll: () => api.get("/jadwal"),
  getById: (id: string) => api.get(`/jadwal/${id}`),
  create: (data: any) => api.post("/jadwal", data),
  update: (id: string, data: any) => api.put(`/jadwal/${id}`, data),
  delete: (id: string) => api.delete(`/jadwal/${id}`),
}

export const authService = {
  login: (credentials: { userId: string; password: string }) =>
    api.post("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
}
