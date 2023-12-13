import { ObjectId } from "mongodb";
import { Router, getExpressRouter } from "./framework/router";
import { Debate, Phase, Review, User, WebSession } from "./app";
import { ReviewDoc } from "./concepts/review";
import { UserDoc } from "./concepts/user";
import { WebSessionDoc } from "./concepts/websession";
import Responses from "./responses";
import { NotAllowedError } from "./concepts/errors";

class Routes {
  ////////////////////////// SESSION //////////////////////////

  @Router.get("/session")
  async getSessionUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.getUserById(user);
  }

  @Router.post("/login")
  async logIn(session: WebSessionDoc, username: string, password: string) {
    const u = await User.authenticate(username, password);
    WebSession.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: WebSessionDoc) {
    WebSession.end(session);
    return { msg: "Logged out!" };
  }

  ////////////////////////// USER //////////////////////////

  @Router.get("/users")
  async getUsers() {
    return await User.getUsers();
  }

  @Router.get("/users/:username")
  async getUser(username: string) {
    return await User.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: WebSessionDoc, username: string, password: string) {
    WebSession.isLoggedOut(session);
    return await User.create(username, password);
  }

  @Router.patch("/users")
  async updateUser(session: WebSessionDoc, update: Partial<UserDoc>) {
    const user = WebSession.getUser(session);
    return await User.update(user, update);
  }

  @Router.delete("/users")
  async deleteUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    WebSession.end(session);
    return await User.delete(user);
  }

  @Router.get("/userDeltas")
  async getUserDelta(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    const opinions = await Debate.getUserOpinons(user.toString());
    return await Review.getUserDelta(opinions);
  }
  ////////////////////////// PHASES //////////////////////////

  @Router.get("/activeDebates")
  async getActiveDebates() {
    const completed = await Phase.expireOld();
    await Debate.deleteMatchesForDebate(completed);
    return await Responses.phases(await Phase.getActive());
  }

  @Router.get("/activeDebates/:debateID")
  async getActiveDebateById(debateID: ObjectId) {
    const completed = await Phase.expireOld();
    await Debate.deleteMatchesForDebate(completed);
    return await Responses.phase(await Phase.getPhaseByKey(new ObjectId(debateID)));
  }

  @Router.get("/historyDebates")
  async getExpiredDebates() {
    const completed = await Phase.expireOld();
    await Debate.deleteMatchesForDebate(completed);
    return await Responses.phases(await Phase.getHistory());
  }

  @Router.get("/historyDebates/:debateID")
  async getExpiredDebateById(debateID: ObjectId) {
    const completed = await Phase.expireOld();
    await Debate.deleteMatchesForDebate(completed);
    return await Responses.opinions(await Phase.getExpiredByKey(new ObjectId(debateID)));
  }

  @Router.patch("/debate/changeDeadline")
  async editActiveDebateDeadline(debateID: ObjectId, newDeadline: Date) {
    const completed = await Phase.expireOld();
    await Debate.deleteMatchesForDebate(completed);
    return await Phase.editDeadline(new ObjectId(debateID), new Date(newDeadline));
  }

  @Router.patch("/phase/numPrompts")
  changeNumPromptsPerDay(newVal: number) {
    return Phase.changeNumPromptsPerDay(newVal);
  }

  @Router.patch("/phase/extension")
  changeDeadlineExtension(newVal: number) {
    return Phase.changeDeadlineExtension(newVal);
  }

  @Router.post("/phase/maxPhase")
  changeMaxPhase(newMax: number) {
    return Phase.changeMaxPhase(newMax);
  }

  ////////////////////////// REVIEW + OPINION SYNCS //////////////////////////

  @Router.get("/reviews/deltas/:debateID")
  async getDeltasForDebate(debateID: ObjectId) {
    const opIDs = await Debate.getOriginalOpinionsByDebate(new ObjectId(debateID));
    const [_ids, scores] = await Review.getInfoByIds(opIDs);
    return await Debate.getScoreForOpinions(_ids as string[], scores as number[]);
  }

  @Router.get("/reviews/delta")
  async getComputedScore(debateID: string, opinion: string) {
    return await Review.getDeltaForOpinion(debateID, opinion);
  }

  @Router.post("/opinion/submitReview")
  async submitReview(session: WebSessionDoc, debateId: string, opinion: ObjectId, score: number) {
    const user = WebSession.getUser(session);
    return await Review.create(user.toString(), debateId, opinion.toString(), score);
  }

  @Router.patch("/reviews/:_id")
  async updateReview(session: WebSessionDoc, _id: ObjectId, update: Partial<ReviewDoc>, debateId: string) {
    const user = WebSession.getUser(session);
    try {
      const inReviewPhase = (await Phase.getPhaseByKey(new ObjectId(debateId)))?.curPhase === 1;
      if (inReviewPhase) {
        await Review.isReviewer(_id, user.toString());
        return await Review.update(_id, update);
      } else {
        return { msg: "This review's debate is not in the Review phase." };
      }
    } catch (e) {
      return e;
    }
  }

  @Router.delete("/reviews/:debateID")
  async deleteReviews(session: WebSessionDoc, debateID: string) {
    const user = WebSession.getUser(session);
    return await Review.deleteByReviewer(user.toString(), debateID);
  }

  @Router.get("/review/score/")
  async getScoreForReview(session: WebSessionDoc, debateID: string, opinion: string) {
    const user = WebSession.getUser(session);
    return await Review.getScoreByReviewer(user.toString(), debateID, opinion);
  }
  ////////////////////////// DEBATE + SYNCS //////////////////////////

  @Router.post("/debate/newPrompt")
  async suggestPrompt(prompt: string, category: string) {
    const completed = await Phase.expireOld();
    await Debate.deleteMatchesForDebate(completed);
    const response = await Debate.suggestPrompt(prompt, category);
    if (response) {
      await Phase.initialize(response.debateId);
      return { msg: response.msg };
    }
  }

  @Router.post("/debate/submitOpinion")
  async submitOpinion(session: WebSessionDoc, debate: ObjectId, content: string, likertScale: number) {
    const user = WebSession.getUser(session);
    const completed = await Phase.expireOld();
    await Debate.deleteMatchesForDebate(completed);
    await Phase.getPhaseByKey(new ObjectId(debate)); // checks if debate is active
    const resp = await Debate.addOpinion(debate, user.toString(), content, likertScale);
    return resp;
  }

  @Router.post("/debate/submitRevisedOpinion")
  async submitRevisedOpinion(session: WebSessionDoc, debate: ObjectId, content: string, likertScale: number) {
    const user = WebSession.getUser(session);
    const completed = await Phase.expireOld();
    await Debate.deleteMatchesForDebate(completed);
    await Phase.getPhaseByKey(new ObjectId(debate)); // checks if debate is active
    return await Debate.addRevisedOpinion(debate, user.toString(), content, likertScale);
  }

  @Router.post("/debate/matchOpinions")
  async matchParticipantToDifferentOpinions(session: WebSessionDoc, debate: string) {
    const user = WebSession.getUser(session);
    const completed = await Phase.expireOld();
    await Debate.deleteMatchesForDebate(completed);
    await Phase.getPhaseByKey(new ObjectId(debate)); // checks if debate is active
    try {
      const opinnionMatches = await Debate.matchParticipantToDifferentOpinions(debate, user.toString());
      return await Responses.opinionContents(opinnionMatches);
    } catch {
      throw new NotAllowedError("You can't review opinions of this debate because you didn't submit an opinion responding to this debate's prompt in Phase I (Opinions)");
    }
  }

  @Router.post("/debate/removeMatchedOpinion")
  async removeMatchedOpinion(session: WebSessionDoc, debate: string, opinionId: string) {
    const user = WebSession.getUser(session);
    const completed = await Phase.expireOld();
    await Debate.deleteMatchesForDebate(completed);
    return await Debate.removeDifferentOpinion(debate, user.toString(), opinionId);
  }

  @Router.get("/debate/getMyOpinion/:debateID")
  async getMyOpinionForDebate(session: WebSessionDoc, debateID: string) {
    const user = WebSession.getUser(session);
    return await Debate.getOpinionForDebateByAuthor(debateID, user.toString());
  }

  @Router.get("/debate/getMyRevisedOpinion/:debateID")
  async getMyRevisedOpinionForDebate(session: WebSessionDoc, debateID: string) {
    const user = WebSession.getUser(session);
    return await Debate.getRevisedOpinionForDebateByAuthor(debateID, user.toString());
  }

  @Router.delete("/debate/deleteMyOpinion/:debateID")
  async deleteMyOpinionForDebate(session: WebSessionDoc, debateID: ObjectId) {
    const user = WebSession.getUser(session);
    return await Debate.deleteOneOpinion(debateID, user.toString());
  }

  @Router.delete("/debate")
  async deleteDebate(debateID: ObjectId) {
    const completed = await Phase.expireOld();
    await Debate.deleteMatchesForDebate(completed);
    await Phase.delete(new ObjectId(debateID));
    return await Debate.delete(new ObjectId(debateID));
  }
}

export default getExpressRouter(new Routes());
