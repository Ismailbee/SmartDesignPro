import { defineStore } from 'pinia';
import { useFinanceStore } from './finance';

const randomId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

const defaultLineItem = () => ({
  id: randomId(),
  description: '',
  quantity: 1,
  price: 0,
});

export const useInvoiceStore = defineStore('invoice', {
  state: () => ({
    organizationName: '',
    address: '',
    phone: '',
    date: new Date().toISOString().split('T')[0],
    autoDate: true,
    items: [defaultLineItem()],
  }),
  getters: {
    subtotal(state) {
      return state.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    },
    taxAmount(state) {
      const financeStore = useFinanceStore();
      if (!financeStore.taxEnabled) {
        return 0;
      }
      return (this.subtotal * financeStore.taxRate) / 100;
    },
    grandTotal() {
      return this.subtotal + this.taxAmount;
    },
    amountInWords() {
      const formatter = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
      });

      const numberToWords = (value) => {
        if (value === 0) return 'zero';
        const units = [
          'zero','one','two','three','four','five','six','seven','eight','nine','ten',
          'eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen',
        ];
        const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

        const toWords = (num) => {
          if (num < 20) return units[num];
          if (num < 100) {
            const ten = Math.floor(num / 10);
            const rest = num % 10;
            return tens[ten] + (rest ? '-' + units[rest] : '');
          }
          if (num < 1000) {
            const hundred = Math.floor(num / 100);
            const rest = num % 100;
            return units[hundred] + ' hundred' + (rest ? ' ' + toWords(rest) : '');
          }
          if (num < 1000000) {
            const thousand = Math.floor(num / 1000);
            const rest = num % 1000;
            return toWords(thousand) + ' thousand' + (rest ? ' ' + toWords(rest) : '');
          }
          if (num < 1000000000) {
            const million = Math.floor(num / 1000000);
            const rest = num % 1000000;
            return toWords(million) + ' million' + (rest ? ' ' + toWords(rest) : '');
          }
          return value.toString();
        };

        return toWords(value);
      };

      const naira = Math.floor(this.grandTotal);
      const kobo = Math.round((this.grandTotal - naira) * 100);

      let words = `${numberToWords(naira)} naira`;
      if (kobo > 0) {
        words += ` and ${numberToWords(kobo)} kobo`;
      }

      return {
        formatted: formatter.format(this.grandTotal),
        words: words.replace(/\s+/g, ' ').trim().replace(/^\w/, (c) => c.toUpperCase()),
      };
    },
  },
  actions: {
    toggleAutoDate() {
      this.autoDate = !this.autoDate;
      if (this.autoDate) {
        this.date = new Date().toISOString().split('T')[0];
      }
    },
    toggleTax() {
      const financeStore = useFinanceStore();
      financeStore.toggleTax();
    },
    setTaxRate(value) {
      const financeStore = useFinanceStore();
      financeStore.setTaxRate(value);
    },
    addItem() {
      this.items.push(defaultLineItem());
    },
    removeItem(id) {
      if (this.items.length === 1) return;
      this.items = this.items.filter((item) => item.id !== id);
    },
    updateItem(id, payload) {
      this.items = this.items.map((item) => (item.id === id ? { ...item, ...payload } : item));
    },
    incrementInvoiceNumber() {
      const financeStore = useFinanceStore();
      financeStore.registerInvoice({
        number: financeStore.autoInvoiceNumber ? undefined : financeStore.invoiceNumber,
        amount: this.grandTotal,
        date: this.autoDate ? undefined : this.date,
        summary: `${this.items.length} items`,
        name: this.organizationName || 'Invoice',
        description: this.items
          .filter((item) => item.description)
          .map((item) => item.description)
          .slice(0, 3)
          .join(', ') || 'Invoice generated',
      });
      if (this.autoDate) {
        this.date = new Date().toISOString().split('T')[0];
      }
    },
    resetInvoice() {
      this.organizationName = '';
      this.address = '';
      this.phone = '';
      this.items = [defaultLineItem()];
      this.date = new Date().toISOString().split('T')[0];
      this.autoDate = true;
    },
  },
});
