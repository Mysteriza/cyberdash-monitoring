import SettingsPanel from "./settings-panel";

export default function DashboardHeader() {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold text-foreground">
        CyberDash
      </h1>
      <SettingsPanel />
    </div>
  );
}