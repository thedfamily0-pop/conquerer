import { DEFAULT_PARENT_EMAILS, flattenParentEmails } from './parentEmailSettings';
import { requestParentEmailAlert } from './aiGateway';

export interface SafetyScanResult {
  isUrgent: boolean;
  category: 'SAFE' | 'EMOTIONAL_CHECKIN' | 'URGENT_DISTRESS';
  reassuranceMessage?: string;
  emailAlertPayload?: {
    to: string[];
    subject: string;
    body: string;
  };
}

const DISTRESS_KEYWORDS = [
  'hurt myself', 'kill myself', 'suicide', 'want to die', 
  'not safe', 'do not feel safe', 'someone hurt me', 'scared at home', 'scared of someone', 'hate myself'
];

export function scanChildInput(
  text: string, 
  mood: string, 
  parentEmails: string[] = flattenParentEmails(DEFAULT_PARENT_EMAILS)
): SafetyScanResult {
  const normalized = (text || '').toLowerCase();
  const isUrgentWord = DISTRESS_KEYWORDS.some(kw => normalized.includes(kw));

  if (isUrgentWord) {
    return {
      isUrgent: true,
      category: 'URGENT_DISTRESS',
      reassuranceMessage: "💙 I hear you, and your safety is the most important thing in the world. A gentle safety note has been saved for Dad & Mom so they can give you a warm hug and help right now. You are safe and cared for.",
      emailAlertPayload: {
        to: parentEmails,
        subject: '🚨 URGENT SAFETY ALERT - Conquerer',
        body: `URGENT SAFETY NOTIFICATION FOR DAD & MOM
=========================================
Date/Time: ${new Date().toLocaleString()}
Learner Mood: ${mood.toUpperCase()}
Logged Input: "${text}"

ACTION REQUIRED: Please check in with your child immediately to offer support and comfort.

Sent automatically by the Conquerer Child Safety Net.
`
      }
    };
  }

  if (['worried', 'sad', 'angry'].includes(mood)) {
    return {
      isUrgent: false,
      category: 'EMOTIONAL_CHECKIN',
      reassuranceMessage: "Thank you for sharing your feeling. It is completely okay to feel this way. Dad & Mom love you and are always here to listen.",
      emailAlertPayload: {
        to: parentEmails,
        subject: `💙 Feeling Alert: Learner checked in as ${mood.toUpperCase()}`,
        body: `DAILY WELLBEING SUMMARY FOR DAD & MOM
=========================================
Date/Time: ${new Date().toLocaleString()}
Learner Feeling: ${mood.toUpperCase()}
Optional Note: "${text || 'No additional note'}"

Sent automatically by Conquerer.
`
      }
    };
  }

  return {
    isUrgent: false,
    category: 'SAFE'
  };
}

export function sendParentEmailAlert(payload: { to: string[]; subject: string; body: string }): boolean {
  console.info('📧 [Conquerer parent alert prepared]:', { ...payload, body: '[redacted from console]' });
  void requestParentEmailAlert(payload).then(sent => {
    if (sent) console.info('📧 Parent alert accepted by the secure email function.');
  }).catch(error => console.warn('[Conquerer parent alert] Delivery was not confirmed:', error));
  // This remains false because acceptance by the function is asynchronous and is not proof of inbox delivery.
  return false;
}
