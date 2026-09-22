/**
 * Formatting utility functions
 */

export function formatMinutesAgo(minutes: number): string {
  if (minutes <= 0) return "Just now";
  if (minutes === 1) return "Updated 1 min ago";
  if (minutes < 60) return `Updated ${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return "Updated 1 hour ago";
  if (hours < 24) return `Updated ${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `Updated ${days} days ago`;
}

export function formatDistance(distanceKm: number): string {
  return `${distanceKm.toFixed(1)} km`;
}

export function formatPhone(phone: string): string {
  return phone;
}
