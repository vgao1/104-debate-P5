import { ObjectId } from "mongodb";
import { Debate, Review } from "./app";
import { DifferentOpinionMatchDoc } from "./concepts/debate";
import { ActivePhaseDoc, BasePhaseDoc, KeyExistsError } from "./concepts/phase";
import { Router } from "./framework/router";

const PHASES = ["Proposed", "Start", "Review", "Recently Completed", "Archived"];

/**
 * This class does useful conversions for the frontend.
 */
export default class Responses {
  /**
   * Convert PhaseDoc into more readable format for the frontend by
   * converting the key id into a debate prompt and the curPhase into
   * a string format.
   */
  static async phase(phase: ActivePhaseDoc | BasePhaseDoc | null) {
    if (!phase) {
      return phase;
    }
    const debate = await Debate.getDebateById(phase.key);
    const curPhase = PHASES[phase.curPhase];
    return { ...phase, prompt: debate.prompt, category: debate.category, curPhase };
  }

  /**
   * Same as {@link phase} but for an array of PhaseDoc for improved performance.
   */
  static async phases(phases: ActivePhaseDoc[] | BasePhaseDoc[]) {
    const debates = await Promise.all(phases.map(async (phase) => await Debate.getDebateById(phase.key)));
    return phases.map((phase, i) => ({ ...phase, prompt: debates[i].prompt, category: debates[i].category, curPhase: PHASES[phase.curPhase] }));
  }

  static async opinions(phase: ActivePhaseDoc | BasePhaseDoc | null) {
    if (!phase) {
      return phase;
    }
    let opinionsWithScore = [];
    const opinions = await Debate.getAllOpinionsForDebate(phase.key.toString());
    const debate = await Debate.getDebateById(phase.key);
    const debateID = debate._id.toString();
    for (let i = 0; i < opinions.length; i++) {
      let score = 0;
      const opinion = { ...opinions[i], score: 0 };
      const opinionID = opinions[i]._id.toString();
      const reviews = await Review.getReviewsByOpinion(debateID, opinionID);
      for (const review of reviews) {
        const likertDiff = await Debate.getLikertDiffByUser(debateID, review.reviewer.toString());
        const weight = review.score / 150;
        score += likertDiff * weight;
      }
      opinion.score = (await Review.uploadTotalScore(debate._id.toString(), opinions[i]._id.toString(), Math.round(score))).score;
      opinionsWithScore.push(opinion);
    }
    opinionsWithScore = opinionsWithScore
      .sort(
        (
          prev: { score: number; content: string; author: string; likertScale: number; debate: string; _id: ObjectId; dateCreated: Date; dateUpdated: Date },
          curr: { score: number; content: string; author: string; likertScale: number; debate: string; _id: ObjectId; dateCreated: Date; dateUpdated: Date },
        ) => Number(prev.score) - Number(curr.score),
      )
      .reverse();
    return { opinions: opinionsWithScore, prompt: debate.prompt, category: debate.category, curPhase: PHASES[phase.curPhase] };
  }

  static async opinionContents(matchedOpinions: DifferentOpinionMatchDoc | null) {
    if (!matchedOpinions) {
      return matchedOpinions;
    }
    const opinions = matchedOpinions.matchedDifferentOpinions;
    const opinionContents = await Promise.all(opinions.map(async (opinion) => await Debate.getOpinionContentById(new ObjectId(opinion))));
    return opinionContents;
  }
}

Router.registerError(KeyExistsError, async (e) => {
  // const debateObj = await Debate.getDebateById(e.key);
  // const promptFormatted = '\"' + debate.prompt + '\"';
  // return e.formatWith(promptFormatted);
  return e; // DELETE ME
});
