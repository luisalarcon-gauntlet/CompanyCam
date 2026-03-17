export const AI_CONFIDENCE = {
  AUTO_SUGGEST: 0.90,  // Auto-suggest, 2s countdown
  SUGGEST: 0.70,       // Show suggestion, require tap
  GUESS: 0.50,         // Show as guess, ask "is this right?"
  NO_MATCH: 0.49       // No suggestion, show full list
}

export const TRADE_TYPES = [
  { value: 'roofing', label: 'Roofing', emoji: '🏠' },
  { value: 'hvac', label: 'HVAC', emoji: '❄️' },
  { value: 'plumbing', label: 'Plumbing', emoji: '🔧' },
  { value: 'electrical', label: 'Electrical', emoji: '⚡' },
  { value: 'general', label: 'General Contracting', emoji: '🔨' },
  { value: 'painting', label: 'Painting', emoji: '🎨' },
  { value: 'landscaping', label: 'Landscaping', emoji: '🌿' },
  { value: 'flooring', label: 'Flooring', emoji: '🪵' },
  { value: 'fencing', label: 'Fencing', emoji: '🏗️' },
  { value: 'solar', label: 'Solar', emoji: '☀️' },
  { value: 'windows_doors', label: 'Windows & Doors', emoji: '🪟' },
  { value: 'restoration', label: 'Restoration', emoji: '🔄' },
  { value: 'pool', label: 'Pool', emoji: '🏊' },
  { value: 'other', label: 'Other', emoji: '🔩' },
]

export const TRADE_EMOJI = Object.fromEntries(
  TRADE_TYPES.map(t => [t.value, t.emoji])
)

export const TRADE_LABEL = Object.fromEntries(
  TRADE_TYPES.map(t => [t.value, t.label])
)
