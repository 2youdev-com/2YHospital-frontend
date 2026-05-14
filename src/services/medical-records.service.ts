import apiClient from './api.client';
import type { LabResult, RadiologyReport, Prescription, VisitHistory, PatientSummary } from '@/types';

export const medicalRecordsService = {
  // Patient
  async getLabResults(): Promise<LabResult[]> {
    const { data } = await apiClient.get('/medical-records/lab-results');
    return data.data;
  },

  async getLabResult(id: string): Promise<LabResult> {
    const { data } = await apiClient.get(`/medical-records/lab-results/${id}`);
    return data.data;
  },

  async getRadiologyReports(): Promise<RadiologyReport[]> {
    const { data } = await apiClient.get('/medical-records/radiology');
    return data.data;
  },

  async getRadiologyReport(id: string): Promise<RadiologyReport> {
    const { data } = await apiClient.get(`/medical-records/radiology/${id}`);
    return data.data;
  },

  async getPrescriptions(): Promise<Prescription[]> {
    const { data } = await apiClient.get('/medical-records/prescriptions');
    return data.data;
  },

  async getVisitHistory(): Promise<VisitHistory[]> {
    const { data } = await apiClient.get('/medical-records/visits');
    return data.data;
  },

  // Doctor
  async getPatientSummary(patientId: string): Promise<PatientSummary> {
    const { data } = await apiClient.get(`/medical-records/patient/${patientId}/summary`);
    return data.data;
  },

  async addMedicalNote(patientId: string, note: string) {
    const { data } = await apiClient.post(`/medical-records/patient/${patientId}/notes`, { content: note });
    return data.data;
  },

  async approveMedicalNote(noteId: string) {
    const { data } = await apiClient.patch(`/medical-records/notes/${noteId}/approve`);
    return data.data;
  },
};
