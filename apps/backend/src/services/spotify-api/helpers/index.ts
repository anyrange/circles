import { splitArrayOnChunks } from "@circles/utils";
import type {
  CodeOptions,
  RefreshTokenOptions,
  Tokens,
  TokensError,
} from "../../../types";
import { api } from "../../../config";

export async function makeBatchedRequest<
  // eslint-disable-next-line no-unused-vars
  F extends (ids: string[]) => ReturnType<F>,
>(fn: F, ids: string[], chunkSize = api.API_DEFAULT_CAPACITY) {
  if (!ids.length) {
    return [];
  }

  const results = await Promise.all(
    splitArrayOnChunks(ids, chunkSize).map((chunk) => fn(chunk)),
  );

  return results.flat(1);
}

export function createParams(data: CodeOptions | RefreshTokenOptions) {
  const params = new URLSearchParams();

  if (isCodeOptions(data)) {
    params.append("grant_type", "authorization_code");
    params.append("code", data.code);
    params.append("redirect_uri", `${data.redirectURI}`);
  } else {
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", data.refresh_token);
  }

  return params;
}

export function isError(data: Tokens | TokensError): data is TokensError {
  return (data as TokensError).error !== undefined;
}

export function isCodeOptions(
  data: CodeOptions | RefreshTokenOptions,
): data is CodeOptions {
  return (data as CodeOptions).code !== undefined;
}
