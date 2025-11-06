import { Context } from "@azure/functions";

type Body = unknown;

const asJson = (body: Body): string | null => {
  if (!body) {
    return null;
  }

  if (typeof body === "string") {
    return body;
  }

  return JSON.stringify(body);
};

export const ok = (context: Context, body: Body, extraHeaders: Record<string, string> = {}): void => {
  context.res = {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders
    },
    body: asJson(body)
  };
};

export const created = (context: Context, body: Body): void => {
  context.res = {
    status: 201,
    headers: {
      "Content-Type": "application/json"
    },
    body: asJson(body)
  };
};

export const badRequest = (context: Context, body: Body): void => {
  context.res = {
    status: 400,
    headers: {
      "Content-Type": "application/json"
    },
    body: asJson(body)
  };
};

export const unauthorized = (context: Context, body: Body): void => {
  context.res = {
    status: 401,
    headers: {
      "Content-Type": "application/json"
    },
    body: asJson(body)
  };
};

export const forbidden = (context: Context, body: Body): void => {
  context.res = {
    status: 403,
    headers: {
      "Content-Type": "application/json"
    },
    body: asJson(body)
  };
};

export const notFound = (context: Context, body: Body): void => {
  context.res = {
    status: 404,
    headers: {
      "Content-Type": "application/json"
    },
    body: asJson(body)
  };
};

export const internalError = (context: Context, error: unknown): void => {
  const message = error instanceof Error ? error.message : "Unexpected error";

  context.log.error({ message, error });

  context.res = {
    status: 500,
    headers: {
      "Content-Type": "application/json"
    },
    body: asJson({ message })
  };
};
