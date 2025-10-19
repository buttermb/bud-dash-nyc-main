/**
 * Realtime Data Validation Utilities
 * Validates incoming realtime payloads to prevent undefined errors
 */

import { isValidOrder, isValidActivity, isValidAuditLog, isValidCourier } from './typeGuards';

/**
 * Validates and sanitizes an order object from realtime payload
 */
export const validateOrder = (order: any): boolean => {
  if (!isValidOrder(order)) {
    console.error('Invalid order received from realtime:', order);
    return false;
  }
  return true;
};

/**
 * Validates and sanitizes an activity object from realtime payload
 */
export const validateActivity = (activity: any): boolean => {
  if (!isValidActivity(activity)) {
    console.error('Invalid activity received from realtime:', activity);
    return false;
  }
  return true;
};

/**
 * Validates and sanitizes an audit log object from realtime payload
 */
export const validateAuditLog = (log: any): boolean => {
  if (!isValidAuditLog(log)) {
    console.error('Invalid audit log received from realtime:', log);
    return false;
  }
  return true;
};

/**
 * Validates and sanitizes a courier object from realtime payload
 */
export const validateCourier = (courier: any): boolean => {
  if (!isValidCourier(courier)) {
    console.error('Invalid courier received from realtime:', courier);
    return false;
  }
  return true;
};

/**
 * Validates giveaway data from realtime payload
 */
export const validateGiveaway = (giveaway: any): boolean => {
  if (!giveaway || typeof giveaway !== 'object') {
    console.error('Invalid giveaway received from realtime:', giveaway);
    return false;
  }
  
  if (typeof giveaway.status !== 'string') {
    console.error('Giveaway missing valid status:', giveaway);
    return false;
  }
  
  return true;
};

/**
 * Validates product data from realtime payload
 */
export const validateProduct = (product: any): boolean => {
  if (!product || typeof product !== 'object') {
    console.error('Invalid product received from realtime:', product);
    return false;
  }
  
  if (typeof product.id !== 'string' && typeof product.id !== 'number') {
    console.error('Product missing valid id:', product);
    return false;
  }
  
  return true;
};

/**
 * Validates chat session data from realtime payload
 */
export const validateChatSession = (session: any): boolean => {
  if (!session || typeof session !== 'object') {
    console.error('Invalid chat session received from realtime:', session);
    return false;
  }
  
  if (typeof session.id !== 'string') {
    console.error('Chat session missing valid id:', session);
    return false;
  }
  
  return true;
};

/**
 * Validates chat message data from realtime payload
 */
export const validateChatMessage = (message: any): boolean => {
  if (!message || typeof message !== 'object') {
    console.error('Invalid chat message received from realtime:', message);
    return false;
  }
  
  if (typeof message.message !== 'string') {
    console.error('Chat message missing valid message text:', message);
    return false;
  }
  
  return true;
};
