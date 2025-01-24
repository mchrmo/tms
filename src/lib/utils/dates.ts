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

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "Máj", "Jún", "Júl", "Aug", "Sep", "Okt", "Nov", "Dec"
];

export function formatDateShort(date: Date) {
  const day = date.getDate();
  const month = monthNames[date.getMonth()];

  return `${month} ${day}`;
}