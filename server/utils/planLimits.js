export const getPlanLimits = (plan) => {
  const limits = {
    free:     { maxProjects: 1,        maxMembers: 3 },
    pro:      { maxProjects: 20,       maxMembers: 20 },
    business: { maxProjects: Infinity, maxMembers: Infinity },
  };
  return limits[plan] || limits.free;
};