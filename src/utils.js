/**
 * Random string generator with `length` length. Generate from list of upper and
 * lower alphabets, and numbers.
 * 
 * @param {number} length
 */
const randstr = (function () {
   const firstAlphaOrd  = 'A'.charCodeAt(0);
   const lastAlphaOrd   = 'Z'.charCodeAt(0);
   const firstNumberOrd = '0'.charCodeAt(0);
   const lastNumberOrd  = '9'.charCodeAt(0);

   // add 1 to include the last item
   const alphaList = Array(lastAlphaOrd - firstAlphaOrd + 1)
      .fill()
      .map((_, i) => String.fromCharCode(i + firstAlphaOrd));
   const numberList = Array(lastNumberOrd - firstNumberOrd + 1)
      .fill()
      .map((_, i) => String.fromCharCode(i + firstNumberOrd));
   const lowAlphaList = alphaList
      .join('')
      .toLowerCase();

   const strList = [...alphaList, ...numberList, ...lowAlphaList];

   /**
    * @param {number} length
    */
   return function(length) {
      return Array(length)
         .fill()
         .map(() => strList[randrange(0, strList.length)])
         .join('');
   }
})();

/**
 * Random int generator from `start` to `end` (excluded).
 *
 * @param {number} start 
 * @param {number} end 
 */
function randrange(start, end) {
   return Math.floor(Math.random() * (end - start)) + start;
}

// =============================================================================

export {
   randstr,
   randrange,
};