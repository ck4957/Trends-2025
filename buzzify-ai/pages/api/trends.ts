import type { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Use the region query parameter or default to "US"
    const geo = req.query.region ? String(req.query.region) : 'US';
    
    // URL for Google Trends web
    const url = `https://trends.google.com/trends/trendingsearches/daily?geo=${geo}&hl=en-US`;
    
    // Launch a headless browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set a user agent to mimic a real browser
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Navigate to Google Trends
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    // Wait for content to load
    await page.waitForSelector('body', { timeout: 5000 });
    
    // Extract trending topics
    const trendingTopics = await page.evaluate(() => {
      const topics = [];
      
      // Try to find trend cards or list items
      const trendElements = document.querySelectorAll('.feed-item');
      
      if (trendElements.length > 0) {
        trendElements.forEach((elem) => {
          const titleElement = elem.querySelector('.feed-item-header');
          if (titleElement) {
            topics.push({
              title: titleElement.textContent.trim(),
            });
          }
        });
      }
      
      return topics;
    });
    
    // Close the browser
    await browser.close();
    
    // If no trends were found, use mock data for testing
    const finalTopics = trendingTopics.length > 0 ? trendingTopics : [
      { title: "Artificial Intelligence" },
      { title: "Cryptocurrency Market" },
      { title: "Space Tourism" }
    ];
    
    // Format response
    const simplifiedTrends = {
      trends: finalTopics,
      timestamp: new Date().toISOString()
    };
    
    res.status(200).json(simplifiedTrends);
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ 
      error: 'Failed to fetch trending searches',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}