import { Filter, ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError } from "./errors";

export interface ReviewDoc extends BaseDoc {
  reviewer: string;
  opinion: string;
  score: number;
}

export default class ReviewConcept {
  public readonly reviews = new DocCollection<ReviewDoc>("reviews");

  async create(reviewer: string, opinion: string, score: number) {
    const _id = await this.reviews.createOne({ reviewer, opinion, score });
    return { msg: "Review successfully created!", review: await this.reviews.readOne({ _id }) };
  }

  async getReviews(query: Filter<ReviewDoc>) {
    const reviews = await this.reviews.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    return reviews;
  }

  async getByOpinion(opinion: ObjectId) {
    const reviews = await this.reviews.readMany(
      { opinion: opinion.toString()},
      { sort: { score : -1 } }
      );
    return reviews;
  }

  async getByAuthor(reviewer: string) {
    return await this.getReviews({ reviewer });
  }

  async update(_id: ObjectId, update: Partial<ReviewDoc>) {
    await this.reviews.updateOne({ _id }, update);
    return { msg: "Review successfully updated!" };
  }

  async delete(_id: ObjectId) {
    await this.reviews.deleteOne({ _id });
    return { msg: "Review deleted successfully!" };
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
