"use strict";

/**
 * Convert a major-currency amount to integer minor units (for example, dollars to cents).
 *
 * @param {number} amount - Amount in major units.
 * @returns {number} The amount in minor units, rounded to the nearest integer.
 */
function toMinorUnits(amount) {
  return Math.round(amount * 100);
}

/**
 * Convert integer minor units back to a major-currency amount.
 *
 * @param {number} minor - Amount in minor units.
 * @returns {number} The amount in major units.
 */
function toMajorUnits(minor) {
  return minor / 100;
}

/**
 * Sum a list of minor-unit amounts.
 *
 * @param {number[]} amounts - Amounts in minor units.
 * @returns {number} The total in minor units.
 */
function sumMinor(amounts) {
  return amounts.reduce((total, amount) => total + amount, 0);
}

module.exports = { toMinorUnits, toMajorUnits, sumMinor };
