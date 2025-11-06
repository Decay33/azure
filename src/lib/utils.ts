export const cn = (...classes: Array<string | boolean | undefined | null>) =>
  classes.filter(Boolean).join(" ");
