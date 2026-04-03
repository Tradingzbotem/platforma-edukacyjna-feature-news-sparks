// This file ensures type safety for translation keys
type Messages = typeof import('../messages/pl.json');

declare global {
  // Use type safe message keys with `next-intl`
  interface IntlMessages extends Messages {}
}
