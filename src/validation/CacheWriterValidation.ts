import { PlayerError, ErrorMessages } from "./PlayerError"
import { Resource } from "../util/Resource"
import { Cache } from "../cache/Cache"

export function validateResource(resource: Resource): void {
  if (typeof resource !== "object" || resource === null) throw new PlayerError(ErrorMessages.Expecting("object", "CacheWriter.resource", resource === null ? "null" : typeof resource))
  else if (!(resource instanceof Resource)) throw new PlayerError(ErrorMessages.Expecting("Resource", "CacheManager.resource", resource))
}

export function validateCache(cache: Cache): void {
  if (typeof cache !== "object" || cache === null) throw new PlayerError(ErrorMessages.Expecting("object", "CacheWriter.resource.cache", cache === null ? "null" : typeof cache))
  else if (!(cache instanceof Cache)) throw new PlayerError(ErrorMessages.Expecting("Cache", "CacheManager.resource.cache", cache))
}