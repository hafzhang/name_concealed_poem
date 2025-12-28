async function test() {
    try {
        console.log('Testing font loading and vertical layout...');
        const res = await fetch('http://localhost:3000/api/render-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                poem: ['春眠不觉晓', '处处闻啼鸟', '夜来风雨声', '花落知多少'],
                style: 'kaishu',
                bg: 'none',
                frame: 'none'
            })
        });

        const data = await res.json();
        if (data.success) {
            console.log('Success! Image generated.');
        } else {
            console.error('Failed:', data);
        }

    } catch (e) {
        console.error('Test failed:', e);
    }
}

test();