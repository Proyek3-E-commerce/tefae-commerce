// messages.js

document.addEventListener('DOMContentLoaded', () => {
    const replyButtons = document.querySelectorAll('.reply-btn');
    const messageReplySection = document.querySelector('.message-reply');
    const replyTextarea = messageReplySection.querySelector('textarea');
    const sendButton = messageReplySection.querySelector('.send-btn');
  
    let currentMessageSender = '';
  
    // Show reply section when Reply button is clicked
    replyButtons.forEach((btn) => {
      btn.addEventListener('click', (event) => {
        const messageElement = event.target.closest('.message');
        const senderInfo = messageElement.querySelector('.sender-info p b').textContent;
  
        currentMessageSender = senderInfo;
  
        messageReplySection.style.display = 'block';
        replyTextarea.placeholder = `Replying to ${currentMessageSender}`;
      });
    });
  
    // Handle Send button
    sendButton.addEventListener('click', () => {
      const replyContent = replyTextarea.value.trim();
  
      if (replyContent) {
        alert(`Your reply to ${currentMessageSender} has been sent:\n\n${replyContent}`);
  
        // Clear the textarea and hide the reply section
        replyTextarea.value = '';
        messageReplySection.style.display = 'none';
      } else {
        alert('Please enter a reply before sending.');
      }
    });
  });
  