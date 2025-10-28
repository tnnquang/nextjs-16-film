/**
 * API Module Entry Point
 * 
 * Export the corrected API as the default export
 */

import movieApiCorrected from './movies-corrected'
import { movieApi as movieApiLegacy } from './movies'

// Export the corrected API as the default
export { movieApiCorrected as movieApi }

// Export legacy API for backward compatibility
export { movieApiLegacy }

// Also export as default
export default movieApiCorrected
