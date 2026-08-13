import assert from "node:assert/strict";
import { test } from "node:test";
import { POST } from "../../app/(en)/api/subscribe/route.ts";

let requestNumber = 0;

function subscribeRequest(email = "reader@example.com") {
  requestNumber += 1;
  return new Request("http://localhost/api/subscribe", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-real-ip": `192.0.2.${requestNumber}`,
    },
    body: JSON.stringify({
      email,
      consent: true,
      token: "valid-test-token",
      website: "",
      source: "subscribe-page",
      firstName: "Alex",
      lastName: "",
      lang: "en",
    }),
  });
}

function configureTestEnvironment(t) {
  const names = [
    "RECAPTCHA_SECRET_KEY",
    "MAILCHIMP_API_KEY",
    "MAILCHIMP_AUDIENCE_ID_EN",
    "MAILCHIMP_AUDIENCE_ID_HR",
    "MAILCHIMP_DOUBLE_OPTIN",
  ];
  const original = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  process.env.RECAPTCHA_SECRET_KEY = "recaptcha-test-secret";
  process.env.MAILCHIMP_API_KEY = "mailchimp-test-key-us1";
  process.env.MAILCHIMP_AUDIENCE_ID_EN = "audience-en";
  process.env.MAILCHIMP_AUDIENCE_ID_HR = "audience-hr";
  delete process.env.MAILCHIMP_DOUBLE_OPTIN;

  t.after(() => {
    for (const name of names) {
      if (original[name] === undefined) delete process.env[name];
      else process.env[name] = original[name];
    }
  });
}

function mockMailchimp(t, existingStatus = null) {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const url = String(input);
    const method = init.method ?? "GET";
    if (url.includes("google.com/recaptcha")) {
      return Response.json({ success: true });
    }

    calls.push({ url, method, body: init.body });
    if (method === "GET") {
      return existingStatus === null
        ? new Response(null, { status: 404 })
        : Response.json({ status: existingStatus });
    }
    if (method === "PUT") {
      const body = JSON.parse(String(init.body));
      return Response.json({ status: body.status ?? existingStatus ?? body.status_if_new });
    }
    if (url.endsWith("/tags")) return new Response(null, { status: 204 });
    throw new Error(`Unexpected request: ${method} ${url}`);
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  return calls;
}

function silenceExpectedLogs(t) {
  t.mock.method(console, "info", () => {});
  t.mock.method(console, "warn", () => {});
  t.mock.method(console, "error", () => {});
}

test("a new address receives the confirmation-sent outcome", async (t) => {
  configureTestEnvironment(t);
  silenceExpectedLogs(t);
  const calls = mockMailchimp(t);

  const res = await POST(subscribeRequest());
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { success: true, code: "confirmation_sent" });
  assert.deepEqual(calls.map(({ method }) => method), ["GET", "PUT", "POST"]);
});

test("an existing pending address gets an accurate notice outcome", async (t) => {
  configureTestEnvironment(t);
  silenceExpectedLogs(t);
  const calls = mockMailchimp(t, "pending");

  const res = await POST(subscribeRequest());
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { success: true, code: "confirmation_pending" });
  const putBody = JSON.parse(String(calls.find(({ method }) => method === "PUT")?.body));
  assert.equal(putBody.status, undefined);
});

test("an existing subscribed address does not get a check-inbox redirect", async (t) => {
  configureTestEnvironment(t);
  silenceExpectedLogs(t);
  mockMailchimp(t, "subscribed");

  const res = await POST(subscribeRequest());
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { success: true, code: "already_subscribed" });
});

test("an unsubscribed address re-enters double opt-in", async (t) => {
  configureTestEnvironment(t);
  silenceExpectedLogs(t);
  const calls = mockMailchimp(t, "unsubscribed");

  const res = await POST(subscribeRequest());
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { success: true, code: "confirmation_sent" });
  const putBody = JSON.parse(String(calls.find(({ method }) => method === "PUT")?.body));
  assert.equal(putBody.status, "pending");
});

test("a cleaned address fails visibly", async (t) => {
  configureTestEnvironment(t);
  silenceExpectedLogs(t);
  const calls = mockMailchimp(t, "cleaned");

  const res = await POST(subscribeRequest());
  assert.equal(res.status, 409);
  assert.deepEqual(await res.json(), { error: "Subscription failed", code: "address_unavailable" });
  assert.deepEqual(calls.map(({ method }) => method), ["GET"]);
});

test("missing Mailchimp configuration cannot return success", async (t) => {
  configureTestEnvironment(t);
  silenceExpectedLogs(t);
  delete process.env.MAILCHIMP_API_KEY;
  const calls = mockMailchimp(t);

  const res = await POST(subscribeRequest());
  assert.equal(res.status, 503);
  assert.deepEqual(await res.json(), { error: "Subscription failed", code: "configuration_error" });
  assert.equal(calls.length, 0);
});

test("missing reCAPTCHA configuration cannot return success", async (t) => {
  configureTestEnvironment(t);
  silenceExpectedLogs(t);
  delete process.env.RECAPTCHA_SECRET_KEY;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error("No external request should run without configuration");
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const res = await POST(subscribeRequest());
  assert.equal(res.status, 503);
  assert.deepEqual(await res.json(), {
    error: "Newsletter is temporarily unavailable",
    code: "configuration_error",
  });
});

test("Mailchimp errors are logged without response detail or subscriber data", async (t) => {
  configureTestEnvironment(t);
  const logged = [];
  t.mock.method(console, "error", (...args) => logged.push(args));
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.includes("google.com/recaptcha")) return Response.json({ success: true });
    return Response.json(
      {
        title: "API Key Invalid",
        type: "https://mailchimp.com/developer/marketing/docs/errors/",
        detail: "reader@example.com used mailchimp-test-key-us1",
      },
      { status: 401, headers: { "x-request-id": "safe-request-id" } },
    );
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const res = await POST(subscribeRequest());
  assert.equal(res.status, 502);
  const serializedLogs = JSON.stringify(logged);
  assert.doesNotMatch(serializedLogs, /reader@example\.com/);
  assert.doesNotMatch(serializedLogs, /mailchimp-test-key-us1/);
  assert.match(serializedLogs, /API Key Invalid/);
  assert.match(serializedLogs, /safe-request-id/);
});
