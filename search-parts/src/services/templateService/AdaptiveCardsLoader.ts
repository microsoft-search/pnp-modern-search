/**
 * This module ensures that adaptive-expressions and adaptivecards-templating
 * are loaded together in the correct order to avoid module resolution issues.
 */

// Import adaptive-expressions first to ensure it's loaded before adaptivecards-templating
import * as AEL from "adaptive-expressions";

// Now import adaptivecards-templating - it should use the same adaptive-expressions module
import { Template } from "adaptivecards-templating";

// Export as a namespace-like object for compatibility with existing code
export const AdaptiveCardsTemplating = { Template };

// Also export Template directly for convenience
export { Template };

// Export adaptive-expressions if needed elsewhere
export { AEL };
