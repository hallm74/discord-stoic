#!/usr/bin/env node

/**
 * Daily Stoic Bot
 * 
 * Fetches a Stoic quote, generates a modern reflection using GitHub Models,
 * and posts to Discord via webhooks.
 * 
 * Required environment variables:
 * - GITHUB_TOKEN: Your GitHub personal access token
 * - DISCORD_WEBHOOKS: Comma-separated list of Discord webhook URLs
 */

// Load .env file for local development
try {
  require('dotenv').config();
} catch (e) {
  // dotenv not installed, skip (fine for GitHub Actions)
}

const STOIC_API = 'https://stoic.tekloon.net/stoic-quote';
const GITHUB_MODELS_API = 'https://models.inference.ai.azure.com/chat/completions';
const MODEL_NAME = 'gpt-4o-mini';
const MAX_REFLECTION_WORDS = 120;

/**
 * Fetch a Stoic quote from the API
 */
async function fetchStoicQuote() {
  console.log('Fetching Stoic quote...');
  
  try {
    const response = await fetch(STOIC_API);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch quote: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const quote = data.data.quote;
    const author = data.data.author;
    
    console.log(`Quote received: "${quote}" — ${author}`);
    
    return {
      quote: quote,
      author: author
    };
  } catch (error) {
    console.error('Error fetching Stoic quote:', error);
    throw error;
  }
}

/**
 * Generate a modern Stoic reflection using GitHub Models
 */
async function generateReflection(quote, author) {
  console.log('Generating modern reflection...');
  
  const apiKey = process.env.MODELS_TOKEN;
  if (!apiKey) {
    throw new Error('MODELS_TOKEN environment variable is not set');
  }
  
  const prompt = `You are a modern Stoic philosopher. Write a brief, practical reflection on this Stoic quote:

"${quote}" — ${author}

Your reflection should:
- Be conversational and contemporary in style
- Offer practical wisdom for modern life
- Connect the ancient insight to today's challenges
- Be concise (around ${MAX_REFLECTION_WORDS} words)
- Avoid clichés and generic advice
- Feel authentic, not preachy

Write only the reflection text, no introduction or conclusion.`;

  try {
    const response = await fetch(GITHUB_MODELS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 250,
        temperature: 0.8
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub Models API error: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    const reflection = data.choices[0].message.content.trim();
    
    console.log(`Reflection generated (${reflection.split(/\s+/).length} words)`);
    console.log(`Tokens used: ${data.usage.total_tokens}`);
    
    return reflection;
  } catch (error) {
    console.error('Error generating reflection:', error);
    throw error;
  }
}

/**
 * Format the Discord message
 */
function formatDiscordMessage(quote, author, reflection) {
  return {
    content: `**Daily Stoic**\n"${quote}" — ${author}\n\n${reflection}`
  };
}

/**
 * Post message to Discord webhook
 */
async function postToDiscord(webhookUrl, message) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Discord webhook error: ${response.status} ${errorText}`);
    }
    
    console.log(`Posted to Discord webhook: ${webhookUrl.substring(0, 50)}...`);
  } catch (error) {
    console.error(`Failed to post to webhook ${webhookUrl}:`, error);
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('Starting Daily Stoic bot...\n');
    
    // 1. Fetch Stoic quote
    const { quote, author } = await fetchStoicQuote();
    
    // 2. Generate modern reflection
    const reflection = await generateReflection(quote, author);
    
    // 3. Format message
    const message = formatDiscordMessage(quote, author, reflection);
    
    // 4. Post to Discord webhooks
    const webhooksEnv = process.env.DISCORD_WEBHOOKS;
    if (!webhooksEnv) {
      throw new Error('DISCORD_WEBHOOKS environment variable is not set');
    }
    
    const webhooks = webhooksEnv.split(',').map(url => url.trim()).filter(url => url);
    
    if (webhooks.length === 0) {
      throw new Error('No Discord webhooks configured');
    }
    
    console.log(`\nPosting to ${webhooks.length} Discord webhook(s)...`);
    
    for (const webhook of webhooks) {
      await postToDiscord(webhook, message);
    }
    
    console.log('\n✓ Daily Stoic posted successfully!');
    
  } catch (error) {
    console.error('\n✗ Error running Daily Stoic bot:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
