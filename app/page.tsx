import LamapaolaV15AppShell from "./components/LamapaolaV15AppShell";
import AuthGate from "./components/AuthGate";

export default function Page() {
  return (
    <AuthGate>
      <LamapaolaV15AppShell />
    </AuthGate>
  );
}