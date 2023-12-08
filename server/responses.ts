import { Debate, User } from "./app";
import { ActivePhaseDoc, BasePhaseDoc, KeyExistsError, NoPhaseError } from "./concepts/phase";
import { DifferentOpinionMatchDoc } from "./concepts/debate";
import { PostAuthorNotMatchError, PostDoc } from "./concepts/post";
import { Router } from "./framework/router";
import { ObjectId } from "mongodb";

const PHASES = ["Proposed", "Start", "Review", "Recently Completed", "Archived"];

/**
 * This class does useful conversions for the frontend.
 */
export default class Responses {
  /**
   * Convert PostDoc into more readable format for the frontend by
   * converting the author id into a username.
   */
  static async post(post: PostDoc | null) {
    if (!post) {
      return post;
    }
    const author = await User.getUserById(post.author);
    return { ...post, author: author.username };
  }

  /**
   * Same as {@link post} but for an array of PostDoc for improved performance.
   */
  static async posts(posts: PostDoc[]) {
    const authors = await User.idsToUsernames(posts.map((post) => post.author));
    return posts.map((post, i) => ({ ...post, author: authors[i] }));
  }

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
    const opinions = await Debate.getAllOpinionsForDebate(phase.key.toString());
    const debate = await Debate.getDebateById(phase.key);
    return { opinions, prompt: debate.prompt, category: debate.category, curPhase: PHASES[phase.curPhase] };
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

Router.registerError(PostAuthorNotMatchError, async (e) => {
  const username = (await User.getUserById(e.author)).username;
  return e.formatWith(username, e._id);
});

Router.registerError(KeyExistsError, async (e) => {
  // const debateObj = await Debate.getDebateById(e.key);
  // const promptFormatted = '\"' + debate.prompt + '\"';
  // return e.formatWith(promptFormatted);
  return e; // DELETE ME
});

Router.registerError(NoPhaseError, async (e) => {
  // const debateObj = await Debate.getDebateById(e.key);
  // const promptFormatted = '\"' + debate.prompt + '\"';
  // return e.formatWith(promptFormatted);
  return e; // DELETE ME
});
