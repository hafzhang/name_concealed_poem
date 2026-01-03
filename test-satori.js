const satori = require('satori').default;
const fs = require('fs');
const path = require('path');

async function run() {
  try {
    const fontPath = path.join(process.cwd(), 'node_modules', '@fontsource', 'noto-serif-sc', 'files', 'noto-serif-sc-chinese-simplified-400-normal.woff');
    console.log('Loading font from:', fontPath);
    const fontData = fs.readFileSync(fontPath);
    console.log('Font loaded, size:', fontData.length);

    const poem = ['春', '眠', '不', '觉', '晓'];

    console.log('Starting satori...');
    const svg = await satori(
      {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            width: '100%',
            height: '100%',
            backgroundColor: 'white',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '48px',
            color: 'black',
            flexDirection: 'column',
            border: undefined, // TEST THIS
            boxShadow: undefined, // TEST THIS
          },
          children: [
            {
              type: 'div',
              props: {
                 children: poem.join(' '),
                 style: { marginBottom: '20px' }
              }
            },
          ]
        },
        key: 'container'
      },
      {
        width: 800,
        height: 1200,
        fonts: [
          {
            name: 'NotoSerifSC',
            data: fontData,
            weight: 400,
            style: 'normal',
          },
        ],
      }
    );
    console.log('Satori success!');
  } catch (e) {
    console.error('Satori failed:', e);
  }
}

run();