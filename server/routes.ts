import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Debate, Phase, Post, Review, User, WebSession } from "./app";
import { PostDoc, PostOptions } from "./concepts/post";
import { ReviewDoc } from "./concepts/review";
import { UserDoc } from "./concepts/user";
import { WebSessionDoc } from "./concepts/websession";
import Responses from "./responses";

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

  ////////////////////////// POSTS //////////////////////////

  @Router.get("/posts")
  async getPosts(author?: string) {
    let posts;
    if (author) {
      const id = (await User.getUserByUsername(author))._id;
      posts = await Post.getByAuthor(id);
    } else {
      posts = await Post.getPosts({});
    }
    return Responses.posts(posts);
  }

  @Router.post("/posts")
  async createPost(session: WebSessionDoc, content: string, options?: PostOptions) {
    const user = WebSession.getUser(session);
    const created = await Post.create(user, content, options);
    return { msg: created.msg, post: await Responses.post(created.post) };
  }

  @Router.patch("/posts/:_id")
  async updatePost(session: WebSessionDoc, _id: ObjectId, update: Partial<PostDoc>) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return await Post.update(_id, update);
  }

  @Router.delete("/posts/:_id")
  async deletePost(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return Post.delete(_id);
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

  @Router.post("/opinion/submitReview")
  async submitReview(session: WebSessionDoc, opinion: ObjectId, score: number) {
    const user = WebSession.getUser(session);
    return await (Review.create(user.toString(), opinion.toString(), score));
  }

  @Router.patch("/reviews/:_id")
  async updateReview(session: WebSessionDoc, _id: ObjectId, update: Partial<ReviewDoc>) {
    const user = WebSession.getUser(session);
    await Review.isReviewer(_id, user.toString())
    return await Review.update(_id, update);
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
  async submitOpinion(session: WebSessionDoc, debate: ObjectId, content: string, likertScale: string) {
    const user = WebSession.getUser(session);
    const completed = await Phase.expireOld();
    await Debate.deleteMatchesForDebate(completed);
    await Phase.getPhaseByKey(new ObjectId(debate)); // checks if debate is active
    return await Debate.addOpinion(debate, user.toString(), content, likertScale);
  }

  @Router.get("/debate/matchOpinions")
  async matchParticipantToDifferentOpinions(debate: ObjectId) {
    const completed = await Phase.expireOld();
    await Debate.deleteMatchesForDebate(completed);
    await Phase.getPhaseByKey(debate); // checks if debate is active
    return await Debate.matchParticipantToDifferentOpinions(debate);
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
