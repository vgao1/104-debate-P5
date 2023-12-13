import { Filter, ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError } from "./errors";

export interface ReviewDoc extends BaseDoc {
  reviewer: string;
  debate: string;
  opinion: string;
  score: number;
}

export interface ScoreDoc extends BaseDoc {
  debate: string;
  opinion: string;
  totalScore: number;
}

export default class ReviewConcept {
  public readonly reviews = new DocCollection<ReviewDoc>("reviews");
  public readonly scores = new DocCollection<ScoreDoc>("scores");

  async create(reviewer: string, debate: string, opinion: string, score: number) {
    const existingReview = await this.reviews.readOne({ reviewer, debate, opinion });
    if (existingReview) {
      await this.reviews.updateOne({ reviewer, debate, opinion }, { reviewer, debate, opinion, score });
      return { msg: "Review successfully updated!" };
    } else {
      await this.reviews.createOne({ reviewer, debate, opinion, score });
      return { msg: "Review successfully created!" };
    }
  }

  async getReviews(query: Filter<ReviewDoc>) {
    const reviews = await this.reviews.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    return reviews;
  }

  async getByOpinion(opinion: ObjectId) {
    const reviews = await this.reviews.readMany({ opinion: opinion.toString() }, { sort: { score: -1 } });
    return reviews;
  }

  async getInfoByIds(opinions: ObjectId[]) {
    const _ids: string[] = [];
    const scores: number[] = [];
    for (const op of opinions) {
      const reviews = await this.reviews.readMany({ opinion: op.toString() }, { sort: { score: -1 } });
      for (const review of reviews) {
        _ids.push(review.opinion);
        scores.push(review.score);
      }
    }
    return [_ids, scores];
  }

  async getByAuthor(reviewer: string) {
    return await this.getReviews({ reviewer });
  }

  async isReviewer(_id: ObjectId, user: string) {
    const reviewObj = await this.reviews.readOne({ _id, reviewer: user });
    if (reviewObj) {
      return true;
    } else {
      throw new NotAllowedError("You cannot edit other people's reviews!");
    }
  }

  async update(_id: ObjectId, update: Partial<ReviewDoc>) {
    await this.reviews.updateOne({ _id }, update);
    return { msg: "Review successfully updated!" };
  }

  async delete(_id: ObjectId) {
    await this.reviews.deleteOne({ _id });
    return { msg: "Review deleted successfully!" };
  }

  async deleteByReviewer(reviewer: string, debate: string) {
    await this.reviews.deleteMany({ reviewer, debate });
  }

  async getScoreByReviewer(reviewer: string, debate: string, opinion: string) {
    const existingReview = await this.reviews.readOne({ reviewer, debate, opinion });
    if (existingReview) {
      return existingReview.score;
    } else {
      return 50;
    }
  }

  async getReviewsByOpinion(debate: string, opinion: string) {
    const reviewsForOpinion = await this.reviews.readMany({ debate, opinion });
    return reviewsForOpinion;
  }

  async uploadTotalScore(debate: string, opinion: string, score: number) {
    const isScoreComputed = await this.scores.readOne({ debate, opinion });
    if (!isScoreComputed) {
      await this.scores.createOne({ debate, opinion, totalScore: score });
      return { score };
    } else {
      return { score };
    }
  }

  async getDeltaForOpinion(debate: string, opinion: string) {
    const existingScore = await this.scores.readOne({ debate, opinion });
    if (existingScore) {
      return existingScore.totalScore;
    } else {
      return 0;
    }
  }

  async getUserDelta(opinions: Array<string>) {
    let score = 0;
    for (const opinion of opinions) {
      const scoreObj = await this.scores.readOne({ opinion });
      if (scoreObj) {
        score += scoreObj.totalScore;
      }
    }
    return score + " deltas";
  }
}

export class ReviewAuthorNotMatchError extends NotAllowedError {
  constructor(
    public readonly reviewer: string,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the reviewer of review {1}!", reviewer, _id);
  }
}
