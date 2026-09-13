"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { gameQueryKey, useGameQuery } from "@/lib/query/game-query";
import { playerService, preferenceService } from "@/services";
import { useUiStore } from "@/stores/ui-store";
import type { UserPreferences } from "@/types/domain";

export function SettingsView() {
  const client = useQueryClient();
  const { data: game } = useGameQuery();
  const {
    graphics,
    setGraphics,
    sound,
    setSound,
    reducedMotion,
    setReducedMotion,
    highContrast,
    setHighContrast,
  } = useUiStore();
  const [online, setOnline] = useState(true);
  const [name, setName] = useState(game.player.name);

  const updateName = useMutation({
    mutationFn: () => playerService.updateName(name.trim()),
    onSuccess: (snapshot) => {
      client.setQueryData(gameQueryKey, snapshot);
      toast.success("Player name saved.");
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : "Name could not be saved.",
      ),
  });
  const updatePreferences = useMutation({
    mutationFn: (change: Partial<UserPreferences>) =>
      preferenceService.update(change),
    onError: (error) =>
      toast.error(
        error instanceof Error
          ? error.message
          : "Preference could not be saved.",
      ),
  });

  useEffect(() => {
    let active = true;
    void preferenceService
      .get()
      .then((preferences) => {
        if (!active) return;
        setReducedMotion(preferences.reducedMotion);
        setHighContrast(preferences.highContrast);
        setSound(preferences.sound);
        setGraphics(preferences.graphics);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [setGraphics, setHighContrast, setReducedMotion, setSound]);

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  const save = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K],
    apply: (next: UserPreferences[K]) => void,
  ) => {
    apply(value);
    updatePreferences.mutate({ [key]: value } as Pick<UserPreferences, K>);
  };

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Settings</span>
          <h1>Shape the experience around you.</h1>
          <p>
            Preferences save to your account and stay available across devices.
          </p>
        </div>
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <h2>Accessibility & atmosphere</h2>
          <div className="settings-list">
            <Setting
              title="Reduce motion"
              copy="Stops ScrollTrigger, Flip, particles, camera movement, and XP travel."
              value={reducedMotion}
              set={(value) => save("reducedMotion", value, setReducedMotion)}
            />
            <Setting
              title="High-contrast surfaces"
              copy="Strengthens borders and muted text separation across the app."
              value={highContrast}
              set={(value) => save("highContrast", value, setHighContrast)}
            />
            <Setting
              title="Sound effects"
              copy="Muted by default. Cynova never autoplays audio."
              value={sound}
              set={(value) => save("sound", value, setSound)}
            />
            <Setting
              title="Enhanced graphics"
              copy="Switch between procedural WebGL and the CSS Nova Core fallback."
              value={graphics === "high"}
              set={(value) =>
                save("graphics", value ? "high" : "low", setGraphics)
              }
            />
          </div>
          <p className="green settings-saved" role="status">
            {updatePreferences.isPending
              ? "Saving preference…"
              : "Preferences are synced."}
          </p>
        </section>
        <aside className="dashboard-stack">
          <section className="panel">
            <h2>Profile</h2>
            <div className="field profile-field">
              <label htmlFor="profile-name">Player name</label>
              <input
                id="profile-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={40}
              />
              {name.trim().length < 2 && (
                <span className="field-error">Use at least 2 characters.</span>
              )}
            </div>
            <div className="field profile-field">
              <label htmlFor="profile-email">Email</label>
              <input
                id="profile-email"
                value={game.user?.email ?? "Not signed in"}
                readOnly
              />
            </div>
            <Button
              onClick={() => updateName.mutate()}
              disabled={
                name.trim().length < 2 ||
                updateName.isPending ||
                name.trim() === game.player.name
              }
            >
              {updateName.isPending ? "Saving…" : "Save profile"}
            </Button>
          </section>
          <section className="panel">
            <h2>Service status</h2>
            <p className={online ? "green" : "ember"}>
              {online
                ? "Online and connected"
                : "Offline, changes cannot be submitted"}
            </p>
            <p className="muted">
              Account data is loaded through the versioned Cynova API.
            </p>
          </section>
        </aside>
      </div>
      {!online && (
        <div className="offline" role="status">
          You are offline
        </div>
      )}
    </>
  );
}

function Setting({
  title,
  copy,
  value,
  set,
}: {
  title: string;
  copy: string;
  value: boolean;
  set: (value: boolean) => void;
}) {
  return (
    <div className="setting-row">
      <div>
        <strong>{title}</strong>
        <p>{copy}</p>
      </div>
      <button
        className={`switch ${value ? "on" : ""}`}
        role="switch"
        aria-checked={value}
        aria-label={title}
        onClick={() => set(!value)}
      >
        <i />
      </button>
    </div>
  );
}
