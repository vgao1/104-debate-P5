import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Debate, Phase, Review, User, WebSession } from "./app";
import { ReviewDoc } from "./concepts/review";
import { UserDoc } from "./concepts/user";
import { WebSessionDoc } from "./concepts/websession";
import Responses from "./responses";

const debateTopics = [
  ["Is space exploration worth the cost?", "Economics"],
  ["AI: Boon or Bane for Society?", "Technology Ethics"],
  ["Should Schools Ban Junk Food?", "Education Policy"],
  ["Is a plant-based diet better for health?", "Health and Nutrition"],
  ["Should artificial intelligence be granted legal personhood rights?", "Technology Ethics"],
  ["Is the pursuit of happiness a valid life goal, or does it lead to selfishness?", "Philosophy"],
  ["Do video games have a positive or negative impact on cognitive development in children?", "Education"],
  ["Is privacy a fundamental right, or should national security take precedence?", "Civil Liberties"],
  ["Should space exploration be prioritized over addressing global issues on Earth?", "Science and Exploration"],
  ["Is a cashless society a more secure and efficient economic model?", "Economics"],
  ["Should genetically modified organisms (GMOs) be embraced for their potential benefits or feared for potential risks?", "Biology and Agriculture"],
  ["Is the concept of 'free will' an illusion, given the influence of genetics and environment?", "Psychology"],
  ["Is a universal basic income a viable solution to address the challenges of automation and unemployment?", "Social Policy"],
  ["Is it ethical to use CRISPR technology to edit the genes of unborn children for desirable traits?", "Bioethics"],
  ["Is the rise of social media contributing to increased polarization and division in society?", "Media and Society"],
  ["Should the government have the authority to regulate the content and algorithms of social media platforms?", "Government Regulation"],
  ["Is it morally justifiable to use animals for scientific experimentation to advance human knowledge?", "Animal Rights"],
  ["Should cultural appropriation be condemned as an act of disrespect or embraced as a form of cultural exchange?", "Cultural Sensitivity"],
  ["Is the concept of 'work-life balance' achievable, or is it an unrealistic expectation in modern society?", "Workplace Dynamics"],
  ["Should voting be mandatory in democratic societies to ensure civic participation?", "Political Participation"],
  ["Is the pursuit of economic growth compatible with environmental sustainability?", "Environmental Policy"],
  ["Should individuals have the right to sell their own organs, or does this commodify the human body?", "Medical Ethics"],
  ["Is the concept of national borders becoming obsolete in an increasingly interconnected world?", "Globalization"],
  ["Should public schools prioritize teaching practical skills over traditional academic subjects?", "Education Reform"],
  ["Is the advancement of technology widening or narrowing the wealth gap in society?", "Technological Inequality"],
  ["Should the government provide financial incentives for businesses to adopt environmentally friendly practices?", "Green Economics"],
  ["Is the concept of 'cancel culture' an effective tool for holding individuals accountable or a threat to free speech?", "Social Media and Accountability"],
  ["Should there be limits on the use of artificial intelligence in law enforcement to prevent bias and discrimination?", "AI in Criminal Justice"],
  ["Is the portrayal of mental health in media helping to reduce stigma or perpetuating harmful stereotypes?", "Mental Health Awareness"],
  ["Should public universities be free to attend to ensure equal access to higher education?", "Higher Education Policy"],
  ["Is the rise of automation and AI a threat to traditional employment or an opportunity for new and innovative jobs?", "Future of Work"],
  ["Should the international community prioritize space exploration as a collaborative effort for the benefit of all humanity?", "International Space Cooperation"],
  ["Is the use of social media by political leaders a positive tool for communication or a potential risk to democracy?", "Politics in the Digital Age"],
  ["Should governments invest more in preventative healthcare measures rather than treating illnesses reactively?", "Public Health Policy"],
  ["Is it ethical to use gene editing technologies to enhance physical and cognitive abilities in humans?", "Genetic Enhancement"],
  ["Should cultural institutions return artifacts taken during colonial periods to their countries of origin?", "Cultural Repatriation"],
  ["Is the concept of a global currency a feasible solution to economic instability and currency fluctuations?", "Global Economics"],
  ["Should there be limits on the use of facial recognition technology in public spaces to protect individual privacy?", "Surveillance Ethics"],
  ["Is the concept of meritocracy a fair and achievable goal, or does it perpetuate inequality?", "Social Equality"],
  ["Should public schools incorporate mindfulness and meditation into their curriculum to promote mental well-being?", "Education and Mental Health"],
  ["Is there a moral obligation for individuals in developed countries to address global poverty and inequality?", "Global Citizenship"],
  ["Should governments invest more in space exploration or focus on addressing urgent issues on Earth?", "Space vs. Earth Priorities"],
  ["Is the concept of 'cultural relativism' a valid approach to understanding and respecting diverse societies?", "Cultural Anthropology"],
  ["Should there be limits on the use of artificial intelligence in creative fields, such as art and music?", "AI in the Arts"],
  ["Is the concept of intellectual property hindering or fostering innovation in the digital age?", "Intellectual Property Rights"],
  ["Should there be restrictions on the use of technology to enhance human physical abilities, such as exoskeletons and implants?", "Human Augmentation"],
  ["Is the emphasis on standardized testing in education an effective measure of student learning or an outdated approach?", "Education Assessment"],
  ["Should governments implement a shorter workweek to promote work-life balance and reduce burnout?", "Workplace Policies"],
  ["Is the use of blockchain technology in voting systems a secure and reliable way to prevent electoral fraud?", "Election Technology"],
  ["Should social media platforms be held responsible for the spread of misinformation and fake news?", "Social Media Accountability"],
  ["Is the idea of a universal basic income compatible with the principles of capitalism, or does it undermine the system?", "Economic Systems"],
  ["Should there be a global effort to regulate and limit the development of autonomous weapons?", "Ethics of Autonomous Weapons"],
  ["Is it ethical to use virtual reality for therapeutic purposes, such as treating phobias and PTSD?", "VR Therapy"],
  ["Should there be a legal framework for the ethical treatment of artificial intelligence entities?", "AI Rights"],
  ["Is the use of non-lethal force, such as tasers and rubber bullets, justifiable in crowd control situations?", "Law Enforcement Tactics"],
  ["Should space exploration focus on colonizing other planets as a backup for humanity, or prioritize preserving Earth?", "Interplanetary Settlement"],
  ["Is there a moral obligation for individuals to adopt a vegan lifestyle to address environmental and ethical concerns?", "Ethics of Veganism"],
  ["Should there be limitations on the use of algorithms in hiring processes to prevent discrimination?", "Algorithmic Hiring"],
  ["Is the concept of a 'right to be forgotten' in the digital age a necessary protection or a form of censorship?", "Digital Privacy"],
  ["Should governments invest in geoengineering projects to address climate change, or focus on reducing emissions?", "Climate Intervention"],
  ["Is the use of body cameras by law enforcement officers an effective tool for accountability or an invasion of privacy?", "Police Accountability"],
  ["Should there be age restrictions on the use of social media to protect the well-being of minors?", "Children and Social Media"],
  ["Is the concept of 'cultural assimilation' a positive or negative force in fostering social cohesion?", "Cultural Integration"],
];

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

  @Router.post("/opinion/submitReview")
  async submitReview(session: WebSessionDoc, opinion: ObjectId, score: number) {
    const user = WebSession.getUser(session);
    return await Review.create(user.toString(), opinion.toString(), score);
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

  ////////////////////////TESTER///////////////////

  @Router.get("/debate/testerPrompts")
  async addTesterPrompts() {
    for (const [prompt, category] of debateTopics) {
      const response = await Debate.suggestPrompt(prompt, category);
      if (response) {
        await Phase.initialize(response.debateId);
        console.log("The following prompt was added: ", prompt);
      }
      console.log("Done!");
    }
  }
}

export default getExpressRouter(new Routes());
