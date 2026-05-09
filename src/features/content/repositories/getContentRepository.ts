import { githubContentRepository } from "./githubContentRepository";
import { localContentRepository } from "./localContentRepository";

export function getContentRepository() {
  if (process.env.CONTENT_BACKEND === "github") {
    return githubContentRepository;
  }

  return localContentRepository;
}
