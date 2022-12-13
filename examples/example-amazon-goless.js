import puppeteer from 'puppeteer-core';

import GoLogin from './gologin.js';

const { connect } = puppeteer;

(async () => {
  const GL = new GoLogin({
    token: 'yU0token',
    profile_id: 'yU0Pr0f1leiD',
  });

  const { status, wsUrl } = await GL.startRemote();
  const browser = await connect({
    browserWSEndpoint: wsUrl,
    ignoreHTTPSErrors: true,
  });

  const page = await browser.newPage();
  const viewPort = GL.getViewPort();
  await page.setViewport({ width: Math.round(viewPort.width * 0.994), height: Math.round(viewPort.height * 0.92) });
  const session = await page.target().createCDPSession();
  const { windowId } = await session.send('Browser.getWindowForTarget');
  await session.send('Browser.setWindowBounds', { windowId, bounds: viewPort });
  await session.detach();

  await page.goto('https://www.amazon.com/-/dp/B0771V1JZX');
  const content = await page.content();
  const matchData = content.match(/'initial': (.*)}/);
  if (matchData === null || matchData.length === 0){
    console.log('no images found');
  } else {
    const data = JSON.parse(matchData[1]);
    const images = data.map(e => e.hiRes);
    console.log('images=', images);
  }

  await GL.stopRemote();
})();
