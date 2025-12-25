import { defineStore } from 'pinia';

const currentDate = () => new Date().toISOString().split('T')[0];
const uniqueId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

export const useFinanceStore = defineStore('finance', {
  state: () => ({
    invoices: [],
    receipts: [],
    invoiceNumber: 1,
    receiptNumber: 1,
    autoInvoiceNumber: true,
    autoReceiptNumber: true,
    autoInvoiceDate: true,
    autoReceiptDate: true,
    taxEnabled: false,
    taxRate: 7.5,
  }),
  getters: {
    nextInvoiceNumber: (state) => state.invoiceNumber,
    nextReceiptNumber: (state) => state.receiptNumber,
    invoiceItems: (state) => state.invoices,
    receiptItems: (state) => state.receipts,
    allTransactions: (state) => [...state.invoices, ...state.receipts].sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt).getTime();
      const dateB = new Date(b.date || b.createdAt).getTime();
      return dateB - dateA;
    }),
  },
  actions: {
    toggleAutoInvoiceNumber() {
      this.autoInvoiceNumber = !this.autoInvoiceNumber;
    },
    toggleAutoReceiptNumber() {
      this.autoReceiptNumber = !this.autoReceiptNumber;
    },
    toggleAutoInvoiceDate() {
      this.autoInvoiceDate = !this.autoInvoiceDate;
    },
    toggleAutoReceiptDate() {
      this.autoReceiptDate = !this.autoReceiptDate;
    },
    toggleTax() {
      this.taxEnabled = !this.taxEnabled;
    },
    setTaxRate(rate) {
      this.taxRate = Math.max(0, Number(rate) || 0);
    },
    registerInvoice(entry) {
      const invoiceEntry = {
        id: uniqueId(),
        type: 'invoice',
        ...entry,
        date: entry.date || currentDate(),
        number: this.autoInvoiceNumber ? this.invoiceNumber : entry.number,
        name: entry.name || 'Invoice',
        description: entry.description || entry.summary || 'Generated invoice entry',
        amount: Number(entry.amount) || 0,
        taxEnabled: entry.taxEnabled ?? this.taxEnabled,
        createdAt: new Date().toISOString(),
      };
      this.invoices.push(invoiceEntry);
      if (this.autoInvoiceNumber) {
        this.invoiceNumber += 1;
      }
    },
    registerReceipt(entry) {
      const receiptEntry = {
        id: uniqueId(),
        type: 'receipt',
        ...entry,
        date: entry.date || currentDate(),
        number: this.autoReceiptNumber ? this.receiptNumber : entry.number,
        name: entry.name || 'Receipt',
        description: entry.description || entry.summary || 'Generated receipt entry',
        amount: Number(entry.amount) || 0,
        createdAt: new Date().toISOString(),
      };
      this.receipts.push(receiptEntry);
      if (this.autoReceiptNumber) {
        this.receiptNumber += 1;
      }
    },
    setInvoiceNumber(value) {
      this.invoiceNumber = Math.max(1, Number(value) || 1);
    },
    setReceiptNumber(value) {
      this.receiptNumber = Math.max(1, Number(value) || 1);
    },
    reset() {
      this.invoices = [];
      this.receipts = [];
      this.invoiceNumber = 1;
      this.receiptNumber = 1;
      this.autoInvoiceNumber = true;
      this.autoReceiptNumber = true;
      this.taxEnabled = false;
      this.taxRate = 7.5;
    },
  },
});
