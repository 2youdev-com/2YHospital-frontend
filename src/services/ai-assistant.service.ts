import apiClient from './api.client';

export const aiAssistantService = {
  // Patient chat
  async chat(message: string, sessionId?: string) {
    const { data } = await apiClient.post('/ai-assistant/chat', { message, sessionId });
    return data.data;
  },

  async doctorChat(message: string, patientId?: string) {
    const { data } = await apiClient.post('/ai-assistant/doctor/chat', { message, patientId });
    return data.data;
  },

  async adminChat(message: string, period: 'daily' | 'weekly' = 'daily') {
    const { data } = await apiClient.post('/ai-assistant/admin/chat', { message, period });
    return data.data;
  },

  async getMySessions() {
    const { data } = await apiClient.get('/ai-assistant/sessions');
    return data.data;
  },

  async getChatHistory(sessionId: string) {
    const { data } = await apiClient.get(`/ai-assistant/sessions/${sessionId}`);
    return data.data;
  },

  // Doctor
  async getPatientAISummary(patientId: string) {
    const { data } = await apiClient.get(`/ai-assistant/doctor/patient/${patientId}/summary`);
    return data.data;
  },

  async draftVisitSummary(patientId: string, notes: string) {
    const { data } = await apiClient.post(`/ai-assistant/doctor/patient/${patientId}/draft-visit`, { notes });
    return data.data;
  },

  // Admin
  async getOperationalSummary() {
    const { data } = await apiClient.get('/ai-assistant/admin/operational-summary');
    return data.data;
  },
};
