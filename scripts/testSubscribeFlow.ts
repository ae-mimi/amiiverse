import assert from "node:assert/strict";
import {
    getClientIp,
    isValidEmail,
    makeEmailRateKey,
    makeIpRateKey,
    normalizeEmail,
    parseConsent,
    validateSubscribeInput,
} from "../src/lib/server/subscribeFlow.ts";

function run() {
    assert.equal(normalizeEmail("  FAN@Example.COM "), "fan@example.com");
    assert.equal(parseConsent("true"), true);
    assert.equal(parseConsent("on"), true);
    assert.equal(parseConsent("yes"), true);
    assert.equal(parseConsent("1"), true);
    assert.equal(parseConsent("false"), false);
    assert.equal(isValidEmail("hello@example.com"), true);
    assert.equal(isValidEmail("bad-email"), false);
    assert.equal(
        validateSubscribeInput({
            email: "hello@example.com",
            consent: true,
            source: "homepage",
            turnstileToken: "token",
            name: "",
        }),
        null,
    );
    assert.equal(
        validateSubscribeInput({
            email: "bad",
            consent: true,
            source: "",
            turnstileToken: "token",
            name: "",
        }),
        "Please enter a valid email address.",
    );
    assert.equal(
        validateSubscribeInput({
            email: "hello@example.com",
            consent: false,
            source: "",
            turnstileToken: "token",
            name: "",
        }),
        "Consent is required before subscribing.",
    );

    const headers = new Headers({
        "cf-connecting-ip": "1.2.3.4",
    });
    assert.equal(getClientIp(headers), "1.2.3.4");
    assert.equal(
        makeEmailRateKey("fan@example.com"),
        "rl:subscribe:email:fan%40example.com",
    );
    assert.equal(makeIpRateKey("1.2.3.4"), "rl:subscribe:ip:1.2.3.4");
    console.log("subscribeFlow checks passed");
}

run();
