import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { parseStringPromise } from 'xml2js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Path to the trends.xml file
    const filePath = path.join(process.cwd(), 'posts', '1-trends.xml');
    const xmlData = fs.readFileSync(filePath, 'utf-8');

    // Parse the XML data into a JavaScript object
    const parsedData = await parseStringPromise(xmlData);

    // Extract relevant data from the parsed XML
    const items = parsedData.rss.channel[0].item.map((item: any) => ({
      title: item.title[0],
      traffic: item['ht:approx_traffic'] ? item['ht:approx_traffic'][0] : 'N/A',
      news: item['ht:news_item']?.map((newsItem: any) => ({
        title: newsItem['ht:news_item_title'][0],
        url: newsItem['ht:news_item_url'][0],
        source: newsItem['ht:news_item_source'][0],
        picture: newsItem['ht:news_item_picture'][0],
      })) || [],
    }));

    // Return the extracted data
    res.status(200).json({ trends: items, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error parsing trends.xml:', error);
    res.status(500).json({ error: 'Failed to parse trends.xml' });
  }
}