import api from '@/lib/api';

export const financesService = {
  async getOverview(): Promise<any[]> {
    // Expected shape: [{ name: 'Jan', revenus: number, objectif: number }, ...]
    try {
      const res = await api.get('/finances/reports/revenue');
      return Array.isArray(res.data) ? res.data : [];
    } catch {
      return [];
    }
  },

  async getPaymentDistribution(): Promise<any[]> {
    // Expected shape: [{ name: 'Payé', value: number, color: string, amount?: number }, ...]
    try {
      const res = await api.get('/finances/stats');
      const raw = res.data?.paymentDistribution;
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  },

  async getFeeTypes(): Promise<any[]> {
    // Expected shape: [{ name, amount, percentage }, ...]
    try {
      const res = await api.get('/finances/fees');
      return Array.isArray(res.data) ? res.data : [];
    } catch {
      return [];
    }
  },

  async getPayments(): Promise<any[]> {
    // Expected shape: payments list
    try {
      const res = await api.get('/finances/payments');
      const raw = res.data;
      return Array.isArray(raw)
        ? raw.map((p: any) => ({
            id: p.id || p._id || p.paymentId,
            studentName: p.studentName || p.student?.name || `${p.student?.firstName ?? ''} ${p.student?.lastName ?? ''}`.trim(),
            class: p.class || p.className || p.classLabel,
            feeType: p.feeType || p.fee?.name,
            amount: p.amount,
            dueDate: p.dueDate || p.due || p.deadline,
            paidDate: p.paidDate || p.paid_at || p.paymentDate,
            status: p.status,
            paidAmount: p.paidAmount || p.amountPaid
          }))
        : [];
    } catch {
      return [];
    }
  },
};
