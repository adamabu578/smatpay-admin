import { TrnxJSONObj } from "@/components/transaction-table";
import { create } from "zustand";

type activeTransaction = {
    paymentMethod: string,
};

type balance = {
    wallet: number,
    bonus: number,
};

type transactionHistory = TrnxJSONObj;

type alert = {
    status: string,
    showIcon: boolean,
    message: string,
    showOkBtn: boolean,
    showCancelBtn: boolean,
};

interface Profile {
    firstName: string,
    lastName: string,
    email: string,
}

interface store {
    profile: Profile | null,
    setProfile: (profile: Profile | null) => void,
    balance: balance,
    setBalance: (balance: balance) => void,
    activeTransaction: activeTransaction | null,
    setActiveTransaction: (activeTransaction: activeTransaction) => void,
    alert: alert | null,
    setAlert: (alert: alert) => void,
    transactionHistories: (transactionHistory)[],
    setTransactionHistories: (histories: (transactionHistory)[]) => void,
    transToView: object | null,
    setTransToView: (transaction: object | null) => void,
};

// interface ProfileState {
//     profile: { firstName: string, email: string } | null, //profile: object | null,
//     setProfile: (profile: store) => void,
// };

const useStore = create<store>(set => ({
    profile: null,
    setProfile: (profile) => set(() => ({ profile: profile })),
    balance: { wallet: 0, bonus: 0 },
    setBalance: (balance: balance) => set(() => ({ balance: balance })),
    activeTransaction: null,
    setActiveTransaction: (activeTransaction: activeTransaction) => set(() => ({ activeTransaction: activeTransaction })),
    alert: null,//{ status: 'info', showIcon: true, message: '', showOkBtn: true, showCancelBtn: false },
    setAlert: (alert: alert) => set(() => ({ alert: alert })),
    transactionHistories: [],
    setTransactionHistories: (histories: (transactionHistory)[]) => set(() => ({ transactionHistories: histories })),
    transToView: null,
    setTransToView: (transaction: object | null) => set(() => ({ transToView: transaction })),
}));

// const useProfileStore = create<store>(set => ({
//     profile: null,
//     setProfile: (profile: store) => set((state: store) => ({ profile: profile })),
// }));

export default useStore;