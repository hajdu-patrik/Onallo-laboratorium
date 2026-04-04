import { create } from 'zustand';
import type { AppointmentDto } from '../types/scheduler.types';

interface SchedulerState {
  todayAppointments: AppointmentDto[];
  monthAppointments: AppointmentDto[];
  calendarYear: number;
  calendarMonth: number;
  isLoadingToday: boolean;
  isLoadingMonth: boolean;
  error: string | null;
  setTodayAppointments: (appts: AppointmentDto[]) => void;
  setMonthAppointments: (appts: AppointmentDto[]) => void;
  setCalendarMonth: (year: number, month: number) => void;
  upsertAppointment: (updated: AppointmentDto) => void;
  setIsLoadingToday: (v: boolean) => void;
  setIsLoadingMonth: (v: boolean) => void;
  setError: (e: string | null) => void;
}

export const useSchedulerStore = create<SchedulerState>((set) => {
  const now = new Date();
  return {
    todayAppointments: [],
    monthAppointments: [],
    calendarYear: now.getFullYear(),
    calendarMonth: now.getMonth() + 1,
    isLoadingToday: false,
    isLoadingMonth: false,
    error: null,
    setTodayAppointments: (appts) => set({ todayAppointments: appts }),
    setMonthAppointments: (appts) => set({ monthAppointments: appts }),
    setCalendarMonth: (year, month) => set({ calendarYear: year, calendarMonth: month }),
    upsertAppointment: (updated) =>
      set((state) => ({
        todayAppointments: state.todayAppointments.map((a) =>
          a.id === updated.id ? updated : a
        ),
        monthAppointments: state.monthAppointments.map((a) =>
          a.id === updated.id ? updated : a
        ),
      })),
    setIsLoadingToday: (isLoadingToday) => set({ isLoadingToday }),
    setIsLoadingMonth: (isLoadingMonth) => set({ isLoadingMonth }),
    setError: (error) => set({ error }),
  };
});