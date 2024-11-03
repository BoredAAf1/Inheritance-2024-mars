const puppeteer = require('puppeteer');
const { URL } = require('url');

async function bigBasketScraper(query) {
  // Start a headless browser
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const startUrl = `https://www.amazon.in/s?k=${query}&page=1`;

  await page.goto(startUrl, { waitUntil: 'domcontentloaded' });

  console.log(`Navigating to: ${startUrl}`);

  const products = await page.evaluate(() => {
    const mainDivs = Array.from(document.querySelectorAll('.eA-dmzP'));

    return mainDivs.map(div => {
            const name = div.querySelector('.pt-0\\.5.h-full')?.innerText || 'N/A';
            const discountPrice = div.querySelector('.AypOi') ? parseFloat(div.querySelector('.AypOi').innerText.replace(/,/g, '')) : 'N/A';
            const originalPrice = div.querySelector('.hsCgvu') ? parseFloat(div.querySelector('.hsCgvu').innerText.replace(/,/g, '')) : 'N/A';
            const weight = div.querySelector('.cWbtUx')?.innerText.trim() || 'N/A';
            const image = div.querySelector('img.cSWRCd')?.src || 'N/A';

            return {
                productName: name,
                productPrice: {
                    discountPrice: discountPrice,
                    originalPrice: originalPrice
                },
                productWeight: weight,
                productImage: image,
                origin: "amazon"
            };
        });
    });

  if (products.length === 0) {
    console.warn("No product names found. Check your selectors.");
  }

  await browser.close();
  return products;
}

module.exports = bigBasketScraper;