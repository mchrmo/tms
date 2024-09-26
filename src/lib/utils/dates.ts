import { format } from "date-fns";



export function formatDate(date: Date) {
  return format(date, 'dd.MM.yyyy')
}

export function formatDateTime(date: Date) {
  return format(date, 'dd.MM.yyyy kk:mm')
}

export function formatDateTimeHtml(date: Date) {
  return format(date, 'yyyy-MM-dd') + 'T' + format(date, 'kk:mm')
}