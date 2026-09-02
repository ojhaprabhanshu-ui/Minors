// Centralized cache for browser-level permissions verified during the
// Full Interview pre-flight SystemCheck. The orchestrator runs the
// permission check ONCE; child round containers read from this cache so
// they do not trigger redundant browser prompts.

const CACHE_KEY = "vireza_full_interview_permissions";

export const loadCachedPermissions = () => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const saveCachedPermissions = (permissions) => {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({
      ...permissions,
      savedAt: new Date().toISOString(),
    }));
  } catch {}
};

export const clearCachedPermissions = () => {
  try { sessionStorage.removeItem(CACHE_KEY); } catch {}
};

export const CANDIDATE_ID_KEY = "vireza_candidate_id";

export const getOrCreateCandidateId = () => {
  let id = localStorage.getItem(CANDIDATE_ID_KEY);
  if (!id) {
    id = "candidate_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
    localStorage.setItem(CANDIDATE_ID_KEY, id);
  }
  return id;
};
