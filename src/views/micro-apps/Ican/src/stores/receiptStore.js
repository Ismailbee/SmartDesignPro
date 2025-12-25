import { defineStore } from 'pinia';
import { useFinanceStore } from './finance';

const getCurrentDate = () => new Date().toISOString().split('T')[0];

const numberToWords = (value) => {
  const units = [
    'zero',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'eleven',
    'twelve',
    'thirteen',
    'fourteen',
    'fifteen',
    'sixteen',
    'seventeen',
    'eighteen',
    'nineteen',
  ];

  const tens = [
    '',
    '',
    'twenty',
    'thirty',
    'forty',
    'fifty',
    'sixty',
    'seventy',
    'eighty',
    'ninety',
  ];

  const toWords = (num) => {
    if (num < 20) return units[num];
    if (num < 100) {
      const ten = Math.floor(num / 10);
      const rest = num % 10;
      return tens[ten] + (rest ? `-${units[rest]}` : '');
    }
    if (num < 1000) {
      const hundred = Math.floor(num / 100);
      const rest = num % 100;
      return `${units[hundred]} hundred${rest ? ` ${toWords(rest)}` : ''}`;
    }
    if (num < 1000000) {
      const thousand = Math.floor(num / 1000);
      const rest = num % 1000;
      return `${toWords(thousand)} thousand${rest ? ` ${toWords(rest)}` : ''}`;
    }
    if (num < 1000000000) {
      const million = Math.floor(num / 1000000);
      const rest = num % 1000000;
      return `${toWords(million)} million${rest ? ` ${toWords(rest)}` : ''}`;
    }
    return value.toString();
  };

  return toWords(value);
};

const clampKobo = (state) => {
  state.naira = Number(state.naira) || 0;
  state.kobo = Number(state.kobo) || 0;

  if (state.kobo >= 100) {
    const carry = Math.floor(state.kobo / 100);
    state.naira += carry;
    state.kobo = state.kobo % 100;
  }

  if (state.kobo < 0) {
    const borrow = Math.ceil(Math.abs(state.kobo) / 100);
    state.naira = Math.max(0, state.naira - borrow);
    state.kobo = (state.kobo % 100 + 100) % 100;
  }

  if (state.naira < 0) {
    state.naira = 0;
  }
};

export const useReceiptStore = defineStore('receipt', {
  state: () => ({
    logoDataUrl: '',
    organizationName: '',
    address: '',
    phone: '',
    date: getCurrentDate(),
    autoDate: true,
    receivedFrom: '',
    sumOf: '',
    naira: 0,
    kobo: 0,
    paymentFor: '',
    amountNotes: '',
    signatureName: '',
  }),
  getters: {
    amountValue(state) {
      clampKobo(state);
      return (Number(state.naira) || 0) + (Number(state.kobo) || 0) / 100;
    },
    amountInWords(state) {
      const formatter = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 2,
      });

      const naira = Math.floor(this.amountValue);
      const kobo = Math.round((this.amountValue - naira) * 100);

      let words = `${numberToWords(naira)}`;
      if (kobo > 0) {
        words += ` and ${numberToWords(kobo)}`;
      }

      const formattedWords = words
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/^\w/, (c) => c.toUpperCase());

      return {
        formatted: formatter.format(this.amountValue),
        words: formattedWords,
      };
    },
  },
  actions: {
    toggleAutoDate() {
      this.autoDate = !this.autoDate;
      if (this.autoDate) {
        this.date = getCurrentDate();
      }
    },
    incrementReceiptNumber() {
      const financeStore = useFinanceStore();
      financeStore.registerReceipt({
        number: financeStore.autoReceiptNumber ? undefined : financeStore.receiptNumber,
        amount: this.amountValue,
        date: this.autoDate ? undefined : this.date,
        name: this.receivedFrom || 'Receipt',
        description: this.paymentFor || this.sumOf || 'Receipt generated',
      });
      if (this.autoDate) {
        this.date = getCurrentDate();
      }
    },
    ensureRanges() {
      clampKobo(this.$state);
    },
    setLogoFromFile(file) {
      return new Promise((resolve, reject) => {
        if (!file) {
          this.logoDataUrl = '';
          resolve('');
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          this.logoDataUrl = reader.result;
          resolve(reader.result);
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });
    },
    clearLogo() {
      this.logoDataUrl = '';
    },
  },
});
