import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true },
  owner:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['admin', 'member', 'viewer'], default: 'member' },
  }],

 
  plan:                   { type: String, enum: ['free', 'pro', 'business'], default: 'free' },
  stripeCustomerId:       { type: String, default: null },
  stripeSubscriptionId:   { type: String, default: null },
  stripePriceId:          { type: String, default: null },
  stripeCurrentPeriodEnd: { type: Date,   default: null },

}, { timestamps: true });


workspaceSchema.methods.getPlanLimits = function () {
  const limits = {
    free:     { maxMembers: 3,        maxProjects: 1 },
    pro:      { maxMembers: 20,       maxProjects: Infinity },
    business: { maxMembers: Infinity, maxProjects: Infinity },
  };
  return limits[this.plan] || limits.free;
};

workspaceSchema.methods.canAddMember = function () {
  const { maxMembers } = this.getPlanLimits();
  return this.members.length < maxMembers;
};

export default mongoose.model('Workspace', workspaceSchema);