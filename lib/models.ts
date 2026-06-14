import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    avatar: { type: String },
    plan: { type: String, default: 'free', enum: ['free', 'pro', 'enterprise'] },
  },
  { timestamps: true }
)

const CampaignSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    segmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Segment' },
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, default: 'draft', enum: ['draft', 'sending', 'active', 'paused', 'completed'] },
    type: { type: String, enum: ['whatsapp', 'sms', 'email', 'rcs'] },
    targetAudience: { type: String },
    budget: { type: Number, default: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
    metrics: {
      sent: { type: Number, default: 0 },
      delivered: { type: Number, default: 0 },
      opened: { type: Number, default: 0 },
      clicked: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 },
      spend: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
    },
    content: { type: String },
    aiSuggestions: [{ type: String }],
  },
  { timestamps: true }
)

const CustomerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    lastPurchaseDate: { type: Date },
    tags: [{ type: String }],
  },
  { timestamps: true }
)

const OrderSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Customer' },
    amount: { type: Number, required: true },
    items: [
      {
        name: { type: String, required: true },
        category: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    purchaseDate: { type: Date, default: Date.now },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
  },
  { timestamps: true }
)

const SegmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    description: { type: String },
    filters: { type: mongoose.Schema.Types.Mixed },
    queryJson: { type: String },
  },
  { timestamps: true }
)

const CommunicationLogSchema = new mongoose.Schema(
  {
    campaignId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Campaign' },
    customerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Customer' },
    channel: { type: String, required: true },
    status: { type: String, enum: ['sent', 'delivered', 'read', 'clicked', 'ordered', 'failed'], default: 'sent' },
    messageContent: { type: String },
    history: [
      {
        status: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
)

const AnalyticsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
    date: { type: Date, default: Date.now },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    ctr: { type: Number, default: 0 },
    cpc: { type: Number, default: 0 },
  },
  { timestamps: true }
)

const MessageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    campaignContext: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
  },
  { timestamps: true }
)

export const User = mongoose.models.User || mongoose.model('User', UserSchema)
export const Campaign = mongoose.models.Campaign || mongoose.model('Campaign', CampaignSchema)
export const Analytics = mongoose.models.Analytics || mongoose.model('Analytics', AnalyticsSchema)
export const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema)
export const Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema)
export const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema)
export const Segment = mongoose.models.Segment || mongoose.model('Segment', SegmentSchema)
export const CommunicationLog = mongoose.models.CommunicationLog || mongoose.model('CommunicationLog', CommunicationLogSchema)
