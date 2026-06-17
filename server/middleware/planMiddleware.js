import Project from '../models/Project.js';
import { getPlanLimits } from '../utils/planLimits.js';

export const enforceMemberLimit = (req, res, next) => {
  const workspace = req.workspace;
  if (!workspace.canAddMember()) {
    const { maxMembers } = getPlanLimits(workspace.plan);
    return res.status(403).json({
      message: `Your ${workspace.plan} plan allows a maximum of ${maxMembers} members. Upgrade to add more.`,
      upgradeRequired: true,
    });
  }
  next();
};


export const enforceProjectLimit = async (req, res, next) => {
  const workspace = req.workspace;
  const { maxProjects } = getPlanLimits(workspace.plan);
  if (maxProjects === Infinity) return next();

  const count = await Project.countDocuments({ workspace: workspace._id });
  if (count >= maxProjects) {
    return res.status(403).json({
      message: `Your ${workspace.plan} plan allows a maximum of ${maxProjects} project(s). Upgrade to create more.`,
      upgradeRequired: true,
    });
  }
  next();
};
export const requirePlan = (...plans) => (req, res, next) => {
  const workspace = req.workspace;
  if (!plans.includes(workspace.plan)) {
    return res.status(403).json({
      message: `This feature requires a ${plans.join(' or ')} plan. You are on the ${workspace.plan} plan.`,
      upgradeRequired: true,
    });
  }
  next();
};