import { Link as WouterLink, LinkProps } from "wouter";

/**
 * Centralized Link component to prevent 'Link is not defined' errors
 * and provide a single point for navigation logic.
 */
export function Link(props: LinkProps) {
  return <WouterLink {...props} />;
}
