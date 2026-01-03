
const fs = require('fs');
const path = require('path');

async function testRender() {
  const styles = [
    { name: 'ModernBlack', id: 'modern_black' },
    { name: 'ChampagneGold', id: 'champagne_gold' },
    { name: 'SakuraPink', id: 'sakura_pink' },
    { name: 'MintGreen', id: 'mint_green' },
    { name: 'CloudBrocade', id: 'cloud_brocade' },
    { name: 'Redwood', id: 'redwood' },
    { name: 'GoldenWood', id: 'golden_wood' },
    { name: 'LavenderMist', id: 'lavender_mist' },
    { name: 'SilkScroll', id: 'silk_scroll' },
    { name: 'AzurePorcelain', id: 'azure_porcelain' }
  ];

  for (const style of styles) {
    console.log(`Testing ${style.name} (${style.id})...`);
    try {
        const response = await fetch(`http://127.0.0.1:3000/api/render-image`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                poem: ['床前明月光', '疑是地上霜', '举头望明月', '低头思故乡'],
                frame: style.id,
                style: 'kaishu',
                name: '测试'
            })
        });
        
        if (response.ok) {
            console.log(`✅ ${style.name} rendered successfully.`);
        } else {
            const data = await response.json();
            console.error(`❌ ${style.name} failed: ${response.status} ${response.statusText}`);
            console.error(JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error(`❌ ${style.name} error:`, e.message);
    }
  }
}

testRender();
