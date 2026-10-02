import { Task } from '../types';

export function parseWhatsAppTextToTasks(text: string): Task[] {
  if (!text || !text.trim()) return [];

  const lines = text
    .split(/\n|;|\./)
    .map((l) => l.trim())
    .filter((l) => l.length > 3);

  const parsedTasks: Task[] = [];
  const subjects = ['DSP', 'Networks', 'Control Systems', 'OS', 'Math', 'General'];

  // If input is short or single statement
  const targetLines = lines.length > 0 ? lines.slice(0, 3) : [text];

  targetLines.forEach((line, index) => {
    let subject = 'General';
    for (const sub of subjects) {
      if (new RegExp(sub, 'i').test(line)) {
        subject = sub;
        break;
      }
    }

    // Determine priority
    let priority: 'P0' | 'P1' | 'P2' = 'P1';
    const upper = line.toUpperCase();
    if (upper.includes('P0') || upper.includes('URGENT') || upper.includes('QUIZ') || upper.includes('EXAM') || upper.includes('SUBMIT TONIGHT')) {
      priority = 'P0';
    } else if (upper.includes('P2') || upper.includes('READ') || upper.includes('OPTIONAL') || upper.includes('SLIDES')) {
      priority = 'P2';
    } else if (upper.includes('P1') || upper.includes('ASSIGNMENT') || upper.includes('LAB') || upper.includes('REPORT')) {
      priority = 'P1';
    } else if (index === 0) {
      priority = 'P0';
    }

    // Determine duration
    let duration = 45; // Default mock duration
    const minMatch = line.match(/(\d+)\s*(mins?|minutes?|m)/i);
    const hourMatch = line.match(/(\d+(\.\d+)?)\s*(hrs?|hours?|h)/i);

    if (minMatch) {
      duration = parseInt(minMatch[1], 10);
    } else if (hourMatch) {
      duration = Math.round(parseFloat(hourMatch[1]) * 60);
    } else if (priority === 'P0') {
      duration = 60;
    } else if (priority === 'P2') {
      duration = 30;
    }

    // Clean title
    let title = line
      .replace(/p[0-2]:?/gi, '')
      .replace(/urgent:?/gi, '')
      .replace(/submit by \d+ ?(am|pm)?/gi, '')
      .trim();

    if (title.length < 5) {
      title = `${subject} Assignment ${index + 1}`;
    }

    // Capitalize first letter
    title = title.charAt(0).toUpperCase() + title.slice(1);

    // Determine tag
    let tags: string[] = ['Assignment'];
    if (upper.includes('LAB')) tags = ['Lab'];
    else if (upper.includes('EXAM') || upper.includes('QUIZ')) tags = ['Exam'];
    else if (upper.includes('PROJECT')) tags = ['Project'];
    else if (upper.includes('READ') || upper.includes('REVISE')) tags = ['Revision'];

    parsedTasks.push({
      id: `task-shredded-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 5)}`,
      title,
      subject,
      duration,
      priority,
      tags,
      completed: false,
      createdAt: Date.now(),
    });
  });

  // Ensure 1 or 2 structured tasks as requested in prompt simulation behavior
  return parsedTasks.slice(0, 2);
}
