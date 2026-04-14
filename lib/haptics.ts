import * as Haptics from 'expo-haptics';

/** Light tap — button presses, toggles, navigations */
export const tap = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

/** Medium impact — significant actions like generating a plan */
export const impact = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

/** Heavy impact — destructive actions like deleting items */
export const heavy = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

/** Success notification — task completed */
export const success = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

/** Selection — scrolling, picking from list */
export const select = () => Haptics.selectionAsync();