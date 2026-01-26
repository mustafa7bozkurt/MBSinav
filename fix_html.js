const fs = require('fs');

try {
    let content = fs.readFileSync('app.js', 'utf8');

    // 1. Fix opening tags: < div -> <div, <  span -> <span
    content = content.replace(/<\s+([a-zA-Z0-9]+)/g, '<$1');

    // 2. Fix closing tags: </ div -> </div
    content = content.replace(/<\/\s+([a-zA-Z0-9]+)/g, '</$1');

    // 3. Fix spaces before closing bracket: <div ... > -> <div ...> (Optional but good)
    // Actually dangerous if attribute values needed space? No, inside string attribute it's fine.
    // usage: <div class="foo" > -> <div class="foo">. Browser ignores this space usually.
    // But </div > -> </div> is good to fix.
    content = content.replace(/<\/([a-zA-Z0-9]+)\s+>/g, '</$1>');

    // 4. Fix self-closing: <br /> space is fine.

    fs.writeFileSync('app.js', content, 'utf8');
    console.log("Fixed HTML tags in app.js");
} catch (e) {
    console.error(e);
}
