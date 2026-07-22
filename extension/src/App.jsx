import { useEffect, useState } from "react";

import Section from "./components/Section";
import Toggle from "./components/Toggle";
import Select from "./components/Select";
import SegmentedControl from "./components/SegmentedControl";
import Footer from "./components/Footer";

const screenModes = {
  normal: 0,
  theater: 1,
  full: 2,
};

const qualities = {
  auto: 0,
  144: 1,
  240: 2,
  360: 3,
  480: 4,
  720: 5,
  1080: 6,
  1440: 7,
  2160: 8,
};

const timers = {
  off: 0,
  10: 1,
  15: 2,
  20: 3,
  30: 4,
  45: 5,
  60: 6,
  end: 7,
};

const playbacks = {
  0.25: 0,
  0.5: 1,
  0.75: 2,
  normal: 3,
  1.25: 4,
  1.5: 5,
  1.75: 6,
  2: 7,
};

const defaultSettings = {
  skipAd: true,
  autoplay: false,
  screenMode: screenModes.full,
  dismissPremiumPopup: false,
  annotations: true,
  ambientMode: true,
  quality: qualities[1080],
  timer: timers.off,
  playback: playbacks.normal,
};

export default function App() {
  const [settings, setSettings] = useState(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      const result = await chrome.storage.local.get("yt-settings");

      if (result["yt-settings"]) {
        setSettings(result["yt-settings"]);
      }
    }

    loadSettings();
  }, []);

  function updateSetting(key, value) {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSave() {
    setIsSaving(true);

    try {
      await chrome.runtime.sendMessage({
        action: "sendSettings",
        settings,
      });
      window.close();
    } catch (err) {
      console.log("save error: ", err);
    } finally {
      setIsSaving(false);
    }
  }

  function handleReset() {
    setSettings(defaultSettings);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto w-[380px] p-5 space-y-6">
        <header>
          <h1 className="text-2xl font-bold">YouTube Preference Manager</h1>

          <p className="mt-1 text-sm text-zinc-400">
            Configure how YouTube behaves whenever you watch videos.
          </p>
        </header>

        <Section title="Playback" description="Control playback behaviour.">
          {/* <Toggle
            label="Skip Ads"
            description="Automatically skip skippable advertisements."
            checked={settings.skipAd}
            onChange={(v) => updateSetting("skipAd", v)}
          /> */}

          <Toggle
            label="Autoplay"
            description="Enable or disable autoplay."
            checked={settings.autoplay}
            onChange={(v) => updateSetting("autoplay", v)}
          />

          <Select
            label="Playback Speed"
            description="Default playback speed."
            value={settings.playback}
            onChange={(v) => updateSetting("playback", v)}
            options={[
              { label: "Normal", value: 0 },
              { label: "1.25×", value: 1 },
              { label: "1.5×", value: 2 },
              { label: "2×", value: 3 },
            ]}
          />

          <Select
            label="Preferred Quality"
            description="Highest available quality."
            value={settings.quality}
            onChange={(v) => updateSetting("quality", v)}
            options={[
              { label: "Auto", value: 0 },
              { label: "144p", value: 1 },
              { label: "240p", value: 2 },
              { label: "360p", value: 3 },
              { label: "480p", value: 4 },
              { label: "720p", value: 5 },
              { label: "1080p", value: 6 },
              { label: "1440p", value: 7 },
              { label: "2160p", value: 8 },
            ]}
          />

          {/* <Select
            label="Sleep Timer"
            description="Automatically stop playback."
            value={settings.timer}
            onChange={(v) => updateSetting("timer", v)}
            options={[
              { label: "Off", value: 0 },
              { label: "10 Minutes", value: 1 },
              { label: "15 Minutes", value: 2 },
              { label: "20 Minutes", value: 3 },
              { label: "30 Minutes", value: 4 },
              { label: "45 Minutes", value: 5 },
              { label: "60 Minutes", value: 6 },
              { label: "End of Video", value: 7 },
            ]}
          /> */}
        </Section>

        <Section title="Appearance" description="Customize the video player.">
          <SegmentedControl
            label="Screen Mode"
            description="Choose the default viewing mode."
            value={settings.screenMode}
            onChange={(v) => updateSetting("screenMode", v)}
            options={[
              { label: "Normal", value: 0 },
              { label: "Theater", value: 1 },
              { label: "Full", value: 2 },
            ]}
          />

          <Toggle
            label="Ambient Mode"
            description="Enable YouTube ambient lighting."
            checked={settings.ambientMode}
            onChange={(v) => updateSetting("ambientMode", v)}
          />

          {/* <Toggle
            label="Annotations"
            description="Display video annotations."
            checked={settings.annotations}
            onChange={(v) => updateSetting("annotations", v)}
          /> */}
        </Section>

        <Section title="Miscellaneous" description="Additional behaviours.">
          <Toggle
            label="Dismiss Premium Popup"
            description="Automatically dismiss YouTube Premium prompts."
            checked={settings.dismissPremiumPopup}
            onChange={(v) => updateSetting("dismissPremiumPopup", v)}
          />
        </Section>

        <Footer onSave={handleSave} onReset={handleReset} isSaving={isSaving} />
      </div>
    </div>
  );
}
