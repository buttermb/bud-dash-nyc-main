/**
 * Realtime Data Validation Utilities
 * Validates incoming realtime payloads to prevent undefined errors
 * Enhanced for production with partial/cached response handling
 */

import { isValidOrder, isValidActivity, isValidAuditLog, isValidCourier } from './typeGuards';
import { productionLogger } from './productionLogger';

/**
 * Validates and sanitizes an order object from realtime payload
 */
export const validateOrder = (order: any): boolean => {
  if (!isValidOrder(order)) {
    productionLogger.error('Invalid order received from realtime', { 
      order,
      hasId: !!order?.id,
      hasStatus: !!order?.status,
      type: typeof order,
    });
    return false;
  }
  
  // Check for incomplete cached data
  if (!order.status || typeof order.status !== 'string') {
    productionLogger.warning('Order missing status field', { orderId: order?.id });
    return false;
  }
  
  return true;
};

/**
 * Validates and sanitizes an activity object from realtime payload
 */
export const validateActivity = (activity: any): boolean => {
  if (!isValidActivity(activity)) {
    productionLogger.error('Invalid activity received from realtime', { activity });
    return false;
  }
  
  // Validate action type field
  if (!activity.action || typeof activity.action !== 'string') {
    productionLogger.warning('Activity missing action field', { activityId: activity?.id });
    return false;
  }
  
  return true;
};

/**
 * Validates and sanitizes an audit log object from realtime payload
 */
export const validateAuditLog = (log: any): boolean => {
  if (!isValidAuditLog(log)) {
    productionLogger.error('Invalid audit log received from realtime', { log });
    return false;
  }
  
  // Validate action_type field
  if (!log.action_type || typeof log.action_type !== 'string') {
    productionLogger.warning('Audit log missing action_type field', { logId: log?.id });
    return false;
  }
  
  return true;
};

/**
 * Validates and sanitizes a courier object from realtime payload
 */
export const validateCourier = (courier: any): boolean => {
  if (!isValidCourier(courier)) {
    productionLogger.error('Invalid courier received from realtime', { courier });
    return false;
  }
  
  // Validate status field
  if (courier.status && typeof courier.status !== 'string') {
    productionLogger.warning('Courier invalid status field', { courierId: courier?.id });
    return false;
  }
  
  return true;
};

/**
 * Validates giveaway data from realtime payload
 */
export const validateGiveaway = (giveaway: any): boolean => {
  if (!giveaway || typeof giveaway !== 'object') {
    productionLogger.error('Invalid giveaway received from realtime', { giveaway });
    return false;
  }
  
  if (!giveaway.status || typeof giveaway.status !== 'string') {
    productionLogger.warning('Giveaway missing valid status', { giveawayId: giveaway?.id });
    return false;
  }
  
  return true;
};

/**
 * Validates product data from realtime payload
 */
export const validateProduct = (product: any): boolean => {
  if (!product || typeof product !== 'object') {
    productionLogger.error('Invalid product received from realtime', { product });
    return false;
  }
  
  if (typeof product.id !== 'string' && typeof product.id !== 'number') {
    productionLogger.warning('Product missing valid id', { product });
    return false;
  }
  
  // Validate required fields aren't undefined
  if (product.status !== undefined && typeof product.status !== 'string') {
    productionLogger.warning('Product invalid status field', { productId: product?.id });
    return false;
  }
  
  return true;
};

/**
 * Validates chat session data from realtime payload
 */
export const validateChatSession = (session: any): boolean => {
  if (!session || typeof session !== 'object') {
    productionLogger.error('Invalid chat session received from realtime', { session });
    return false;
  }
  
  if (typeof session.id !== 'string') {
    productionLogger.warning('Chat session missing valid id', { session });
    return false;
  }
  
  // Validate status field if present
  if (session.status !== undefined && typeof session.status !== 'string') {
    productionLogger.warning('Chat session invalid status field', { sessionId: session?.id });
    return false;
  }
  
  return true;
};

/**
 * Validates chat message data from realtime payload
 */
export const validateChatMessage = (message: any): boolean => {
  if (!message || typeof message !== 'object') {
    productionLogger.error('Invalid chat message received from realtime', { message });
    return false;
  }
  
  if (!message.message || typeof message.message !== 'string') {
    productionLogger.warning('Chat message missing valid message text', { messageId: message?.id });
    return false;
  }
  
  return true;
};
