// server/engine/pricing.js

const PRICING = {
  cursor: {
    hobby:      { perSeat: 0,    name: 'Hobby' },
    pro:        { perSeat: 20,   name: 'Pro' },
    business:   { perSeat: 40,   name: 'Business' },
    enterprise: { perSeat: null, name: 'Enterprise' },
  },
  github_copilot: {
    // FIX: removed duplicate 'Free' key with capital F (was shadowing nothing but is inconsistent)
    free:       { perSeat: 0,    name: 'Free' },
    individual: { perSeat: 10,   name: 'Individual' },
    business:   { perSeat: 19,   name: 'Business' },
    enterprise: { perSeat: 39,   name: 'Enterprise' },
  },
  claude: {
    free:       { perSeat: 0,    name: 'Free' },
    pro:        { perSeat: 20,   name: 'Pro' },        // FIX: was $17, correct price is $20
    max:        { perSeat: 100,  name: 'Max' },
    team:       { perSeat: 30,   name: 'Team' },       // FIX: was $20, correct price is $30 (5-seat min)
    enterprise: { perSeat: null, name: 'Enterprise' },
    api:        { perSeat: null, name: 'API Direct' },
  },
  chatgpt: {
    plus:       { perSeat: 20,   name: 'Plus' },
    team:       { perSeat: 30,   name: 'Team' },
    enterprise: { perSeat: null, name: 'Enterprise' },
    api:        { perSeat: null, name: 'API Direct' },
  },
  gemini: {
    pro:        { perSeat: 20,   name: 'Pro' },
    ultra:      { perSeat: 30,   name: 'Ultra' },
    api:        { perSeat: null, name: 'API' },
  },
  windsurf: {
    free:       { perSeat: 0,    name: 'Free' },
    pro:        { perSeat: 15,   name: 'Pro' },        // FIX: verify against windsurf.com/pricing
    teams:      { perSeat: 30,   name: 'Teams' },
  },
  anthropic_api: {
    direct:     { perSeat: null, name: 'API Direct' },
  },
  openai_api: {
    direct:     { perSeat: null, name: 'API Direct' },
  },
};

module.exports = { PRICING };