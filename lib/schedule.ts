export interface ScheduleSlot {
  id: number
  startTime: string
  endTime: string
  label: string
}

// Fixed gym schedule: Monday to Friday, 8:15-20:15
// 45-minute slots with 15-minute breaks
// 1-hour lunch break between slots 7 and 9
export const DAILY_SCHEDULE: ScheduleSlot[] = [
  { id: 1, startTime: "08:15", endTime: "09:25", label: "1-2" },
  { id: 2, startTime: "09:40", endTime: "10:50", label: "3-4" },
  { id: 3, startTime: "11:05", endTime: "12:15", label: "5-6" },
  { id: 4, startTime: "12:30", endTime: "13:40", label: "7-8" },
  { id: 5, startTime: "14:40", endTime: "15:50", label: "9-10" },
  { id: 6, startTime: "16:05", endTime: "17:15", label: "11-12" },
  { id: 7, startTime: "17:30", endTime: "18:40", label: "13-14" },
  { id: 8, startTime: "18:55", endTime: "20:05", label: "15-16" },
]

export const isWeekday = (date: string): boolean => {
  const dayOfWeek = new Date(date).getDay()
  return dayOfWeek >= 1 && dayOfWeek <= 5 // Monday = 1, Friday = 5
}

export const getAvailableSlots = (date: string): ScheduleSlot[] => {
  if (!isWeekday(date)) {
    return []
  }
  return DAILY_SCHEDULE
}

export const formatSlotTime = (slot: ScheduleSlot): string => {
  return `${slot.startTime} - ${slot.endTime}`
}
