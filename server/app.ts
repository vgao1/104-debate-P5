import DebateConcept from "./concepts/debate";
import PhaseConcept from "./concepts/phase";
import ReviewConcept from "./concepts/review";
import UserConcept from "./concepts/user";
import WebSessionConcept from "./concepts/websession";

// App Definition using concepts
export const WebSession = new WebSessionConcept();
export const User = new UserConcept();
export const Phase = new PhaseConcept();
export const Debate = new DebateConcept();
export const Review = new ReviewConcept();
