
const chatLog = document.getElementById('chatLog');
const askButton = document.getElementById('askButton');
const messageInput = document.getElementById('message');

const botResponses = [
  {
    prompt: 'track my expenses',
    answer: 'Start by writing down what you spend each week. Group items into categories like snacks, entertainment, and savings so you can see where your money goes.'
  },
  {
    prompt: 'save money',
    answer: 'Set a clear savings goal and decide how much to save from each allowance or paycheck. Small amounts add up fast when you stay consistent.'
  },
  {
    prompt: 'budget',
    answer: 'Try the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings. Adjust the ratios for your allowance and goals.'
  },
  {
    prompt: 'allowance',
    answer: 'Treat your allowance like income: plan what you need first, then decide how much to save and spend. That makes it easier to avoid impulse buys.'
  }
];

function appendMessage(text, sender) {
  const bubble = document.createElement('div');
  bubble.className = `message ${sender}`;
  bubble.textContent = text;
  chatLog.appendChild(bubble);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function getBotReply(message) {
  const normalized = message.toLowerCase();
  const match = botResponses.find(item => normalized.includes(item.prompt));
  if (match) return match.answer;

  return 'A good first step is to track your income and expenses each week. Then choose one savings goal and split your money into spending, saving, and fun categories.';
}

function handleAsk() {
  const userMessage = messageInput.value.trim();
  if (!userMessage) return;

  appendMessage(userMessage, 'user');
  messageInput.value = '';

  setTimeout(() => {
    const botReply = getBotReply(userMessage);
    appendMessage(botReply, 'bot');
  }, 300);
}

askButton.addEventListener('click', handleAsk);
messageInput.addEventListener('keydown', event => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    handleAsk();
  }
});