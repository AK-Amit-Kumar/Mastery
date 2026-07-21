export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported'
  return Notification.permission
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied'
  return Notification.requestPermission()
}

export function showReminderNotification(skillNames: string[]) {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return
  const body =
    skillNames.length === 1
      ? `Log some hours on ${skillNames[0]} to keep your streak alive.`
      : `You've got ${skillNames.length} skills waiting for hours today. Keep the streak alive!`
  new Notification('MASTERY — Practice reminder', {
    body,
    icon: '/favicon.svg',
    tag: 'mastery-daily-reminder',
  })
}
