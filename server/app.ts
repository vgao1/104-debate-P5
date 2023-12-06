import PostConcept from "./concepts/post";
import UserConcept from "./concepts/user";
import WebSessionConcept from "./concepts/websession";
import PhaseConcept from "./concepts/phase";
import DebateConcept from "./concepts/debate";

// App Definition using concepts
export const WebSession = new WebSessionConcept();
export const User = new UserConcept();
export const Post = new PostConcept();
export const Phase = new PhaseConcept();
export const Debate = new DebateConcept();
