import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY
);

async function analyze() {
  // Get all quiz emails
  const { data: quizUsers } = await supabase
    .from('quiz_results_v2')
    .select('email')
    .not('email', 'is', null);

  const quizEmails = new Set(quizUsers?.map(u => u.email?.toLowerCase()).filter(Boolean) || []);

  // Get all order emails
  const { data: orderUsers } = await supabase
    .from('pending_orders')
    .select('email, status')
    .not('email', 'is', null);

  const orderEmails = new Set(orderUsers?.map(u => u.email?.toLowerCase()).filter(Boolean) || []);
  const paidEmails = new Set(orderUsers?.filter(u => u.status === 'paid').map(u => u.email?.toLowerCase()).filter(Boolean) || []);

  // Group 1: Quiz done + No order
  let quizNoOrder = 0;
  const quizNoOrderList = [];
  quizEmails.forEach(email => {
    if (!orderEmails.has(email)) {
      quizNoOrder++;
      quizNoOrderList.push(email);
    }
  });

  // Group 2: Has order + No quiz
  let orderNoQuiz = 0;
  const orderNoQuizList = [];
  orderEmails.forEach(email => {
    if (!quizEmails.has(email)) {
      orderNoQuiz++;
      orderNoQuizList.push(email);
    }
  });

  // Group 3: Has PAID order + No quiz
  let paidNoQuiz = 0;
  const paidNoQuizList = [];
  paidEmails.forEach(email => {
    if (!quizEmails.has(email)) {
      paidNoQuiz++;
      paidNoQuizList.push(email);
    }
  });

  console.log('=== ПОТРЕБИТЕЛИ ЗА СЪОБЩЕНИЯ ===\n');
  console.log('1. Завършили Quiz + НЯМА поръчка:', quizNoOrder);
  console.log('   -> Изпрати: "Купи за да използваш приложението"');
  console.log('   Примери:', quizNoOrderList.slice(0, 5).join(', '));
  console.log('');
  console.log('2. ИМА поръчка + НЕ е минал Quiz:', orderNoQuiz);
  console.log('   -> Изпрати: "Завърши Quiz-а"');
  console.log('   Примери:', orderNoQuizList.slice(0, 5).join(', '));
  console.log('');
  console.log('3. ИМА ПЛАТЕНА поръчка + НЕ е минал Quiz:', paidNoQuiz);
  console.log('   -> ВАЖНО! Платили са но не са минали quiz!');
  console.log('   Примери:', paidNoQuizList.slice(0, 5).join(', '));
}

analyze();
