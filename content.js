console.log("Email writer extension");

// Tone selection dropdown HTML
const TONE_SELECTOR_HTML = `
<div class="tone-selector-popup" style="
    position: absolute;
    bottom: 100%;
    right: auto;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    padding: 12px;
    width: 180px;
    z-index: 1000;
    display: none;
">
    <div style="font-weight: 500; margin-bottom: 8px; color: #202124;">Select Tone</div>
    <label style="display: flex; align-items: center; padding: 8px 0; cursor: pointer;">
        <input type="radio" name="tone" value="Professional" checked style="margin-right: 8px;">
        Professional
    </label>
    <label style="display: flex; align-items: center; padding: 8px 0; cursor: pointer;">
        <input type="radio" name="tone" value="Friendly" style="margin-right: 8px;">
        Friendly
    </label>
    <label style="display: flex; align-items: center; padding: 8px 0; cursor: pointer;">
        <input type="radio" name="tone" value="Formal" style="margin-right: 8px;">
        Formal
    </label>
    <button class="generate-btn" style="
        background: #1a73e8;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        margin-top: 8px;
        width: 100%;
        cursor: pointer;
    ">Generate</button>
</div>
`;

function getEmailContent() {
    const selectors = [
        '.h7',
        '.a3s.aiL',
        '.gmail_quote',
        '[role="presentation"]',
        '.gU.Up'
    ];

    for (const selector of selectors) {
        const content = document.querySelector(selector);
        if (content) {
            return content.innerText.trim();
        }
    }
    return '';
}

function findComposeToolBar() {
    const selectors = [
        '.btc',
        '.aDh',
        '[role="toolbar"]',
        '.gU.Up'
    ];

    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) {
            return toolbar;
        }
    }
    return null;
}

function createAiButton() {
    const button = document.createElement('div');
    button.className = 'T-I J-J5-Ji ai-reply-button T-I-atl L3';
    button.style.cssText = `
        margin-left: 8px;
        padding: 0 16px;
        background: #f1f3f4;
        color: #3c4043;
        border-radius: 4px;
        cursor: pointer;
        height: 36px;
        min-width: 90px;
        font-weight: 500;
        font-size: .875rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: none;
        transition: background 0.15s ease;
        position: relative;
    `;
    
    button.innerHTML = `
        <span style="display: flex; align-items: center; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#5f6368" style="margin-right: 8px;">
                <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0020 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
            </svg>
            AI Reply
        </span>
        ${TONE_SELECTOR_HTML}
    `;

    button.addEventListener('mouseenter', () => {
        button.style.background = '#e8eaed';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.background = '#f1f3f4';
    });
    
    return button;
}

async function generateReplyWithTone(emailContent, tone) {
    try {
        const response = await fetch('http://localhost:8080/api/email/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                emailContent: emailContent,
                tone: tone
            })
        });

        if (!response.ok) throw new Error('API Request Failed');
        return await response.text();
    } catch (error) {
        console.error("Error generating reply:", error);
        throw error;
    }
}

function injectButton() {
    const existingButton = document.querySelector('.ai-reply-button');
    if (existingButton) existingButton.remove();

    const toolbar = findComposeToolBar();
    if (!toolbar) {
        console.log("Toolbar is not found");
        return;
    }

    const button = createAiButton();
    const popup = button.querySelector('.tone-selector-popup');
    const generateBtn = button.querySelector('.generate-btn');

    button.addEventListener('click', (e) => {
        if (e.target.closest('.tone-selector-popup')) return;
        popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
    });

    generateBtn.addEventListener('click', async () => {
        const selectedTone = button.querySelector('input[name="tone"]:checked').value;
        popup.style.display = 'none';
        
        const originalHTML = button.innerHTML;
        button.innerHTML = `
            <span style="display: flex; align-items: center; gap: 8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#5f6368" style="margin-right: 8px;">
                    <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0020 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                </svg>
                Generating ${selectedTone}...
            </span>
            ${TONE_SELECTOR_HTML}
        `;
        button.style.cursor = 'not-allowed';
        button.style.opacity = '0.8';

        try {
            const emailContent = getEmailContent();
            const generatedReply = await generateReplyWithTone(emailContent, selectedTone);
            
            const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');
            if (composeBox) {
                composeBox.focus();
                document.execCommand('insertText', false, generatedReply);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            button.innerHTML = `
                <span style="display: flex; align-items: center; gap: 8px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#5f6368" style="margin-right: 8px;">
                        <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0020 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                    </svg>
                    AI Reply
                </span>
                ${TONE_SELECTOR_HTML}
            `;
            button.style.cursor = 'pointer';
            button.style.opacity = '1';
        }
    });

    document.addEventListener('click', (e) => {
        if (!button.contains(e.target)) {
            popup.style.display = 'none';
        }
    });

    toolbar.appendChild(button);
}

const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposeElements = addedNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE &&
            (node.matches('.aDh, .btc, [role="dialog"]') ||
                node.querySelector('.aDh, .btc, [role="dialog"]'))
        );

        if (hasComposeElements) {
            setTimeout(injectButton, 300);
        }
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});