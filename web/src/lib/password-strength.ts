/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

export type PasswordStrength = 0 | 1 | 2 | 3 | 4

/**
 * Score a password on a 0–4 scale.
 *
 * - 0: empty or shorter than the minimum length (no meter shown)
 * - 1: Weak — meets length only
 * - 2: Medium — length + one character class beyond base
 * - 3: Strong — length + two character classes
 * - 4: Very strong — length + three/four character classes or long length
 *
 * The scoring intentionally stays client-side and advisory; the actual
 * password policy is still enforced by `accountPasswordSchema` and the
 * backend.
 */
export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return 0

  // Match the backend's Unicode-aware length check.
  const length = [...password].length
  if (length < 8) return 0

  let score = 0
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  // Length alone with no variety counts as the weakest valid password.
  if (score === 0) return 1

  // Bonus for noticeably longer passwords.
  if (length >= 12) score++

  return Math.min(score, 4) as PasswordStrength
}
