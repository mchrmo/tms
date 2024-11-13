import { format, toZonedTime } from 'date-fns-tz';



export function formatDate(date: Date) {
  return format(date, 'dd.MM.yyyy')
}

export function formatDateTime(date: Date) {

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; // Automatically uses local time zone
  const localDate = toZonedTime(date, timeZone);
  

  return format(date, 'dd.MM.yyyy HH:mm')
}

export function formatDateTimeHtml(date: Date) {
  return format(date, 'yyyy-MM-dd') + 'T' + format(date, 'HH:mm')
}