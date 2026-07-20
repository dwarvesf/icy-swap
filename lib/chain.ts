import { base } from "wagmi/chains";

/**
 * The one chain this app serves. Every consumer imports it from here so a
 * future chain change is a one-line edit, and every contract write pins
 * `theChain.id` explicitly: a wallet sitting on the wrong network then gets
 * a switch prompt (or a hard error) instead of a transaction silently
 * targeting whatever chain it happens to be on.
 */
export const theChain = base;
