export type CallRecording = {
  mime: string;
  dataBase64: string; // base64-encoded audio
};

export type CallLog = {
  id: string;
  clientId: string;
  clientName: string;
  phone: string;
  startedAt: string;
  endedAt?: string;
  durationSec?: number;
  notes?: string;
  recording?: CallRecording;
};

const KEY = "callLogs";

export function loadCallLogs(): CallLog[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CallLog[]) : [];
  } catch {
    return [];
  }
}

export function saveCallLogs(logs: CallLog[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(logs));
  } catch {}
}

export function addCallLog(log: CallLog) {
  const logs = loadCallLogs();
  logs.unshift(log);
  saveCallLogs(logs);
}

export function updateCallLog(id: string, patch: Partial<CallLog>) {
  const logs = loadCallLogs();
  const i = logs.findIndex(l => l.id === id);
  if (i !== -1) {
    logs[i] = { ...logs[i], ...patch };
    saveCallLogs(logs);
  }
}
