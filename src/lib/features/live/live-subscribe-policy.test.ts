import { Track } from "livekit-client";
import { describe, expect, test } from "bun:test";
import { shouldApplySimulcastQuality } from "./live-track-source";
import {
  buildSessionSubscribePolicy,
  shouldSubscribeToRemoteParticipant,
} from "./live-subscribe-policy";

describe("shouldApplySimulcastQuality", () => {
  test("skips screen share publications", () => {
    expect(shouldApplySimulcastQuality({ source: Track.Source.ScreenShare })).toBe(false);
    expect(shouldApplySimulcastQuality({ source: Track.Source.Camera })).toBe(true);
  });
});

describe("shouldSubscribeToRemoteParticipant", () => {
  const memberPolicy = buildSessionSubscribePolicy({
    isInstructorRoom: false,
    selectedResolution: "720p",
    joinAccess: null,
    instructorUserId: "host123",
  });

  test("members subscribe to instructor identity prefix", () => {
    expect(shouldSubscribeToRemoteParticipant(memberPolicy, "instructor_host123")).toBe(true);
    expect(shouldSubscribeToRemoteParticipant(memberPolicy, "admin_other")).toBe(true);
  });

  test("members subscribe to class host user id even with customer prefix", () => {
    expect(shouldSubscribeToRemoteParticipant(memberPolicy, "customer_host123")).toBe(true);
  });

  test("members do not subscribe to other customers", () => {
    expect(shouldSubscribeToRemoteParticipant(memberPolicy, "customer_other456")).toBe(false);
  });

  test("instructor room subscribes to everyone", () => {
    const hostPolicy = buildSessionSubscribePolicy({
      isInstructorRoom: true,
      selectedResolution: "1080p",
      joinAccess: null,
      instructorUserId: "host123",
    });
    expect(shouldSubscribeToRemoteParticipant(hostPolicy, "customer_other456")).toBe(true);
  });
});
