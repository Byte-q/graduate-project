import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

// Convert the callback-based scrypt function to a Promise-based one
const scryptAsync = promisify(scrypt);

/**
 * تشفير كلمة المرور مع الملح (salt)
 * @param password كلمة المرور غير المشفرة
 * @returns كلمة المرور المشفرة مع الملح (بصيغة hash.salt)
 */
export async function hashPassword(password: string): Promise<string> {
  // Generate a random salt
  const salt = randomBytes(16).toString('hex');
  // Hash the password with the salt
  const hash = (await scryptAsync(password, salt, 64)) as Buffer;
  // Return the hashed password with the salt
  return `${hash.toString('hex')}.${salt}`;
}

/**
 * مقارنة كلمة المرور المقدمة مع كلمة المرور المشفرة المخزنة
 * @param providedPassword كلمة المرور المقدمة (غير مشفرة)
 * @param storedPassword كلمة المرور المخزنة (مشفرة)
 * @returns true إذا كانت كلمة المرور متطابقة، false خلاف ذلك
 */
export async function comparePasswords(providedPassword: string, storedPassword: string): Promise<boolean> {
  // Split the stored password into hash and salt
  const [hashedPassword, salt] = storedPassword.split('.');
  // Hash the provided password with the same salt
  const hashBuffer = Buffer.from(hashedPassword, 'hex');
  const providedHashBuffer = (await scryptAsync(providedPassword, salt, 64)) as Buffer;
  // Compare the hashes in a timing-safe way
  return timingSafeEqual(hashBuffer, providedHashBuffer);
}

/**
 * التحقق من صحة عنوان البريد الإلكتروني
 * @param email عنوان البريد الإلكتروني
 * @returns true إذا كان عنوان البريد الإلكتروني صالحًا، false خلاف ذلك
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * التحقق من صحة اسم المستخدم
 * @param username اسم المستخدم
 * @returns true إذا كان اسم المستخدم صالحًا، false خلاف ذلك
 */
export function isValidUsername(username: string): boolean {
  // يجب أن يكون اسم المستخدم مكون من أحرف وأرقام فقط، ولا يقل عن 3 أحرف ولا يزيد عن 30 حرفًا
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
}

/**
 * التحقق من صحة كلمة المرور
 * @param password كلمة المرور
 * @returns true إذا كانت كلمة المرور صالحة، false خلاف ذلك
 */
export function isValidPassword(password: string): boolean {
  // يجب أن تكون كلمة المرور مكونة من 8 أحرف على الأقل
  return password.length >= 8;
}