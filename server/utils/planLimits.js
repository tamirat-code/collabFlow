export const getPlanLimits = (plan) => {
  const limits = {
    free: {
      projects: 3,
      members: 2,
      storage: "500MB",
    },
    pro: {
      projects: 20,
      members: 10,
      storage: "10GB",
    },
    business: {
      projects: -1,
      members: -1,
      storage: "100GB",
    },
  };

  return limits[plan] || limits.free;
};