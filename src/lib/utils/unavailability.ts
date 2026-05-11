/**
 * Returns true if the user is currently unavailable based on their unavailability range.
 * If the range has already passed, returns false (and the caller should clear it).
 */
export function isUserUnavailable(
  unavailable_from?: Date | string | null,
  unavailable_to?: Date | string | null
): boolean {
  if (!unavailable_from || !unavailable_to) return false
  const now = new Date()
  const from = new Date(unavailable_from)
  const to = new Date(unavailable_to)
  return now >= from && now <= to
}

/**
 * Returns true if the unavailability range is expired (end date is in the past).
 */
export function isUnavailabilityExpired(
  unavailable_to?: Date | string | null
): boolean {
  if (!unavailable_to) return false
  return new Date() > new Date(unavailable_to)
}
