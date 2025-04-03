import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.DEFAULT })
export class StringSimilarityService {
  compareTwoStrings(first: string, second: string) {
    first = first.replace(/\s+/g, '');
    second = second.replace(/\s+/g, '');

    if (first === second) return 1; // identical or empty
    if (first.length < 2 || second.length < 2) return 0; // if either is a 0-letter or 1-letter string

    const firstBigrams = new Map();
    for (let i = 0; i < first.length - 1; i++) {
      const bigram = first.substring(i, i + 2);
      const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) + 1 : 1;

      firstBigrams.set(bigram, count);
    }

    let intersectionSize = 0;
    for (let i = 0; i < second.length - 1; i++) {
      const bigram = second.substring(i, i + 2);
      const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) : 0;

      if (count > 0) {
        firstBigrams.set(bigram, count - 1);
        intersectionSize++;
      }
    }

    return (2.0 * intersectionSize) / (first.length + second.length - 2);
  }

  findBestMatch(mainString: string, targetStrings: string[]) {
    if (!this.areArgsValid(mainString, targetStrings))
      throw new Error('Bad arguments: First argument should be a string, second should be an array of strings');

    const ratings: { target: string; rating: number }[] = [];
    let bestMatchIndex = 0;

    for (let i = 0; i < targetStrings.length; i++) {
      let currentTargetString = targetStrings[i];
      if (currentTargetString === 'SUGARLOAFPLOP') {
        currentTargetString = 'SugarLoafPLoP';
      } else if (currentTargetString === 'PLOP') {
        currentTargetString = 'PLoP';
        // } else if (
        //   currentTargetString ===
        //   'Intelligent Systems for Molecular Biology / European Conference on Computational Biology'
        // ) {
        //   const currentTargetString1 =
        //     'Intelligent Systems for Molecular Biology';
        //   const currentTargetString2 =
        //     'European Conference on Computational Biology';

        //   const currentRating1 = this.compareTwoStrings(
        //     mainString,
        //     currentTargetString1,
        //   );

        //   const currentRating2 = this.compareTwoStrings(
        //     mainString,
        //     currentTargetString2,
        //   );

        //   if (currentRating1 > currentRating2) {
        //     currentTargetString = currentTargetString1;
        //   } else {
        //     currentTargetString = currentTargetString2;
        //   }
      }

      const currentRating = this.compareTwoStrings(mainString, currentTargetString);
      // if (
      //   currentTargetString === 'Intelligent Systems for Molecular Biology' ||
      //   currentTargetString === 'European Conference on Computational Biology'
      // )
      //   currentTargetString = targetStrings[i];
      ratings.push({ target: currentTargetString, rating: currentRating });
      if (currentRating > ratings[bestMatchIndex].rating) {
        bestMatchIndex = i;
      }
    }

    const bestMatch = ratings[bestMatchIndex];

    return {
      ratings: ratings,
      bestMatch: bestMatch,
      bestMatchIndex: bestMatchIndex,
    };
  }

  areArgsValid(mainString: string, targetStrings: string[]) {
    if (typeof mainString !== 'string') return false;
    if (!Array.isArray(targetStrings)) return false;
    if (!targetStrings.length) return false;
    if (
      targetStrings.find(function (s) {
        return typeof s !== 'string';
      })
    )
      return false;
    return true;
  }
}
