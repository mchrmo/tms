import { format, toZonedTime } from 'date-fns-tz';



export function formatDate(date: Date) {
  return format(date, 'dd.MM.yyyy')
}

export function formatDateTime(date: Date) {
  const localDate = toZonedTime(date, "Europe/Bratislava");

  return format(localDate, 'dd.MM.yyyy HH:mm')
}

export function formatDateTimeHtml(date: Date) {
  return format(date, 'yyyy-MM-dd') + 'T' + format(date, 'HH:mm')
}