import { supabaseAdmin } from './supabase-admin';
import {
  hasActiveProSubscription,
  hasGlobalPremiumAccess,
  hasPendingPremiumPayment,
  hasItemUnlockAccess,
} from '../premium-content';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export async function getRequestUser(req) {
  const authHeader = req?.headers?.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) return null;

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user?.id) return null;
    return data.user;
  } catch {
    return null;
  }
}

export async function resolvePremiumAccessForUser(user) {
  if (!user?.id) {
    return {
      user: null,
      isAdmin: false,
      isPro: false,
      hasGlobalAccess: false,
      hasPendingPayment: false,
      subscriptions: [],
      accessRequests: [],
      transactions: [],
    };
  }

  const [adminRes, subsRes, reqRes, txRes] = await Promise.all([
    supabaseAdmin.from('admins').select('id').eq('user_id', user.id).maybeSingle(),
    supabaseAdmin.from('subscriptions').select('*').eq('user_id', user.id),
    supabaseAdmin.from('premium_access_requests').select('*').eq('user_id', user.id),
    supabaseAdmin.from('transactions').select('id, game_id, status, amount, purpose, tx_ref').eq('user_id', user.id),
  ]);

  const isAdmin = Boolean(adminRes?.data) || Boolean(ADMIN_EMAIL && user.email === ADMIN_EMAIL);
  const subscriptions = Array.isArray(subsRes?.data) ? subsRes.data : [];
  const accessRequests = Array.isArray(reqRes?.data) ? reqRes.data : [];
  const transactions = Array.isArray(txRes?.data) ? txRes.data : [];

  const isPro = hasActiveProSubscription(subscriptions);
  const hasGlobalAccess = hasGlobalPremiumAccess({
    isAdmin,
    subscriptions,
    accessRequests,
  });
  const hasPendingPayment = hasPendingPremiumPayment({
    subscriptions,
    accessRequests,
    transactions,
  });

  return {
    user,
    isAdmin,
    isPro,
    hasGlobalAccess,
    hasPendingPayment,
    subscriptions,
    accessRequests,
    transactions,
  };
}

export function checkUserGameAccess(accessContext, game) {
  return hasItemUnlockAccess({
    game,
    userId: accessContext?.user?.id || null,
    isAdmin: Boolean(accessContext?.isAdmin),
    subscriptions: accessContext?.subscriptions || [],
    accessRequests: accessContext?.accessRequests || [],
    transactions: accessContext?.transactions || [],
  });
}
